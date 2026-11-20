# Bariwala Kemon — tenant experience & rental transparency

Read [`docs/PRODUCT_FOUNDATION.md`](docs/PRODUCT_FOUNDATION.md) for the product promise, trust principles, implementation boundaries and phased roadmap. Read [`docs/PHASE_1_AUDIT.md`](docs/PHASE_1_AUDIT.md) for the current source/rules audit and next trust work.

Bariwala Kemon’s core purpose is to help renters understand day-to-day landlord/property-manager treatment through structured first-hand tenant experiences. Property discovery and rent comparison are supporting capabilities.

This project preserves the supplied React UI, removes the two hardcoded sample reviews, and connects review submissions to Firebase Firestore.

## Important publishing behavior

- The public feed subscribes to Firestore in real time and displays only documents whose `status` is `approved`.
- Submitted reviews are saved to Firestore with `status: "pending"`.
- A structured review can be submitted without a long written narrative; `reviewText` is optional in the form, but the field is still written as an empty string when omitted.
- This moderation step is intentional: rental reviews can contain allegations about real people. Do not publish unverified claims automatically.
- A moderator must review a submission and set its `status` field to `approved` in the Firebase Console or the role-protected admin dashboard before it appears publicly.
- Comments and nested replies are also saved in Firestore as pending and appear only after moderation.
- Likes are stored per anonymous Firebase UID in Firestore. This reduces repeat likes per UID but is not full abuse prevention.
- The old sample properties and reviews have been removed; no fake reviews are seeded.

## 1. Create/configure Firebase

1. Open https://console.firebase.google.com/ and create a Firebase project.
2. Add a Web App and copy its Firebase config values.
3. In Authentication > Sign-in method, enable **Anonymous** authentication.
4. In Firestore Database, create a database.
5. In Firestore > Rules, paste the contents of `firestore.rules` and publish.
6. Copy `.env.example` to `.env.local`, then replace every placeholder with the Firebase web app config values.

Do not commit `.env.local` to Git. Firebase web config is not an admin secret, but Firestore Security Rules are essential.

## 2. Run locally

Open this folder (the one containing `package.json`) in VS Code Terminal:

```powershell
npm install
npm run dev
```

Open the Vite local URL printed in the terminal.

## 3. Approve a review

After a visitor submits a review, open Firebase Console > Firestore Database > `reviews`. Find the new document and change `status` from `pending` to `approved`. Do not edit `ownerUid`. The public feed will update in real time.

## Limitations / before a public launch

- The current review browser is focused on Dhaka and Chattogram; nationwide coverage in the product vision is a phased goal, not current functionality.
- Reporting and correction entry points are not yet implemented.
- The current client-side privacy helper masks a Bangladesh mobile-number pattern only; it is not comprehensive PII detection or a security boundary.
- Anonymous auth is not strong abuse prevention. Before public launch add server-enforced rate limiting/App Check, reporting/blocking, audit logs, and legal/privacy review.
- Confirm Firestore backups/exports, error monitoring and deployed rules in the actual Firebase project; these cannot be verified from repository source alone.
- Run `npm run build` and emulator-backed Firestore rules tests plus manual end-to-end review, moderation, comment, reply and like flows before merging.

