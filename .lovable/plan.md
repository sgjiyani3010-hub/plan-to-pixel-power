

# Fix: Admin Panel Access for Logged-In Admins

## Problem
When an admin is already logged in and on the homepage, there's no way to navigate to `/admin`. The admin redirect only happens at login time in `AuthPage.tsx`. If the page reloads or the admin navigates away, they're stuck on the storefront.

## Changes

### 1. Add Admin Link to Navbar (`src/components/Navbar.tsx`)
- Import `useAdmin` hook
- When `isAdmin` is true, show an "Admin" link (e.g., a shield/settings icon or text link) in the navbar icon area that navigates to `/admin`
- Only renders for admin users, invisible to regular customers

### 2. (Optional) Auto-redirect on Homepage (`src/pages/Index.tsx`)
- If the logged-in user is an admin, optionally show a banner or auto-redirect to `/admin`
- However, the navbar link alone should be sufficient — admins may want to view the storefront too

The simplest fix is just adding the admin link to the Navbar. One small addition, no database changes needed.

