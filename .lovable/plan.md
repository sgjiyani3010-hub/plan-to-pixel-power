

# Admin Panel — Full Implementation Plan

## Current State

The project already has:
- **Auth system** with login/signup, `useAuth` context, `useAdmin` hook (checks `user_roles` via `has_role` RPC)
- **AdminLayout** with sidebar (Dashboard, Products, Orders)
- **AdminProducts** — basic CRUD for products (no variation management inline)
- **AdminOrders** — order list with status updates and detail view
- **AdminDashboard** — stat cards + recent orders
- **Database tables**: products, product_variations, orders, order_items, profiles, user_roles, contact_messages, wishlists

## What's Missing

1. **Role-based redirect after login** — currently always navigates to `/`
2. **Variation management** — no UI to add/edit/delete product variations from admin
3. **Reports & Analytics** page
4. **Customer management** page
5. **Coupon/Discount management**
6. **Contact messages** management
7. **Site settings/configuration** page
8. **Image upload** for products (currently just URL input)
9. **Bulk actions** and search/filter on admin tables

---

## Implementation Plan

### 1. Role-Based Redirect on Login

**File:** `src/pages/AuthPage.tsx`

After successful `signIn`, check admin role via `supabase.rpc('has_role', ...)`. If admin, navigate to `/admin`; otherwise navigate to `/`.

### 2. Product Variation Management

**File:** `src/pages/admin/AdminProducts.tsx`

- Add a "Manage Variations" button per product row
- Open a dialog/panel showing existing variations for that product (fetched from `product_variations`)
- Form to add new variation: color (text), name (text), image URL
- Edit/delete existing variations
- No schema changes needed — `product_variations` table already exists

### 3. Image Upload via Storage

**Database:** Create a storage bucket `product-images` with public read access.

**Files:** Update product form and variation form to include a file upload input alongside the URL field. Upload to storage bucket, get public URL, store in DB.

### 4. Reports & Analytics Page

**New file:** `src/pages/admin/AdminReports.tsx`

- Revenue over time chart (using recharts, already installed)
- Orders by status breakdown (pie/bar chart)
- Top-selling products table
- Date range filter
- Data sourced from `orders` and `order_items` tables via aggregate queries

**Route:** `/admin/reports`

### 5. Customer Management Page

**New file:** `src/pages/admin/AdminCustomers.tsx`

- List all profiles (already accessible via admin RLS policy)
- Show name, email, phone, city, order count
- View customer detail: profile info + their order history
- Search/filter by name or email

**Route:** `/admin/customers`

### 6. Coupon/Discount Management

**Database migration:** Create `coupons` table:
```sql
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
-- Admin full access, public can validate codes
```

**New file:** `src/pages/admin/AdminCoupons.tsx` — CRUD for coupons with code, type, value, expiry, usage limits.

**Route:** `/admin/coupons`

### 7. Contact Messages Management

**New file:** `src/pages/admin/AdminMessages.tsx`

- List all contact messages (admin RLS already exists)
- View message detail in dialog
- Mark as read/responded (add `status` column to `contact_messages`)

**Database migration:** Add `status` column:
```sql
ALTER TABLE public.contact_messages ADD COLUMN status text DEFAULT 'unread';
```

**Route:** `/admin/messages`

### 8. Site Settings / Configuration

**Database migration:** Create `site_settings` table:
```sql
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Admin can read/write, public can read
```

**New file:** `src/pages/admin/AdminSettings.tsx`

- Store name, logo URL, contact email, social links
- Shipping fee configuration
- Flash sale toggle and settings
- Tax rate

**Route:** `/admin/settings`

### 9. Updated Sidebar & Routes

**File:** `src/components/admin/AdminSidebar.tsx` — Add new nav items: Reports, Customers, Coupons, Messages, Settings.

**File:** `src/App.tsx` — Add routes for all new admin pages.

### 10. Search, Filter & Bulk Actions on Admin Tables

- Add search input + category/status filters to Products and Orders pages
- Add pagination (client-side initially, DB-level if data grows)
- Bulk status update for orders
- Toggle product active/inactive inline

---

## Summary of Changes

| Area | Type | Files |
|------|------|-------|
| Login redirect | Code edit | `AuthPage.tsx` |
| Variation management | Code edit | `AdminProducts.tsx` |
| Image upload | Migration + code | Storage bucket + product forms |
| Reports page | New page | `AdminReports.tsx` |
| Customers page | New page | `AdminCustomers.tsx` |
| Coupons | Migration + new page | `coupons` table + `AdminCoupons.tsx` |
| Messages | Migration + new page | `contact_messages` alter + `AdminMessages.tsx` |
| Site settings | Migration + new page | `site_settings` table + `AdminSettings.tsx` |
| Sidebar + routes | Code edit | `AdminSidebar.tsx`, `App.tsx` |
| Table UX | Code edit | Products + Orders pages |

