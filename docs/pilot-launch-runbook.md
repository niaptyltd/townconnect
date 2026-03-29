# TownConnect Pilot Launch Runbook

## 1. Pre-launch checklist

- Confirm the pilot scope: one town, a small set of real businesses, one admin owner, and a known support contact.
- Set launch owner for the day: one person making final go/no-go calls.
- Set support channels: WhatsApp, email, and internal escalation contact.
- Confirm demo mode is off.
- Confirm Firebase and Vercel access is available before launch day.
- Confirm a backup admin account exists.

## 2. Required env vars

Set these in Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SESSION_SECRET`

## 3. Firebase setup checklist

- Enable Email/Password sign-in in Firebase Authentication.
- Add the live domain to Authorized Domains.
- Create Firestore in Native mode.
- Enable Firebase Storage.
- Create a service account and store the Admin credentials in Vercel.
- Confirm the Firebase project is the same one used in both client and admin env vars.

## 4. Firestore rules deployment checklist

- Deploy the latest Firestore rules before launch.
- Confirm guests can read active towns, categories, businesses, services, products, and banners needed for public browsing.
- Confirm customers can only see their own bookings and enquiries.
- Confirm owners can only manage their own business data.
- Confirm admins can manage all admin tools.
- If any role can see or change the wrong data, stop launch.

## 5. Seed data checklist

Before launch, make sure Firestore contains:

- 1 active town
- active categories
- Free, Standard, and Premium plans
- platform settings
- at least 1 admin user
- at least 3 to 5 real business listings
- services and products for those businesses
- at least 1 banner if banners will be shown

## 6. Vercel deployment steps

1. Add all env vars in Vercel.
2. Confirm the Production environment is selected.
3. Trigger a fresh deployment.
4. Open the live URL.
5. Check the home page, search page, one town page, and one business page.
6. If login or public search fails, do not announce launch.

## 7. Post-deploy smoke tests by role

### Guest

- Open home, search, town, category, and business pages.
- Search by keyword and town.
- Submit one enquiry.

### Customer

- Register and log in.
- Submit one booking or enquiry.
- Confirm account pages load.

### Owner

- Log in.
- Edit business profile.
- Create one service.
- Create one product.

### Admin

- Log in.
- Approve or update one business.
- Update one banner or setting.
- Confirm admin pages load without permission errors.

## 8. Go / No-Go checklist

Go live only if all are true:

- public pages load
- login works
- admin works
- one enquiry succeeds
- one booking succeeds
- owner edit works
- no demo data is visible
- no major permission issue is found

No-Go if any of these happen:

- users cannot log in
- public directory does not load
- wrong users can access protected data
- admin cannot approve or update records
- enquiries or bookings fail

## 9. Rollback checklist

If something breaks:

1. Pause new pilot invites immediately.
2. Switch any public announcement link back to a waitlist or holding page if available.
3. Revert to the last working Vercel deployment.
4. Disable new onboarding if needed.
5. Tell pilot users there is a temporary issue and give a recovery time window.
6. Log the issue, root cause, and fix before relaunching.

## 10. First 7 days pilot operating plan

### Day 1

- Launch to internal team and a very small owner/admin group first.
- Watch login, search, enquiry, and booking flows closely.
- Respond to every support issue manually.

### Day 2 to 3

- Add a small number of real pilot businesses.
- Review listing quality, missing fields, and broken media.
- Check that towns, categories, and banners appear correctly.

### Day 4 to 5

- Open guest browsing to a slightly wider audience.
- Track the number of enquiries, bookings, and owner updates.
- Fix the top 3 friction points immediately.

### Day 6 to 7

- Review support volume, failed flows, and user confusion points.
- Decide whether to expand the pilot, hold steady, or pause for fixes.
- Capture learnings on onboarding, discovery, and monetization readiness.
