import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in";

const STATUS_MAP: Record<number, { shipment: string; order: string }> = {
  1: { shipment: "pickup_scheduled", order: "shipped" },
  2: { shipment: "picked_up", order: "shipped" },
  3: { shipment: "in_transit", order: "in_transit" },
  4: { shipment: "in_transit", order: "in_transit" },
  5: { shipment: "out_for_delivery", order: "out_for_delivery" },
  6: { shipment: "delivered", order: "delivered" },
  7: { shipment: "rto", order: "returned" },
  8: { shipment: "cancelled", order: "cancelled" },
};

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL")!;
  const password = Deno.env.get("SHIPROCKET_PASSWORD")!;

  const res = await fetch(`${SHIPROCKET_BASE}/v1/external/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(`Shiprocket auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if a specific shipment_id was provided
    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* no body is fine */ }
    const singleShipmentId = body.shipment_id as string | undefined;

    let shipments: any[];

    if (singleShipmentId) {
      // Poll a single shipment by ID
      const { data, error } = await supabase
        .from("order_shipments")
        .select("*, orders(id, user_id)")
        .eq("id", singleShipmentId)
        .not("awb_code", "is", null);
      if (error) throw error;
      shipments = data || [];
    } else {
      // Get all active (non-terminal) shipments with AWB codes
      const terminalStatuses = ["delivered", "cancelled", "rto"];
      const { data, error } = await supabase
        .from("order_shipments")
        .select("*, orders(id, user_id)")
        .not("awb_code", "is", null)
        .not("status", "in", `(${terminalStatuses.join(",")})`);
      if (error) throw error;
      shipments = data || [];
    }

    if (shipments.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No shipments to poll", updated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getShiprocketToken();
    let updated = 0;

    for (const shipment of shipments) {
      try {
        const res = await fetch(
          `${SHIPROCKET_BASE}/v1/external/courier/track/awb/${shipment.awb_code}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
          console.error(`Track failed for AWB ${shipment.awb_code}: ${res.status}`);
          continue;
        }

        const trackData = await res.json();
        const currentStatusId = trackData?.tracking_data?.shipment_status;
        const etd = trackData?.tracking_data?.etd;

        if (!currentStatusId) continue;

        const statusInfo = STATUS_MAP[currentStatusId];
        if (!statusInfo || statusInfo.shipment === shipment.status) continue;

        // Status changed — update
        const shipmentUpdate: Record<string, unknown> = { status: statusInfo.shipment };
        if (etd) shipmentUpdate.estimated_delivery = etd;

        await supabase
          .from("order_shipments")
          .update(shipmentUpdate)
          .eq("id", shipment.id);

        await supabase
          .from("orders")
          .update({ status: statusInfo.order })
          .eq("id", shipment.order_id);

        updated++;

        // Send WhatsApp notification for key events
        const notifyStatuses = ["in_transit", "out_for_delivery", "delivered", "rto"];
        if (notifyStatuses.includes(statusInfo.shipment)) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("phone")
            .eq("user_id", (shipment as any).orders?.user_id)
            .single();

          if (profile?.phone) {
            const templateMap: Record<string, string> = {
              in_transit: "order_shipped",
              out_for_delivery: "order_shipped",
              delivered: "order_delivered",
              rto: "order_delivered",
            };

            const templateName = templateMap[statusInfo.shipment];
            if (templateName) {
              try {
                await fetch(`${supabaseUrl}/functions/v1/whatsapp`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${supabaseServiceKey}`,
                  },
                  body: JSON.stringify({
                    action: "send-both",
                    order_id: shipment.order_id,
                    customer_phone: profile.phone,
                    template_name: templateName,
                    parameters: [
                      shipment.order_id.slice(0, 8),
                      shipment.courier_name || "Courier",
                      shipment.tracking_url || "",
                    ],
                  }),
                });
              } catch (e) {
                console.error("WhatsApp notification error:", e);
              }
            }
          }
        }
      } catch (e) {
        console.error(`Error polling shipment ${shipment.id}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, polled: shipments.length, updated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Poll error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
