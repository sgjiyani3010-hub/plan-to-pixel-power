import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in";

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL")!;
  const password = Deno.env.get("SHIPROCKET_PASSWORD")!;

  const res = await fetch(`${SHIPROCKET_BASE}/v1/external/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Shiprocket auth failed: ${errText}`);
  }

  const data = await res.json();
  return data.token;
}

async function shiprocketRequest(
  token: string,
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
) {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${SHIPROCKET_BASE}${endpoint}`, opts);
  const text = await res.text();

  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = callerUser.id;

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...body } = await req.json();
    const srToken = await getShiprocketToken();

    // ---- CREATE ORDER ----
    if (action === "create-order") {
      const { order_id } = body;

      // Fetch order + items + profile
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single();

      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: items } = await supabase
        .from("order_items")
        .select("*, products(name, price)")
        .eq("order_id", order_id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", order.user_id)
        .single();

      const addr = order.shipping_address as Record<string, string> || {};
      const { package_length, package_width, package_height, package_weight } = body;

      const orderItems = (items || []).map((item: any) => ({
        name: item.products?.name || "Product",
        sku: item.product_id.slice(0, 12),
        units: item.quantity,
        selling_price: Number(item.price),
        discount: 0,
        tax: 0,
      }));

      const srPayload = {
        order_id: order_id.slice(0, 20),
        order_date: new Date(order.created_at).toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name: profile?.full_name || "Customer",
        billing_last_name: "",
        billing_address: addr.address_line1 || addr.addressLine1 || "",
        billing_address_2: addr.address_line2 || addr.addressLine2 || "",
        billing_city: addr.city || "",
        billing_pincode: addr.pincode || "",
        billing_state: addr.state || "",
        billing_country: "India",
        billing_email: "",
        billing_phone: profile?.phone || "9999999999",
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "Prepaid",
        sub_total: Number(order.total),
        length: package_length || 10,
        breadth: package_width || 10,
        height: package_height || 5,
        weight: package_weight || 0.5,
      };

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/orders/create/adhoc",
        "POST",
        srPayload
      );

      if (!result.ok) {
        return new Response(JSON.stringify({ error: "Shiprocket create order failed", details: result.data }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Save shipment record
      await supabase.from("order_shipments").insert({
        order_id,
        shiprocket_order_id: String(result.data.order_id),
        shiprocket_shipment_id: String(result.data.shipment_id),
        status: "created",
        package_length: package_length || 10,
        package_width: package_width || 10,
        package_height: package_height || 5,
        package_weight: package_weight || 0.5,
      });

      // Update order status
      await supabase.from("orders").update({ status: "processing" }).eq("id", order_id);

      return new Response(JSON.stringify({ success: true, ...result.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- GET COURIERS ----
    if (action === "get-couriers") {
      const { order_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: order } = await supabase.from("orders").select("shipping_address").eq("id", order_id).single();
      const addr = (order?.shipping_address as Record<string, string>) || {};

      const params = new URLSearchParams({
        pickup_postcode: "110001", // Update with your warehouse pincode
        delivery_postcode: addr.pincode || "110001",
        cod: "0",
        weight: String(shipment.package_weight || 0.5),
      });

      const result = await shiprocketRequest(
        srToken,
        `/v1/external/courier/serviceability/?${params.toString()}`
      );

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- ASSIGN COURIER ----
    if (action === "assign-courier") {
      const { order_id, courier_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/courier/assign/awb",
        "POST",
        {
          shipment_id: [Number(shipment.shiprocket_shipment_id)],
          courier_id: courier_id,
        }
      );

      if (result.ok && result.data?.response?.data?.awb_code) {
        const awbCode = result.data.response.data.awb_code;
        const courierName = result.data.response.data.courier_name || "";

        await supabase
          .from("order_shipments")
          .update({
            awb_code: awbCode,
            courier_id,
            courier_name: courierName,
            status: "ready_to_ship",
            tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
          })
          .eq("order_id", order_id);

        await supabase.from("orders").update({ status: "ready_to_ship" }).eq("id", order_id);
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- GENERATE LABEL ----
    if (action === "generate-label") {
      const { order_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("shiprocket_shipment_id")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/courier/generate/label",
        "POST",
        { shipment_id: [Number(shipment.shiprocket_shipment_id)] }
      );

      if (result.ok && result.data?.label_url) {
        await supabase
          .from("order_shipments")
          .update({ label_url: result.data.label_url, status: "label_generated" })
          .eq("order_id", order_id);
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- GENERATE MANIFEST ----
    if (action === "generate-manifest") {
      const { order_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("shiprocket_shipment_id")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/manifests/generate",
        "POST",
        { shipment_id: [Number(shipment.shiprocket_shipment_id)] }
      );

      if (result.ok && result.data?.manifest_url) {
        await supabase
          .from("order_shipments")
          .update({ manifest_url: result.data.manifest_url })
          .eq("order_id", order_id);
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SCHEDULE PICKUP ----
    if (action === "schedule-pickup") {
      const { order_id, pickup_date } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("shiprocket_shipment_id")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/courier/generate/pickup",
        "POST",
        {
          shipment_id: [Number(shipment.shiprocket_shipment_id)],
          pickup_date: pickup_date || new Date().toISOString().split("T")[0],
        }
      );

      if (result.ok) {
        await supabase
          .from("order_shipments")
          .update({
            pickup_scheduled_at: pickup_date || new Date().toISOString(),
            status: "pickup_scheduled",
          })
          .eq("order_id", order_id);

        await supabase.from("orders").update({ status: "shipped" }).eq("id", order_id);
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- TRACK ----
    if (action === "track") {
      const { order_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("awb_code")
        .eq("order_id", order_id)
        .single();

      if (!shipment?.awb_code) {
        return new Response(JSON.stringify({ error: "No AWB code found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        `/v1/external/courier/track/awb/${shipment.awb_code}`
      );

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- CANCEL ----
    if (action === "cancel") {
      const { order_id } = body;

      const { data: shipment } = await supabase
        .from("order_shipments")
        .select("shiprocket_order_id")
        .eq("order_id", order_id)
        .single();

      if (!shipment) {
        return new Response(JSON.stringify({ error: "Shipment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await shiprocketRequest(
        srToken,
        "/v1/external/orders/cancel",
        "POST",
        { ids: [Number(shipment.shiprocket_order_id)] }
      );

      if (result.ok) {
        await supabase
          .from("order_shipments")
          .update({ status: "cancelled" })
          .eq("order_id", order_id);

        await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Shiprocket function error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
