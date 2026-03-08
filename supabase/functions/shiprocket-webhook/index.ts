import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

// Map Shiprocket status codes to our statuses
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log("Shiprocket webhook payload:", JSON.stringify(payload));

    const awb = payload.awb;
    const currentStatusId = payload.current_status_id;
    const etd = payload.etd;

    if (!awb) {
      return new Response(JSON.stringify({ error: "Missing AWB" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find shipment by AWB
    const { data: shipment } = await supabase
      .from("order_shipments")
      .select("*, orders(id, user_id)")
      .eq("awb_code", awb)
      .single();

    if (!shipment) {
      console.log("No shipment found for AWB:", awb);
      return new Response(JSON.stringify({ ok: true, message: "No matching shipment" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusInfo = STATUS_MAP[currentStatusId];
    if (statusInfo) {
      // Update shipment status
      const shipmentUpdate: Record<string, unknown> = { status: statusInfo.shipment };
      if (etd) shipmentUpdate.estimated_delivery = etd;

      await supabase
        .from("order_shipments")
        .update(shipmentUpdate)
        .eq("id", shipment.id);

      // Update order status
      await supabase
        .from("orders")
        .update({ status: statusInfo.order })
        .eq("id", shipment.order_id);

      // Send WhatsApp notification for key events
      const notifyStatuses = ["in_transit", "out_for_delivery", "delivered", "rto"];
      if (notifyStatuses.includes(statusInfo.shipment)) {
        // Get customer phone
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
            // Call WhatsApp function internally
            try {
              const whatsappUrl = `${supabaseUrl}/functions/v1/whatsapp`;
              await fetch(whatsappUrl, {
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
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
