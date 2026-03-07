import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...body } = await req.json();

    if (action === "create-order") {
      const { items, shipping_address, coupon_code, discount } = body;

      // Calculate total from DB prices to prevent tampering
      const productIds = items.map((i: any) => i.product_id);
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("id, price")
        .in("id", productIds);

      if (prodError || !products) {
        return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const priceMap: Record<string, number> = {};
      for (const p of products) priceMap[p.id] = Number(p.price);

      let subtotal = 0;
      for (const item of items) {
        const price = priceMap[item.product_id];
        if (!price) {
          return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        subtotal += price * item.quantity;
      }

      const shipping = subtotal >= 999 ? 0 : 79;
      const discountAmount = discount || 0;
      const total = subtotal + shipping - discountAmount;

      // Create Razorpay order
      const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${razorpayAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // paise
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });

      if (!rzpResponse.ok) {
        const errText = await rzpResponse.text();
        console.error("Razorpay error:", errText);
        return new Response(JSON.stringify({ error: "Failed to create Razorpay order" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rzpOrder = await rzpResponse.json();

      // Create order in DB with pending status
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          status: "pending",
          shipping_address,
          coupon_code: coupon_code || null,
          discount: discountAmount,
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error("Order insert error:", orderError);
        return new Response(JSON.stringify({ error: "Failed to create order" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: priceMap[item.product_id],
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) console.error("Order items error:", itemsError);

      return new Response(
        JSON.stringify({
          razorpay_order_id: rzpOrder.id,
          razorpay_key_id: razorpayKeyId,
          order_id: order.id,
          amount: rzpOrder.amount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify-payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

      // Verify signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(razorpayKeySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const message = `${razorpay_order_id}|${razorpay_payment_id}`;
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature !== razorpay_signature) {
        // Payment verification failed, mark as cancelled
        await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);
        return new Response(JSON.stringify({ error: "Payment verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Payment verified, update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", order_id);

      if (updateError) {
        console.error("Order update error:", updateError);
      }

      return new Response(
        JSON.stringify({ success: true, order_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
