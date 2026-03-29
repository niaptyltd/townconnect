# Deployment Readiness Audit

## Current backend modes

- `firebase`: enabled when all `NEXT_PUBLIC_FIREBASE_*` values are present.
- `demo`: enabled only when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` and Firebase client config is missing.
- `unconfigured`: everything else. In this mode auth, admin mutations, and client collection reads now fail closed instead of silently falling back.

## Demo-mode dependencies audit

### Already isolated in code

- `services/auth-service.ts`
  - Demo auth now runs only when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`.
  - Login and registration fail closed in unconfigured environments.
- `app/api/session/route.ts`
  - Session creation now returns a clear `503` if Firebase Admin is missing or the app is unconfigured.
- `lib/demo-store.ts`
  - Client demo data access is explicitly blocked unless demo mode is enabled.
- `lib/server/collection-store.ts`
  - Server-side admin data no longer falls back to `.demo-server-store.json` unless demo mode is explicitly enabled.
- `components/forms/login-form.tsx`
  - Demo credentials are hidden unless demo mode is enabled.
- `components/forms/register-form.tsx`
  - Town onboarding now reads from managed town data instead of hard-coded seed towns.
- `app/(owner)/dashboard/business/edit/page.tsx`
  - New business creation no longer clones a seeded business record.
- `components/sections/featured-businesses.tsx`
  - No longer shows seeded featured businesses when Firebase returns an empty collection.
- `components/sections/sponsored-businesses.tsx`
  - No longer shows seeded sponsored businesses when Firebase returns an empty collection.
- `components/sections/managed-banner-strip.tsx`
  - No longer shows seeded banners when Firebase returns an empty collection.

### Remaining seed-backed production risks

- `lib/demo-store.ts`
  - Seed data still exists for explicit demo mode only.
- `lib/server/collection-store.ts`
  - Seed-backed server storage still exists for explicit demo mode only.
- `scripts/seed-firestore.ts`
  - Seed data remains the source for optional Firestore bootstrapping.

### Remaining pilot-incomplete discovery risks

- Public directory search is Firestore-backed, but it still does in-memory keyword matching over fetched businesses, services, and products.
- Banner placements are live, but still client-rendered through Firestore reads and therefore depend on public read rules.
- Homepage stats and testimonials remain marketing placeholders rather than analytics-backed values.
- Payment flows remain placeholder-only.

## What must be disabled or changed for production

- Set `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`.
- Set all Firebase client credentials.
- Set Firebase Admin credentials for session verification and admin/server mutations.
- Seed real towns, categories, businesses, banners, services, and products into Firestore before exposing pilot traffic.
- Decide whether public banner reads should stay client-side or move behind server rendering for stricter control.

## Production environment checklist

- `NEXT_PUBLIC_SITE_URL`
  - Public canonical base URL, for example `https://townconnect.co.za`.
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
  - Must stay false for live pilot environments.
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
  - Store with newline escaping supported by the existing config loader.
- `SESSION_SECRET`
  - Required in production for signed session cookies.

## Firebase services that must be enabled

- Firebase Authentication
  - Enable Email/Password sign-in.
  - Add your live domains to Authorized Domains.
- Cloud Firestore
  - Use Native mode.
  - Deploy hardened security rules before pilot testing.
- Firebase Storage
  - Required for media uploads once owner/admin upload flows are enabled against real storage.
- Firebase Admin / service account
  - Required for secure session verification and all server-side admin mutation handlers.

## Firestore assumptions

- Documents store ISO string timestamps, not Firestore `Timestamp` values.
- User documents are expected at `users/{uid}` immediately after registration.
- Business owner, admin, and customer dashboards rely on equality filters such as `ownerId == uid`, `businessId == ...`, `customerId == ...`, and `email == ...`.
- Admin APIs assume they can read and write every admin-managed collection from the server via Admin SDK.
- There is no dedicated full-text search index yet. Public search currently works by loading the active catalog from Firestore and filtering in-memory.

## Storage assumptions

- Remote images currently allow `firebasestorage.googleapis.com`, `storage.googleapis.com`, and Unsplash.
- Upload flows assume download URLs can be stored directly on documents.
- Storage rules still need to be aligned with owner/admin upload permissions before launch.

## Vercel and Firebase Hosting notes

### Vercel

- App Router server routes and Firebase Admin usage are compatible.
- Missing Firebase Admin env vars will now break login session sync and admin writes with explicit `503` errors instead of silent fallbacks.
- A Linux build environment is recommended because this local Windows machine still hits the known Next/SWC runtime issue.

### Firebase Hosting

- Plain static Firebase Hosting is not enough for this app because it uses App Router server routes and admin APIs.
- Use Firebase App Hosting or another SSR-capable deployment target, or pair Hosting with a compatible SSR backend.

## Production blockers

- Manual end-to-end testing has not yet been automated.
- Real Firebase Storage upload permissions and rules are not fully validated.
- Payment flows remain placeholder-only.
- This workstation still cannot verify `next build` because of the local Next/SWC Windows runtime issue.

## Recommended launch sequence

1. Provision the Firebase project and enable Auth, Firestore, Storage, and Admin credentials.
2. Deploy hardened Firestore rules and test every role against live data.
3. Seed live pilot data into Firestore, including at least one admin user and real towns/categories.
4. Validate the public directory pages against that live data set.
5. Run the manual test plan in `docs/manual-test-plan.md`.
6. Deploy from a Linux CI or Vercel environment.
7. Open the pilot first to internal/admin users, then a small owner cohort, then public browsing traffic.

## Fastest path to a live MVP pilot

- Use Vercel as the first deployment target.
- Keep demo mode disabled.
- Seed real Firestore data and create admin accounts manually.
- Validate public read rules so search, towns, categories, and banners work for guests.
- Pilot the owner/admin workflows first, then expand to public browsing once the live catalog is populated and tested.
