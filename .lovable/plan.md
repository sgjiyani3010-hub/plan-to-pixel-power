

# Order Fulfillment, Shipping & WhatsApp Notifications Plan

## Overview

Build a complete order processing pipeline: Admin receives order → selects shipping partner via Shiprocket → generates label → tracks shipment → sends WhatsApp notifications to customer and admin at each stage.

---

## 1. Database Changes

### New table: `order_shipments`
Stores shipping/fulfillment data per order.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| shiprocket_order_id | text | Shiprocket's order ID |
| shiprocket_shipment_id | text | Shiprocket's shipment ID |
| courier_name | text | Selected courier partner |
| courier_id | integer | Shiprocket courier ID |
| awb_code | text | Airway bill / tracking number |
| label_url | text | Shipping label PDF URL |
| manifest_url | text | Manifest PDF URL |
| pickup_scheduled_at | timestamptz | |
| estimated_delivery | timestamptz | |
| tracking_url | text | Public tracking link |
| status | text | ready_to_ship, label_generated, pickup_scheduled, in_transit, delivered, rto |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: Admin full access only.

### Alter `orders` table
Add new statuses to support the fulfillment flow. No schema change needed — `status` is already a text field. We'll use these values:
`pending → confirmed → processing → ready_to_ship → shipped → in_transit → out_for_delivery → delivered → cancelled → returned`

### New table: `notification_log`
Track all WhatsApp messages sent.

| Column | Type |
|--------|------|
| id | uuid PK |
| order_id | uuid FK |
| recipient_phone | text |
| template_name | text |
| status | text (sent/failed) |
| created_at | timestamptz |

---

## 2. Shiprocket Integration (Edge Function)

### New edge function: `supabase/functions/shiprocket/index.ts`

Actions the function will handle:

| Action | What it does |
|--------|-------------|
| `authenticate` | Login to Shiprocket API, get/cache token |
| `create-order` | Push order to Shiprocket with items + address |
| `get-couriers` | Fetch available courier partners for a shipment (with rates & ETAs) |
| `assign-courier` | Assign selected courier to the shipment |
| `generate-label` | Get shipping label PDF URL |
| `generate-manifest` | Get manifest PDF |
| `schedule-pickup` | Request courier pickup |
| `track` | Get real-time tracking status |
| `cancel` | Cancel shipment on Shiprocket |

**Secrets needed:** `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` (Shiprocket uses email/password auth to get a token).

### Shiprocket API Flow
```text
Order Confirmed
    │
    ▼
Create Shiprocket Order (POST /v1/external/orders/create/adhoc)
    │
    ▼
Get Available Couriers (GET /v1/external/courier/serviceability)
    │
    ▼
Assign Courier (POST /v1/external/courier/assign/awb)
    │
    ▼
Generate Label (POST /v1/external/courier/generate/label)
    │
    ▼
Generate Manifest (POST /v1/external/manifests/generate)
    │
    ▼
Schedule Pickup (POST /v1/external/courier/generate/pickup)
    │
    ▼
Track Shipment (GET /v1/external/courier/track/awb/{awb})
```

---

## 3. WhatsApp Business API Integration (Edge Function)

### New edge function: `supabase/functions/whatsapp/index.ts`

Uses Meta Cloud API to send template messages.

**Secrets needed:** `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBER`

**Pre-requisite (user must do in Meta Business):** Create approved message templates for:
- `order_confirmed` — sent to customer after payment
- `order_shipped` — sent to customer with tracking link
- `order_delivered` — sent to customer
- `admin_new_order` — sent to admin on new order
- `admin_order_status` — sent to admin on status changes

### Notification triggers (called from other edge functions / admin UI):

| Event | Customer gets | Admin gets |
|-------|--------------|------------|
| Payment confirmed | "Order confirmed" with order ID + summary | "New order" with customer name + total |
| Shipped (AWB assigned) | "Order shipped" with tracking link | "Order shipped" notification |
| Out for delivery | "Out for delivery" message | — |
| Delivered | "Order delivered" confirmation | — |
| Cancelled/Returned | "Order cancelled/returned" | "Order cancelled" alert |

---

## 4. Admin UI — Order Fulfillment Flow

### Enhanced `AdminOrders.tsx` — Order Detail Panel

When admin clicks "View" on an order, show a **step-by-step fulfillment panel** instead of just a simple detail dialog:

**Step 1 — Order Review**
- Order items, customer details, shipping address
- Button: "Accept & Process Order" → status changes to `processing`

**Step 2 — Push to Shiprocket**
- Button: "Create Shipment" → calls shiprocket edge function
- Shows package dimensions form (length, width, height, weight)

**Step 3 — Select Courier**
- Fetches available couriers with rates and ETAs
- Admin picks one → assigns courier → gets AWB code

**Step 4 — Label & Manifest**
- "Generate Label" button → downloads/displays shipping label PDF
- "Generate Manifest" button → downloads manifest
- "Print Label" button (opens in new tab for printing)

**Step 5 — Schedule Pickup**
- Date picker for pickup date
- "Schedule Pickup" button → confirms with Shiprocket

**Step 6 — Tracking**
- Live tracking status display
- Auto-refreshes from Shiprocket API
- Shows tracking timeline (checkpoints)

Each step updates the `order_shipments` table and the order status automatically.

### New component: `OrderFulfillment.tsx`
A stepper/wizard component that shows the current fulfillment stage and available actions.

---

## 5. Shiprocket Webhook for Auto-Tracking Updates

### New edge function: `supabase/functions/shiprocket-webhook/index.ts`

Shiprocket sends webhook events for shipment status changes. This function:
1. Receives the webhook payload
2. Updates `order_shipments` status and `orders` status
3. Triggers WhatsApp notification to customer/admin

Config: `verify_jwt = false` (it's a public webhook endpoint; validate via Shiprocket's webhook signature or IP allowlist).

---

## 6. File Changes Summary

| File | Change |
|------|--------|
| **DB Migration** | Create `order_shipments`, `notification_log` tables |
| `supabase/functions/shiprocket/index.ts` | New — all Shiprocket API calls |
| `supabase/functions/whatsapp/index.ts` | New — Meta WhatsApp Cloud API |
| `supabase/functions/shiprocket-webhook/index.ts` | New — webhook receiver |
| `supabase/functions/razorpay/index.ts` | Edit — trigger WhatsApp on payment verified |
| `supabase/config.toml` | Add 3 new functions with `verify_jwt = false` |
| `src/pages/admin/AdminOrders.tsx` | Major rewrite — add fulfillment stepper UI |
| `src/components/admin/OrderFulfillment.tsx` | New — fulfillment wizard component |
| **Secrets to add** | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBER` |

---

## 7. Implementation Order

1. Add secrets (Shiprocket + WhatsApp credentials)
2. Database migration (order_shipments, notification_log)
3. Shiprocket edge function
4. WhatsApp edge function
5. Shiprocket webhook edge function
6. Update razorpay function to trigger notifications
7. Build admin fulfillment UI (OrderFulfillment component + AdminOrders rewrite)

