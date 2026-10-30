# Firebase setup and moderation guide

## 1. Configure Firebase

1. Create a Firebase project and register a Web app.
2. In Authentication > Sign-in method, enable **Anonymous**.
3. Create a Firestore database.
4. Copy `.env.example` to `.env.local` and fill the `VITE_FIREBASE_*` values from the Firebase Web app configuration.
5. In Firestore > Rules, publish the contents of `firestore.rules` from this project.
6. Run `npm install` and `npm run dev`.

Do not put Firebase Admin SDK private keys in a Vite frontend or in `.env.local` variables prefixed with `VITE_`.

## 2. How approval works

The site only reads documents whose `status` is `approved`. New reviews, comments, and replies are written with `status: pending`. They will not be public until you approve them.

For an initial launch, approve content manually in Firebase Console. Sign in to the Firebase project as its owner/editor, then go to Firestore Database > Data:

- Reviews: `reviews/{reviewId}` — change `status` from `pending` to `approved`.
- Comments: `reviews/{reviewId}/comments/{commentId}` — change `status` from `pending` to `approved`.
- Replies: `reviews/{reviewId}/comments/{commentId}/replies/{replyId}` — change `status` from `pending` to `approved`.

Use the document's `status` field; do not approve by changing unrelated fields. Firebase Console owner/editor actions can edit documents even though client SDK updates are blocked by the rules.

## 3. Likes

A visitor must have Firebase Anonymous Authentication enabled. Each visitor's like is stored at `reviews/{reviewId}/likes/{anonymousUid}`. The UI listens to the likes collection to show the count and whether the current anonymous user has liked it. Clicking again removes that visitor's like. This reduces repeat likes per anonymous UID, but anonymous identities can be reset by clearing browser data and this is not a full anti-abuse system.

## 4. Important launch notes

- Comments and replies are hidden until approved; their submitters see a pending confirmation.
- The first version has no custom admin dashboard. Moderate content in Firebase Console; build a role-protected admin panel before moderation volume grows.
- Firestore rules are baseline controls, not a complete legal, privacy, spam, or rate-limit solution. Add App Check, monitoring, reporting flows, and stricter validation before public launch.
- Never approve personal phone numbers, exact private unit details, threats, or unsupported allegations. Establish a written moderation policy.
