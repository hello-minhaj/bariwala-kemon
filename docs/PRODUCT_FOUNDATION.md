# Bariwala Kemon — Product Foundation

## Product promise

**ভাড়া নেওয়ার আগে, বাড়িওয়ালা কেমন জেনে নিন।**

Bariwala Kemon is intended to become a Bangladesh-wide, community-powered tenant-experience and rental-transparency platform. Its differentiator is not simply finding a flat: it is helping people understand what day-to-day renting may be like after moving in.

The central question is:

> If I rent from this landlord or property manager, what is my day-to-day experience likely to be?

Property discovery, listings, maps and rent comparisons support that purpose. They do not replace it.

## Product principles

1. **First-hand experience over accusation.** Structure reviews around what a tenant personally experienced. Distinguish experience, opinion, user-reported claims and independently reviewed evidence.
2. **Fairness to tenants and landlords.** Protect reviewer privacy while providing a meaningful right of reply, correction, reporting and appeal.
3. **Honest trust labels.** A moderation-approved review is not automatically a fact-checked or tenancy-verified review. Never promise “100% safe”, “verified” or “proven” without a defined process.
4. **Data before claims.** Show source, date, geography and sample size for statistics. Use “not enough data” when evidence is sparse.
5. **Bangla-first, bilingual and mobile-first.** Support Bangla, English and common Banglish search patterns; design for low-bandwidth mobile use.
6. **Privacy by default.** Never publicly expose phone numbers, NID, signatures, private conversations, exact unit addresses or private evidence. Collect the minimum data needed.
7. **No pay-to-influence trust.** Advertising and paid listing placement must never affect review scores, moderation outcomes or verification status.
8. **Incremental architecture.** Keep the current application working; evolve toward clear domain boundaries and a modular backend rather than prematurely adopting microservices.

## The tenant-experience review

Reviews should capture a rental period and structured experience, not only a star score.

Recommended dimensions:
- Essential services: gas, water, electricity, internet, lift, generator and waste/drainage where relevant.
- Financial fairness: starting/current rent, increases, advance/deposit, service charge, utility bills, receipts and unexpected charges.
- Maintenance: response time, who paid, whether the repair was completed and whether a timeline was communicated.
- Respect and privacy: communication, notice before entering, personal boundaries, consistent rules and treatment of different tenant groups.
- Promises versus reality: compare what was actually discussed or promised with what happened. Always allow “not discussed” and “not applicable”.
- Overall experience: overall rating, whether the reviewer would rent there again, and optional advice for the next tenant.

A written narrative is optional. A short structured review must remain possible.

Keep rental-period dates separate from platform submission/update timestamps. Support currently renting and later experience updates. Preserve a visible history of updates; do not silently overwrite old experiences.

## Current implementation boundary

The current repository is a React + Vite application using Firebase Authentication and Firestore. The live review browsing experience is currently limited to Dhaka and Chattogram. The repository contains a thana/locality directory and a moderation queue.

Do not present the following as already implemented merely because they appear in this vision:
- Nationwide searchable administrative geography.
- Rental listing marketplace or landlord self-service accounts.
- Map-first discovery and map data layers.
- Proof-of-tenancy verification.
- Full review version history, appeals, landlord replies or evidence workflows.
- Reliable rent statistics or affordability scores.
- Production-grade anti-abuse/rate-limiting and automated moderation.

The existing anonymous authentication and manual/admin moderation are an initial foundation, not a complete identity or verification system. Existing comments/replies and other UI interactions must be checked for persistence and security before being described as fully operational.

## Recommended delivery sequence

### Phase 1 — Make the current tenant-review pilot trustworthy
- Keep the current Dhaka/Chattogram pilot usable.
- Correct misleading trust and privacy claims.
- Make structured reviews possible without forcing a long narrative.
- Ensure Firestore rules match the actual form payload and validation.
- Clearly show moderation status and explain what approval means.
- Audit public review text for personal data; add reporting and correction entry points before increasing reach.
- Fix persistence gaps in comments/replies/likes and test every operation against Firestore rules.
- Add basic operational logging, backups, abuse limits and error monitoring.

### Phase 2 — Strengthen rental context
- Add rental start/end month and “currently renting”.
- Add structured rent increase, deposit return, recurring fee and maintenance events.
- Add landlord/property response with clear labels and moderation.
- Preserve immutable review updates and moderation audit history.
- Add transparent account/tenancy verification levels only after a documented, privacy-safe process exists.

### Phase 3 — Location and discovery foundation
- Model geography using stable IDs and parent-child relationships, with Bangla/English labels and aliases.
- Do not equate metropolitan thana with upazila. Support city corporation, municipality, ward, thana, union, neighborhood, mouza and village as appropriate.
- Import official administrative data with source, date and confidence metadata; do not hand-enter a purported complete national list.
- Expand location coverage incrementally and show which areas actually have reviews.
- Add listing discovery only with freshness, duplicate checks, full recurring-cost breakdown and clear family/bachelor occupancy information.

### Phase 4 — Evidence-led rental intelligence
- Add map/list discovery and separate map layers for population, listings, reviews and rent.
- Never conflate census population density with rental supply or demand.
- Separate asking rent from tenant-reported or confirmed paid rent.
- Publish median and range, sample size, date, property type and methodology. Suppress estimates below a defensible sample threshold.
- Add affordability comparisons only where a credible benchmark exists; otherwise let users set their own budget.

### Phase 5 — Nationwide rollout and sustainable operations
- Expand from focused urban pilots to Greater Dhaka, major divisional cities and then nationwide administrative coverage.
- Add locality correction requests and local moderation capacity.
- Build landlord/property-manager tools, saved searches and alerts after tenant trust is established.
- Monetize through clearly labeled promoted listings, property-management tools and privacy-safe aggregated insights. Never sell personal data or review outcomes.

## Release acceptance checklist

Before each release:
- Existing reviews remain readable and no production records are overwritten or seeded with fake content.
- New review payloads pass the published Firestore rules; unauthorized users cannot approve, edit or delete reviews.
- Empty, loading, error and low-data states are clear.
- Bangla and English labels remain consistent.
- Mobile keyboard, small-screen layout and accessible labels work.
- No public exact unit address, phone, NID or private evidence is exposed.
- Claims such as “verified”, “safe”, “average rent” and “nationwide coverage” are supported by a defined process and data.
- Run `npm run build` and manually test the key review, moderation and discovery flows before merging.

## Non-goals for the first release

Do not attempt to launch all 64 districts with invented rent estimates, build a national map before the geographic data is ready, add complex microservices, or optimize engagement through outrage/negative-review rankings. Start with credible tenant experiences and reliable moderation.
