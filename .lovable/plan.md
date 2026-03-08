

# Fix: Shiprocket "Please add billing/shipping address first" Error

## Root Cause
The Shiprocket API returns `400: "Please add billing/shipping address first"` because the edge function sends `billing_email: ""` (hardcoded empty string on line 155). Shiprocket requires a non-empty email. The customer's email is available from `auth.users` but never fetched.

Additionally, the `billing_phone` falls back to `"9999999999"` because the profile's phone is null (the shipping address JSON has the phone, but the code only checks `profile?.phone`).

## Changes

### 1. Fix edge function (`supabase/functions/shiprocket/index.ts`)
In the `create-order` action:
- Fetch the user's email from `supabase.auth.admin.getUserById(order.user_id)` to get the actual email
- Use `addr.phone` as phone fallback (shipping address stores phone)
- Set `billing_email` to the user's actual email instead of empty string

```typescript
// After fetching profile, get user email
const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
const userEmail = userData?.user?.email || "";

// In srPayload:
billing_email: userEmail,
billing_phone: addr.phone || profile?.phone || "9999999999",
```

### 2. Fix auth check (`getClaims` → `getUser`)
Line 76 uses `supabase.auth.getClaims(token)` which is not a standard Supabase JS method. Replace with:
```typescript
const { data: { user: callerUser }, error: authError } = await supabase.auth.getUser(token);
if (authError || !callerUser) { return 401 }
const userId = callerUser.id;
```

These two fixes should resolve the 400 error and allow shipment creation to succeed.

