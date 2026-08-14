# Shared Contract Changelog

## 0.3.0-draft Expenses production reconciliation — 2026-08-14

Status: `owner_approved_web_implemented_staging_verified`

### Reconciled

- All five V1 categories are ordinary owner-owned Expenses rows; maintenance and repair are complete without Garage.
- Rental is a payment with amount, payment date, and inclusive paid period. The full amount is attributed only to the payment month; the weekly-rate/proration/source model is superseded.
- Amount inputs are limited to `0.01…999999.99` PLN with at most two decimals and exact string/minor-unit client arithmetic.
- A failed Expenses read makes Expenses-dependent results unavailable; it is never a silent zero. Unknown tax keeps NETTO unavailable.
- Source filtering and Garage import are absent and deferred. Mobile implementation is paused and will catch up to the canonical Web contract later.

### Schema and rollout

- Staging migration `202608130001_create_expenses_schema.sql` and Web Supabase CRUD are implemented and verified.
- Forward-only `202608140001_limit_expenses_amount.sql` adds only the maximum-amount check and changes no user row.
- Production migration application, Production-generated types, branch push, and Vercel Preview remain separately gated.

## 0.3.0-draft Expenses product reconciliation — 2026-08-10

Status: `owner_approved_contract_draft`

This historical documentation-only stage recorded the initial owner-approved product basis. Its source/rental/implementation status is superseded by the 2026-08-14 reconciliation above.

### Added

- `EXPENSES_CONTRACT.md` with scope, non-goals, PLN categories and sources, four calculation modes, owner-approved completeness and tax gates, calendar/rental semantics, source identity, ownership expectations, correction/idempotency boundaries, Garage integration, and five owner-approved decision gates.
- Contract-owned Expenses vocabulary and boundary types plus sanitized fixtures for source identity, decimal rounding, completeness, backdated manual attribution, and rental mutation rules.
- Repository contract tests for the category/source matrix, calculation formulas, decimal `ROUND_HALF_UP`, completeness, actual-date attribution, Garage no-copy boundary, rental rules, owner approval, and manifest hashes.

### Reconciled

- DEC-025 supersedes DEC-009 and DEC-010 and amends DEC-015.
- Expenses V1 now includes `fuel`, `rental`, `maintenance`, `repair`, and `food_on_shift` with only the confirmed permitted sources.
- `G` always includes base income, app tips, cash tips, and bonuses independently of presentation toggles.
- Garage remains an accepted separate source contract; Garage rows are referenced, never copied into manual expenses, and counted at most once.
- Manual rows are the only persisted Expenses records; Rental and Garage remain distinct sources identified by `(source, sourceRecordId)`.
- Manual expenses may be backdated and are attributed by actual `YYYY-MM-DD` expense date, never technical `created_at`.
- PLN inputs allow at most two decimal places; decimal calculations keep rental intermediates unrounded and apply final `ROUND_HALF_UP` to `0.01 PLN`.
- `partial` results have non-empty missing components and are not final; modes requiring unreliable `T` are not `available`.
- Rental periods cannot overlap per owner; normal close-and-create is atomic, correction is separate, and retryable creates require idempotency keys.

### Historical stage boundary

- That documentation commit itself introduced no runtime, schema, database, or deployment change. Web runtime and Staging schema were implemented later and are recorded above.
- Its proposed source-aware rental/Garage model is historical and no longer normative.
- Garage Contract `0.3.0-draft` runtime, acceptance, provenance, schema, and RPC semantics are unchanged.

## 0.3.0-draft Garage contract preparation — 2026-08-09

Status: `partially_verified`

This Class C draft promotes Garage to the shared Web/Mobile contract. Its additive migration and authenticated RPC verification passed on Staging revision `202608090001`; runtime clients and Production remain unchanged.

### Added

- Platform-neutral Garage schema, ownership, CRUD, legacy-null, date-only, mileage, PLN, service-type, rule-link, and error contracts.
- Contract-owned TypeScript Garage types and sanitized synthetic fixtures.
- Forward-only additive migration for normalized-write guards, `rule_id` `ON DELETE SET NULL`, lifecycle-safe INSERT invariants, and atomic `complete_garage_routine`; applied and verified on Staging only.
- Stable `GARAGE_CONFLICT` optimistic-concurrency behavior using the expected `last_change_km` token and a row lock.

### Compatibility

- Current odometer is explicitly client-local and no backend odometer object exists.
- Direct routine INSERT remains temporarily available so the deployed Web is not broken before RPC adoption.
- Authenticated Staging RPC verification passed, synthetic rows were removed, and canonical database types were regenerated from revision `202608090001`.
- Policy hardening, constraint/FK validation, Web runtime adoption, Mobile implementation, and Production remain deferred and separately gated.
- Runtime `next_service_odometer` may be `null`; Web and Mobile must use the contract-owned `CompleteGarageRoutineResult` instead of relying only on the generated RPC return type.
- Legacy rows are not deleted, backfilled, or assigned invented values.

## Snapshot 0.2.0-draft.5 Staging reconciliation — 2026-08-08

Status: `partially_verified`

This Class C post-schema snapshot keeps contract version `0.2.0-draft` and records the verified Staging revision after the approved Web reconciliation package. Mobile acceptance is `pending`; Production application is `not_applied`.

### Staging reconciliation

