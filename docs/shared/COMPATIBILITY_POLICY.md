# Compatibility Policy

Contract version: `0.3.0-draft`
Status: `proposed`

## Compatibility objective

Additive evolution is preferred. Clients may present different interfaces, but they must preserve accepted field meaning, formulas, ownership, date semantics, and failure behavior.

## Rollout sequence

The complete cross-repository ownership and approval route is normative in `SCHEMA_POLICY.md`. Within that route, every shared data or behavior change follows this compatibility lifecycle:

1. Expand the contract and backend with backward-compatible capability.
2. Migrate clients while old behavior remains supported.
3. Verify Web and Mobile against the same Staging snapshot and fixtures.
4. Deprecate the old capability with an explicit end condition.
5. Remove it only after the supported client range no longer needs it.

No remote rollout starts without an unambiguously identified Staging target and separate project-owner Production approval. Mobile normally supplies compatibility `PASS`; for the explicitly owner-approved Expenses Web rollout, Mobile is paused and catches up later without authoring schema or blocking the canonical Web migration.

## Change classes

| Class | Meaning | Required handling |
| --- | --- | --- |
| A | Editorial/evidence-only | Review; no runtime migration |
| B | Additive optional capability | Minor contract increment, defaults, fixtures |
| C | Breaking schema, Auth, RLS, formula, currency, timezone, rounding, or required-field change | New version, migration, compatibility plan, dual-client verification |
| D | Security emergency | Immediate containment, explicit impact, incident evidence, follow-up snapshot |

## Supported client range

During the pre-public Mobile phase, compatibility is governed by the explicit catch-up gate rather than a time window. After public Mobile release, the intended policy is current plus previous compatible contract versions. The exact support duration is `future_release_gate` and must be decided before the first public Mobile release.

`semverRangeFormat` is `npm-semver`. Draft versions are pre-release coordination artifacts and do not imply production support.

## Mobile review outcome

The technical review of snapshot `0.2.0-draft.2` completed with `PASS WITH NON-BLOCKING MISMATCHES`. Work and Statistics may continue as local compatibility references, and ordinary Class A Mobile or Web work may continue.

The earlier review resolved no shared backend blocker. Staging identity, migration history, privileges, work ownership, profile bootstrap, and RLS were subsequently reconciled at revision `202608020002`. Snapshot `0.2.0-draft.5` and its separately verified generated types now require a new Mobile acceptance pass; that pass is not Production approval.

Garage contract `0.3.0-draft` remains a Class C draft. Its additive migration and authenticated RPC verification passed on Staging revision `202608090001`; the same schema revision is now applied to Production and canonical public database types were regenerated there. Web RPC adoption and Mobile implementation remain deferred.

## Mobile catch-up gate

Mobile cannot be accepted as contract-verified until all applicable items pass:

- Staging identity is unambiguously verified read-only. **Passed for this snapshot.**
- A fresh schema/type snapshot is generated from that Staging target. **Passed for this snapshot.**
- Checked-in migrations can explain the applied schema or the migration gap is explicitly repaired. **Passed through `202608090001` on Staging.**
- Auth confirmation, redirect, recovery, and deep-link behavior is verified.
- One canonical profile creation mechanism is selected and tested. **Passed on Staging; Mobile acceptance pending.**
- Work ownership nullability/default risks are removed. **Passed on Staging. Garage normalized-write guards and RPC are applied and verified on Staging; final nullability hardening remains deferred.**
- Two-account RLS tests pass for every Mobile-accessed table. **Passed on Staging for the current five-table Web surface.**
- Work and annual-report fixtures pass on both clients.
- Local-date/week/month boundary semantics are identical.
- Expenses amount/date/rental-payment rules are owner approved, implemented on Web, and covered by synthetic fixtures; Staging and Production schema/RLS are verified through `202608140001`.
- Expenses Production schema rollout and Production public-type regeneration are complete. Mobile catch-up is deferred and does not create a parallel schema; Web Preview acceptance and merge remain separate gates.
- Garage types, date/PLN/mileage rules, RPC signature, stable errors, and local-only odometer behavior pass Mobile review.

## Garage compatibility window

1. Apply only the separately approved additive Garage migration to an unambiguous Staging target. **Completed at Staging revision `202608090001`.**
2. Regenerate canonical database types from that verified Staging revision. **Completed.**
3. Move Web routine completion to the RPC without removing the old database path. **Deferred.**
4. Implement Mobile Garage against the same contract-owned types and verified RPC. **Deferred.**
5. Verify both clients before later hardening that limits direct history INSERT to `repair` with null `rule_id` and validates eligible constraints. The additive Stage 1 schema rollout to Production is complete; client adoption remains deferred.

Because the verified runtime may return `next_service_odometer = null`, both clients must use `CompleteGarageRoutineResult` from the shared contract rather than trusting the generated RPC return type alone.

The Stage 1 repository must not contain an automatically pending policy-hardening migration, because a normal migration runner could apply it before the deployed Web adopts the RPC.

## Expenses compatibility window

1. Preserve migration `202608130001` unchanged because it is applied on Staging and Production. **Completed.**
2. Verify `202608140001` on Staging; it only adds the `999999.99` amount maximum. **Completed.**
3. Reconcile Production migration history and apply the canonical ordered Web migrations only after explicit approval. **Completed through `202608140001`.**
4. Regenerate database types from verified Production and confirm existing Work/Tax/Profile/Garage surfaces remain intact. **Completed for the canonical `public` schema.**
5. Push the Web feature branch and verify a Production-backed Preview without changing `main` or launching a Production deployment. **Pending.**

Current Expenses has no Source filter, Garage import, weekly rental source, or proration. Adding any of those later is a separate contract change. Mobile remains paused until a later Web-owned snapshot is ready.

## Deprecation rules

- A field is never repurposed to carry a different meaning.
- A legacy alias may be read during migration but canonical writes use the new term.
- Removing or making a field required is Class C.
- The legacy phrase “online tips” may be displayed only as migration copy; the canonical term is `app_tips`.
- Old clients must fail clearly when a required capability is unavailable; silent reinterpretation is forbidden.
