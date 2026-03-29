# Manual Test Plan

## Preconditions

- Deploy to a staging or pilot environment with `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`.
- Configure all Firebase client and admin environment variables.
- Seed at least:
  - one admin user
  - one customer
  - one business owner
  - one town
  - multiple categories
  - one plan per tier

## Guest browsing

### Home and public marketing

1. Load `/`.
2. Confirm the hero, category section, featured/sponsored sections, towns section, and footer render without console/runtime errors.
3. Confirm banner placements render only when active banners exist.
4. Confirm no demo credentials or demo copy appear.

### Public directory

1. Visit `/search`.
2. Search by keyword, town, and category.
3. Toggle featured, open now, delivery, pickup, and bookings filters.
4. Visit `/town/[townSlug]`.
5. Visit `/town/[townSlug]/category/[categorySlug]`.
6. Visit `/business/[businessSlug]`.
7. Confirm WhatsApp, call, and email CTAs are present on eligible businesses.

## Customer registration and login

1. Register a new customer on `/register`.
2. Confirm the user document is created in Firestore with the expected role and town/province.
3. Confirm login succeeds on `/login`.
4. Refresh the browser and confirm the session persists.
5. Sign out and confirm protected account routes redirect to login.
6. Manually expire the session cookie and confirm the login page shows the expired-session message.

## Business owner registration and login

1. Register a new business owner on `/register`.
2. Confirm the user lands on `/dashboard`.
3. Refresh the browser and confirm the owner session persists.
4. Confirm an owner cannot access `/admin`.

## Business creation and editing

1. As a business owner, open `/dashboard/business/edit`.
2. Confirm loading and error states behave correctly if town/category/platform data is unavailable.
3. Create a new business using real town/category options.
4. Save the business.
5. Confirm protected fields such as featured, sponsored, verification, and subscription state are not owner-editable.
6. Confirm gallery, bookings, and payments toggles follow plan restrictions.

## Service CRUD

1. Open `/dashboard/services`.
2. Create a service.
3. Confirm the service appears in the list.
4. Archive the service.
5. Repeat until the plan limit is reached and confirm the UI blocks creation with an upgrade prompt.
6. Confirm the data layer also blocks over-limit creation attempts.

## Product CRUD

1. Open `/dashboard/products`.
2. Create a product.
3. Confirm the product appears in the list.
4. Archive the product.
5. Repeat until the plan limit is reached and confirm the UI blocks creation with an upgrade prompt.
6. Confirm the data layer also blocks over-limit creation attempts.

## Enquiry submission

1. As a guest, submit an enquiry from a business page.
2. Confirm the enquiry is created with the expected business linkage and lead metadata.
3. As an authenticated customer, submit another enquiry.
4. Confirm `customerId`, email, phone, referral fields, and WhatsApp fields persist correctly.
5. As a business owner, open `/dashboard/enquiries` and update the enquiry status.

## Booking submission

1. Submit a booking from a business page with bookings enabled.
2. Confirm the booking is created with `pending` status.
3. As an authenticated customer, confirm the booking appears in `/account/bookings`.
4. As a business owner, open `/dashboard/bookings` and accept, decline, and complete bookings.
5. Confirm a customer can only cancel their own booking.

## Admin approval and rejection

1. Sign in as an admin.
2. Open `/admin/businesses`.
3. Approve a pending listing.
4. Reject a listing.
5. Suspend and unsuspend a listing.
6. Confirm each action writes an `activity_logs` entry.

## Admin feature and sponsor actions

1. From `/admin/businesses`, toggle featured status for an eligible business.
2. Confirm ineligible plan states are blocked.
3. Toggle sponsored status for an eligible business.
4. Confirm the activity log captures the actor, entity, and action metadata.

## Plan changes

1. Open `/admin/plans`.
2. Update pricing, copy, and plan limits.
3. Confirm the change writes an `activity_logs` entry.
4. Confirm owner dashboards show updated upgrade prompts and plan restrictions.

## Banner management

1. Open `/admin/banners`.
2. Create a banner for each placement used in the MVP.
3. Update a banner.
4. Activate and deactivate banners.
5. Confirm every mutation writes an `activity_logs` entry.

## Settings updates

1. Open `/admin/settings`.
2. Update platform support contact data.
3. Update featured/sponsored and plan-related settings.
4. Confirm the update writes an `activity_logs` entry.
5. Confirm owner and public surfaces respect the changed settings where implemented.

## Users, towns, and categories

1. Open `/admin/users`.
2. Activate and deactivate users, excluding your own admin account.
3. Open `/admin/towns`.
4. Create, edit, enable, and disable towns.
5. Open `/admin/categories`.
6. Create, edit, enable, and disable categories.
7. Confirm every admin mutation writes an `activity_logs` entry.

## Session and permissions

1. Confirm guests cannot access `/account`, `/dashboard`, or `/admin`.
2. Confirm customers cannot access owner/admin routes.
3. Confirm owners cannot access admin routes.
4. Confirm admins can access admin routes.
5. Confirm expired admin API requests redirect to `/login?reason=session_expired`.
6. Confirm forbidden admin API requests redirect to `/forbidden`.

## Sign-off checklist

- No demo banners, demo accounts, or seeded fallback content appears unintentionally.
- All admin-critical writes go through server-side handlers.
- Firestore documents match expected schemas after create/update flows.
- Activity logs exist for admin mutations.
- Role routing and session expiry behavior are clear to the user.
- Public directory behavior has been validated against real Firestore data, not only seed data.
