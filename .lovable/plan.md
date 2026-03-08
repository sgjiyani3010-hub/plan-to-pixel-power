

# Add Manual "Refresh Tracking" Button

## What's needed

The existing "Refresh" button on step 5 only calls the Shiprocket `track` action (read-only, doesn't update DB or trigger notifications). We need a button that triggers the full poll logic — updating the shipment status in the database and sending WhatsApp notifications if the status changed.

## Changes

### 1. Update `supabase/functions/shiprocket-poll/index.ts`
Add support for an optional `shipment_id` body parameter. When provided, poll only that single shipment instead of all active shipments. This avoids polling everything when the admin just wants to refresh one order.

### 2. Update `src/components/admin/OrderFulfillment.tsx`
- Replace the existing "Refresh" button's `handleTrack` with a new `handleRefreshTracking` function that:
  1. Calls `shiprocket-poll` with `{ shipment_id: shipment.id }`
  2. Re-fetches the shipment from DB to get the updated status
  3. Also fetches tracking data from shiprocket `track` action for the timeline display
  4. Shows a toast with the result (e.g., "Status updated to in_transit" or "No status change")
- Keep the tracking timeline display as-is

This gives the admin a single button that does the full cycle: poll Shiprocket → update DB → trigger notifications → refresh UI.

