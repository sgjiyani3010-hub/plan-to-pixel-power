
# Complete Website: Customize Section + Policy Pages

## Current State
- **DesignerPage**: Already has color selection, text/image upload, drag positioning, and add to cart at ₹799. Missing: **size selection** before adding to cart.
- **ContactPage**: Complete with form + database storage.
- **AboutPage**: Complete with brand story, values, team.
- **Missing pages**: Track Order, Return & Exchange Policy, Shipping Policy, FAQ, Privacy Policy.
- **Footer**: Links exist but point to `/` - need to update to actual routes.

---

## Changes

### 1. Enhance DesignerPage (`src/pages/DesignerPage.tsx`)
- Add size selector (S, M, L, XL, XXL) above the "Add to Cart" button
- Pass selected size to cart item
- Add print position indicator (front/back selector or visual guide)

### 2. Create New Pages

**TrackOrderPage** (`src/pages/TrackOrderPage.tsx`)
- Input field for Order ID
- Fetch order + shipment status from database
- Display order timeline with statuses

**ReturnPolicyPage** (`src/pages/ReturnPolicyPage.tsx`)
- 7-day return policy content
- Eligibility conditions
- Return process steps
- Contact info for returns

**ShippingPolicyPage** (`src/pages/ShippingPolicyPage.tsx`)
- Delivery timelines (3-7 business days)
- Shipping partners (Shiprocket)
- COD availability
- Shipping charges info

**FAQPage** (`src/pages/FAQPage.tsx`)
- Accordion-style FAQ sections
- Categories: Orders, Shipping, Returns, Sizing, Custom Prints

**PrivacyPolicyPage** (`src/pages/PrivacyPolicyPage.tsx`)
- Data collection practices
- Cookie policy
- User rights
- Contact for privacy concerns

### 3. Update Routing (`src/App.tsx`)
Add routes for all new pages:
- `/track-order`
- `/return-policy`
- `/shipping-policy`
- `/faq`
- `/privacy-policy`

### 4. Update Footer (`src/components/Footer.tsx`)
Update Help section links to point to actual routes instead of `/`

---

## Technical Notes
- Track Order page will query `orders` and `order_shipments` tables (RLS allows users to view own orders)
- All policy pages are static content - no database needed
- Use existing Accordion component for FAQ
- Consistent styling with existing pages (Navbar + Footer + motion animations)
