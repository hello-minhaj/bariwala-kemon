# Phase 1 — Trust and persistence audit

Audit date: 2026-11-20  
Baseline: `main` after PR #1 merge

## Confirmed in the current source

- Review submission writes a Firestore document with the fields required by `validReviewCreate()` in `firestore.rules`.
- The written review always includes `reviewText`; an empty string is accepted by the current rules, so the narrative can be omitted while the field remains present.
- New reviews are created with `status: "pending"` and the public feed queries only `status: "approved"`.
- The My Reviews UI has separate labels for pending, published, not published and archived reviews.
- Root comments and nested replies are written to Firestore with pending status and a server timestamp. The rules validate those fields and require the parent review/comment to be approved.
- Likes are stored per anonymous Firebase UID under `reviews/{reviewId}/likes/{uid}`; the rules restrict each visitor to their own like document.
- The admin dashboard loads pending reviews, comments and replies. The Firestore rules, not the dashboard UI, enforce admin-only moderation writes.

## Gaps to address before expanding reach

1. **Reporting and correction:** no user-facing report/correction workflow was found in the reviewed source. Add a privacy-safe entry point and a documented moderator process.
2. **Privacy filtering:** the current client helper masks a Bangladesh mobile-number pattern only. This is not sufficient protection against NID numbers, email addresses, exact unit addresses, signatures or private conversation details. Client-side filtering must not be treated as a security boundary.
3. **Abuse controls:** anonymous authentication is not rate limiting. App Check and server-enforced abuse controls are still needed.
4. **Moderation audit history:** current review moderation changes the status field. A durable audit trail for moderator, timestamp, reason and prior state is not established by the current rules.
5. **Operational resilience:** verify scheduled Firestore exports/backups, error monitoring and alert ownership in the actual Firebase project; repository code alone cannot confirm project-level configuration.
6. **Automated validation:** the repository currently has no test script for Firestore rules or end-to-end review/comment/like flows. These need emulator-backed tests before relying on the flows for a wider launch.

## Scope of this audit

This is a source-code and rules review, not a live penetration test or a verification of the connected Firebase project. No production data was read or changed. No claim is made that App Check, backups, monitoring or deployed rules are active in the user's Firebase console.

## Next implementation order

1. Add a report/correction entry point with a minimal, non-public report record and moderator-only access.
2. Add emulator tests for review creation, moderation, comments, replies and likes.
3. Strengthen privacy review and abuse controls only with a server-enforced design; do not rely on frontend regex checks.
4. Document and verify backups, monitoring and moderation audit history before broadening geographic coverage.
