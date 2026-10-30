# Bariwala Kemon — real Firestore-backed review project

This project preserves the supplied React UI, removes the two hardcoded sample reviews, and connects review submissions to Firebase Firestore.

## Important publishing behavior

- The public feed subscribes to Firestore in real time and displays only documents whose `status` is `approved`.
- Submitted reviews are saved to Firestore with `status: "pending"`.
- This moderation step is intentional: rental reviews can contain allegations about real people. Do not publish unverified claims automatically.
- A moderator must review a submission and set its `status` field to `approved` in the Firebase Console before it appears publicly. After approval, all open website sessions receive the review through the live listener.
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

- This package adds shared persistence for reviews and real-time display of approved reviews. Existing comments, nested replies, and upvote handlers in the UI still use local React state and are not yet shared/persisted.
- Firestore rules here intentionally disallow client-side updates/deletes. Build a trusted admin moderation interface or use Firebase Console for moderation.
- Anonymous auth is not strong abuse prevention. Before public launch add server-side rate limiting/App Check, reporting/blocking, audit logs, and legal/privacy review.
- Review text is checked for a simple Bangladesh phone-number pattern in the client, but that is not a substitute for robust server-side privacy filtering/moderation.
- This project has not been deployed or connected to your Firebase account from this environment; you must complete Firebase setup using your own project credentials.