- Restored the reviewed baseline so Web and Staging migration histories contain the same ordered revisions through `202608020002`.
- Hardened direct table/sequence privileges and migration-owner default privileges; anonymous access is limited to `profiles.nickname`.
- Made `work_shifts.user_id` required with no database default while preserving its Auth foreign key and per-user/date uniqueness.
- Added one canonical Auth-user profile trigger, safely backfilled missing profiles without inventing nicknames, and retained client upserts as idempotent fallbacks.
- Restricted mutation policies to authenticated owners and made Garage history append-only for application roles.
- Verified five RLS-enabled public tables and 67 columns, exact ACL expectations, coherent migration history, the profile trigger, and rollback-only two-account isolation with zero test residue.
- Generated `lib/database.types.ts` once from the stable Staging revision; `work_shifts.user_id` is required in Row and Insert types.
- Source Web schema commit: `aec017db173b846bea98210224ff40df99906d05`.
- Clean executable bootstrap remains a pre-Production CI gate because no Docker-compatible local runtime was available.
- Production, GitHub, Vercel, and Mobile repository state were not changed.

## Snapshot 0.2.0-draft.4 governance finalization — 2026-08-01

Status: `partially_verified`

This Class A documentation snapshot keeps contract version `0.2.0-draft` and packages the Web-approved governance for Mobile review. Mobile governance review is `pending`; no new application-code, schema, or Supabase verification was performed.

### Governance recorded

- Web is the sole authoritative source of Supabase migrations and canonical `docs/shared`.
- Mobile consumes versioned snapshots, does not independently edit the contract, and neither creates nor applies migrations.
- Mobile sends cross-side requests for schema, Auth, RLS, RPC, function, trigger, or shared-enum needs; Web performs canonical planning and migration authoring.
- Web authors shared schema, RLS, Auth, database functions, triggers, and enums; Mobile reviews planned compatibility before migration creation or application.
- The project owner separately approves migration creation and Production application.
- The mandatory route covers Web planning, Mobile compatibility review, verified Staging, canonical contract and snapshot updates, transfer of separately verified generated database types, Mobile `PASS`, and Production approval.
- No remote change is allowed without an unambiguously identified Staging target.
- Local Class A work in either repository remains independent of this shared-backend governance route.
- New migrations and schema, RLS, or Auth changes remain frozen until the separate read-only Supabase audit is complete.
- Source Web commit: `470b1cafd2715e1998c27eb39f8dd4bc66b2c1a3`.
- Backend verification status is unchanged; all existing Staging, migration, ownership, Profile, RLS, Auth, timezone, rounding, Garage, Expenses, Rental, error-contract, cache-scoping, and generated-type-parity blockers remain open.
- Manifest artifact checksums were regenerated automatically with PowerShell `Get-FileHash -Algorithm SHA256`; no runtime artifact or business rule changed.
- Artifact SHA-256 values are calculated from canonical Git index/commit bytes after Git clean filters; platform-specific working-tree line endings are not checksum inputs.

## Snapshot 0.2.0-draft.3 finalization — 2026-08-01

Status: `partially_verified`

This is a snapshot metadata and evidence finalization, not a new business-contract version. Contract version remains `0.2.0-draft` and the sync terminology remains `SYNC PHASE 1 — MOBILE CATCH-UP`.

### Mobile compatibility review of snapshot 0.2.0-draft.2

- Verdict: `PASS WITH NON-BLOCKING MISMATCHES`.
- Mobile branch: `codex/project-foundation`.
- Mobile HEAD: `4ecfb48d99951539c7f5db73fb748667478ffb85`.
- Reviewed archive SHA-256: `04b159598a1a7c7137417dfc1b1ea40a05c4082ef2fa3ce6d64ec7fbb7880508`.
- Archive extraction, nine JSON parses, 36 artifact checksums, artifact coverage, and sanitization passed.
- Work and Statistics calculation compatibility were confirmed.
- All seven supplied calculation cases passed: five income cases and two report cases.
- Mobile has no RPC, Edge Function, or Storage dependency.
- Mobile code changes, commits, pushes, migrations, network calls, and remote writes were zero.
- Profile parity, Staging Auth/RLS, ownership, timezone, and rounding remain unresolved.
- Annual Report remains blocked even though its pure arithmetic fixtures passed.
- Shared status remains `partially_verified`; this review is neither Staging verification nor Production approval.

## 0.2.0-draft — 2026-08-01

Status: `blocked`

This draft establishes the first repository-local shared Web/Mobile contract package. A verified schema snapshot is impossible in this run because the available linked project cannot be proven to be Staging, so no remote metadata command was executed.

### Added

- Canonical architecture, schema, API, Auth/security, business-rule, and compatibility documents.
- Strict machine-readable contract and fixture schemas.
- Verified local arithmetic fixtures for all six platforms, including Stuart, Other, app tips, cash tips, bonuses, orders, null/missing numeric behavior, and zero-denominator reports.
- Explicit flow state for Auth, Profile, Work, Statistics, Reports, Expenses, and Vehicle Rental.
- Sanitized snapshot export format for Mobile handoff.

### Recorded risks

- Unverified Staging identity and unavailable remote schema revision.
- Incomplete checked-in migration history.
- Redacted concrete ownership default and nullable ownership columns in local schema evidence.
- Multiple Web profile bootstrap paths.
- Broad profile read policy in local evidence.
- Web UTC date derivation versus reported Mobile device-local semantics.
- Undefined rounding, rental proration, and Expenses schema.

### Compatibility

This is a draft catch-up contract. No Production deployment, database migration, branch change, commit, push, or pull request is part of this version.
