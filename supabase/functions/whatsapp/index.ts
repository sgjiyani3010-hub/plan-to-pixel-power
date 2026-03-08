import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: string[];
}

async function sendWhatsAppTemplate({ to, templateName, languageCode = "en", parameters = [] }: SendTemplateParams) {
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;

  const components: any[] = [];
  if (parameters.length > 0) {
    components.push({
      type: "body",
      parameters: parameters.map((p) => ({ type: "text", text: p })),
    });
  }

  const payload: any = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (components.length > 0) {
    payload.template.components = components;
  }

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.text();
  return { ok: res.ok, status: res.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const adminPhone = Deno.env.get("ADMIN_WHATSAPP_NUMBER") || "";

    const { action, order_id, customer_phone, template_name, parameters, custom_to } = await req.json();

    // For internal calls (from other edge functions), no auth needed if called server-side
    // For admin UI calls, verify auth
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- SEND TO CUSTOMER ----
    if (action === "send-customer") {
      if (!customer_phone || !template_name) {
        return new Response(JSON.stringify({ error: "Missing customer_phone or template_name" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await sendWhatsAppTemplate({
        to: customer_phone,
        templateName: template_name,
        parameters: parameters || [],
      });

      // Log notification
      await supabase.from("notification_log").insert({
        order_id: order_id || null,
        recipient_phone: customer_phone,
        template_name,
        status: result.ok ? "sent" : "failed",
        error_message: result.ok ? null : result.data,
      });

      return new Response(JSON.stringify({ success: result.ok, data: result.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SEND TO ADMIN ----
    if (action === "send-admin") {
      if (!adminPhone) {
        return new Response(JSON.stringify({ error: "Admin phone not configured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await sendWhatsAppTemplate({
        to: adminPhone,
        templateName: template_name,
        parameters: parameters || [],
      });

      await supabase.from("notification_log").insert({
        order_id: order_id || null,
        recipient_phone: adminPhone,
        template_name,
        status: result.ok ? "sent" : "failed",
        error_message: result.ok ? null : result.data,
      });

      return new Response(JSON.stringify({ success: result.ok, data: result.data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- SEND TO BOTH ----
    if (action === "send-both") {
      const results: any = {};

      if (customer_phone) {
        const customerResult = await sendWhatsAppTemplate({
          to: customer_phone,
          templateName: template_name,
          parameters: parameters || [],
        });

        await supabase.from("notification_log").insert({
          order_id: order_id || null,
          recipient_phone: customer_phone,
          template_name,
          status: customerResult.ok ? "sent" : "failed",
          error_message: customerResult.ok ? null : customerResult.data,
        });

        results.customer = { success: customerResult.ok };
      }

      if (adminPhone) {
        const adminResult = await sendWhatsAppTemplate({
          to: adminPhone,
          templateName: template_name,
          parameters: parameters || [],
        });

        await supabase.from("notification_log").insert({
          order_id: order_id || null,
          recipient_phone: adminPhone,
          template_name: `admin_${template_name}`,
          status: adminResult.ok ? "sent" : "failed",
          error_message: adminResult.ok ? null : adminResult.data,
        });

        results.admin = { success: adminResult.ok };
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("WhatsApp function error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
