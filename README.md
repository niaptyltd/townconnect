# TownConnect

TownConnect is a production-minded MVP for a mobile-first local business directory, booking and commerce platform built for South African towns, starting with Vryheid in KwaZulu-Natal and designed to scale to multiple towns from day one.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore
- Firebase Storage
- React Hook Form + Zod

## Project structure

```text
app/                  Routes, layouts, SEO files
components/           Shared UI, sections, forms and dashboard modules
constants/            Navigation, plans and platform constants
firebase/             Client and admin Firebase setup
hooks/                Auth and collection hooks
lib/                  Auth context, metadata, schemas, seed data, Firestore helpers
services/             Directory, auth, booking, enquiry, admin and payment services
styles/               Brand tokens
types/                Core TypeScript domain models
utils/                Formatting, slug and plan helpers
scripts/              Firestore seed script
```

## What is implemented

- Public marketing pages: home, about, contact, pricing, list-your-business
- Directory pages: search, town, category and business profile routes
- Auth scaffolding: login, register, protected layouts and session-aware navigation
- Customer area: overview, bookings, enquiries and profile
- Business owner dashboard: overview, profile, business, business edit, services, products, bookings, enquiries, subscription, analytics, settings
- Admin dashboard: overview, businesses, business detail, users, towns, categories, plans, banners, bookings, enquiries, settings, activity
- Multi-town-ready data model using the exact top-level Firestore collections requested
- Seed data for Vryheid, 14 categories and 8 realistic sample businesses
- Payment-provider abstraction with a placeholder upgrade flow ready for PayFast, Yoco or Ozow later

## Demo mode

Demo mode is explicit. It only runs when:

- Firebase client config is missing, and
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`

If demo mode is disabled and Firebase is not configured, TownConnect now fails closed instead of silently using fake data.

Demo accounts:

- Customer: `customer@townconnect.co.za` / `TownConnect123!`
- Business owner: `owner@townconnect.co.za` / `TownConnect123!`
- Admin: `admin@townconnect.co.za` / `TownConnect123!`

This makes the MVP runnable before backend credentials are connected.

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL`.
4. Set `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` for real environments.
5. Add Firebase web app credentials for client auth, Firestore and storage.
6. Add Firebase Admin credentials for secure sessions, admin APIs and seeding.
7. Start the app.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase setup

### Client

Populate the `NEXT_PUBLIC_FIREBASE_*` values from your Firebase project settings.

### Admin and server routes

Populate:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Then run:

```bash
npm run seed
```

The seed script writes the collections defined in `lib/seed-data.ts` into Firestore.

## Firestore security

Use `firestore.rules.example` as a starting point. Before production rollout, tighten the business-owner write rules for:

- services
- products
- bookings
- enquiries
- subscriptions
- activity logs

The current example is intentionally readable and should be hardened alongside your final Firebase auth/session strategy.

## Deployment

- Deployment audit: `docs/deployment-readiness.md`
- Manual pilot test plan: `docs/manual-test-plan.md`

### Vercel

1. Import the project into Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy.

### Firebase Hosting

This codebase is also Firebase Hosting ready once you add your preferred build/output pipeline for Next.js.

## Product notes

- The architecture is multi-town even though only Vryheid is seeded.
- Public pages are SEO-friendly and use clean URLs such as `/town/vryheid` and `/business/vryheid-grill-house`.
- Monetization logic is scaffolded with plan limits, featured eligibility, analytics gating and a payment abstraction layer.
- Several management flows are intentionally MVP-level but functional in demo mode and ready to connect to Firestore for production workflows.

## Next recommended steps

- Replace the remaining seed-backed public directory routes with Firestore-backed loaders before public pilot traffic.
- Harden Firestore and Storage rules per collection and owner relationship.
- Replace placeholder images with branded assets or Firebase Storage uploads.
- Add payment provider integrations and subscription webhooks.
- Add richer analytics, moderation logs and notification handling.
