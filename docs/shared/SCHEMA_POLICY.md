# Schema Policy

Contract version: `0.3.0-draft`
Status: `partially_verified`

## Status vocabulary

Only these evidence statuses are used by this contract:

`verified`, `reported_pending_snapshot`, `inferred`, `proposed`, `unresolved`, `deferred_for_mobile`, `not_implemented_on_mobile`, `blocked`, `draft_pending_schema_snapshot`, `partially_verified`, `not_used`.

`verified` requires direct evidence against the named target. `partially_verified` means repository evidence is internally consistent but the target environment is not independently verified. `reported_pending_snapshot` preserves a supplied fact without upgrading it to verification.

## Source-of-truth rules

- Every schema, data, function, trigger, or RLS change starts as a versioned SQL migration.
- CourierDash Web is the sole authoritative repository for Supabase migrations and the canonical `docs/shared` contract.
- A generated database type file is a client artifact, not a migration and not proof that Staging matches.
- A local schema snapshot is evidence only. It must record capture context and must not contain project references, credentials, database URLs, user data, or concrete ownership defaults in exported documentation.
- `schemaRevision` records the latest verified target revision and `latestMigration` records the latest canonical local migration. Staging and Production are verified through Expenses revision `202608140001`.
- Production metadata is not used to fill Staging gaps.

## Supabase governance

This section is the canonical governance rule for shared Supabase changes across CourierDash Web and CourierDash Mobile.

### Repository authority

- Web owns and authors changes to shared schema, RLS, Auth configuration, database functions, triggers, and shared enums.
- Only Web may plan, create, review, and store Supabase migrations. Parallel or independent migration creation in Web and Mobile is forbidden.
- Mobile must not create or apply Supabase migrations. It may describe a need or propose a schema change, but planning and migration authoring take place in Web.
- Web maintains the canonical `docs/shared`. Mobile consumes a versioned snapshot and must not edit it into an independent contract version.
- Mobile normally reviews shared changes before rollout. For the explicitly owner-approved Expenses Web rollout, Mobile is paused and will catch up to the canonical Web contract later; it does not author or apply migrations and is not a gate for this Web rollout.

### Approval and rollout gate

The project owner gives two separate explicit approvals: first to create a migration and later to apply it. Approval to create is not approval to apply.

Every future shared change follows this route:

1. Describe the need and affected shared behavior.
2. Plan the change in Web, including compatibility and rollout impact.
3. Obtain Mobile compatibility review against the planned change.
4. Obtain explicit project-owner approval to create the migration.
5. Create the versioned migration only in Web.
6. Verify it against an unambiguously identified and approved Staging environment.
7. Update canonical `docs/shared` and its versioned snapshot, then create and verify generated database types against that Staging revision.
8. Transfer one mandatory handoff to Mobile containing two separate artifacts:
   - the versioned shared snapshot;
   - the generated database types created and verified against the same Staging revision.
   Generated database types are a separate handoff artifact; this contract does not define them as part of the versioned shared snapshot.
9. Obtain Mobile confirmation with status `PASS` that it received both artifacts and that its code is compatible with both.
10. Obtain separate explicit project-owner approval for Production application.
11. Apply the change to Production.

Expenses V1 is an explicit owner-approved rollout exception to the Mobile timing gates in steps 3, 8, and 9: Web remains the sole canonical migration/contract owner, Production still requires the separate approval in step 10, and paused Mobile catches up later without creating a parallel schema.

If Staging cannot be verified and identified unambiguously, no remote Supabase change may be applied. The prerequisite read-only audit is complete for the named Staging environment; this does not authorize Production application.

## Verified Staging public schema

The sanitized snapshot at `supabase/schema.snapshot.json` remains historical evidence from revision `202608020002`. Later read-only verification confirmed Garage revision `202608090001` and Expenses revision `202608130001` on the same unambiguously identified Staging target. Staging now includes the five existing application tables plus RLS-enabled `expense_settings` and `expenses`; the checked-in snapshot file is not silently presented as that newer schema.

The helper `public.handle_new_user_profile()` is not an application RPC: `PUBLIC`, `anon`, `authenticated`, and `service_role` have no `EXECUTE` privilege. At revision `202608020002`, generated types therefore exposed no callable public Functions. After the separately approved Garage migration was applied and verified on Staging, `lib/database.types.ts` was regenerated at revision `202608090001` and now exposes `public.complete_garage_routine`. Nullable database fields remain nullable in clients unless a verified migration changes column-level nullability metadata.

Authenticated Garage RPC verification at revision `202608090001` completed with `PASS`; ownership, validation, atomic rollback, stale-conflict behavior, grants, and cleanup of synthetic Staging rows were verified. The same canonical Garage migration is now present in Production history and schema; Web RPC adoption remains deferred.

## Migration discipline

The repository migration directory and Staging history contain the same ordered revisions:

- `202607220000_baseline_production_schema.sql`;
- `202607230001_add_stuart_and_other_platform.sql`;
- `202607240001_add_cash_tips_per_platform.sql`;
- `202608020001_harden_public_api_privileges.sql`;
- `202608020002_reconcile_ownership_profiles_rls.sql`;
- `202608090001_expand_garage_contract.sql`;
- `202608130001_create_expenses_schema.sql`;
- `202608140001_limit_expenses_amount.sql`.

The reviewed historical baseline restores the five-table base schema; the two August 2 migrations reconcile privileges, required work ownership, profile lifecycle, and RLS; the August 9 migration adds Garage guards and RPC; and the August 13 migration adds owner-scoped Expenses settings/rows, constraints, indexes, triggers, RLS, policies, and grants. Staging and Production migration histories are verified through `202608140001`. The August 14 migration adds only the validated `expenses.amount <= 999999.99` check and changed no row.

Migration rollout must follow expand, migrate clients, verify, deprecate, remove within the governance and approval route above. Applying a migration remotely always requires separate explicit approval and is outside this contract-generation task.

## Ownership, profile lifecycle, and privileges

User-owned rows use Auth identity as the ownership boundary. At verified Staging revision `202608020002`, `work_shifts.user_id` is `NOT NULL`, has no default, retains its Auth-user foreign key and `(user_id, date)` uniqueness, and is checked by owner-scoped RLS. Web and Mobile must continue sending the authenticated user identifier explicitly; neither client may depend on a database ownership default.

Every inserted `auth.users` row invokes the trigger-only `handle_new_user_profile()` helper. It creates exactly one matching profile, copies a non-empty nickname from Auth metadata when present, permits a `NULL` nickname for the existing confirmation/modal flow, and does not overwrite an existing profile. Existing missing profiles were backfilled without inventing nicknames.

Profile rows remain visible to `anon` and `authenticated` under RLS because nickname availability and the agreed profile surface require shared reads. SQL privileges provide the privacy boundary: `anon` may select only `profiles.nickname`; profile identifiers and every other application table are unavailable to `anon`. Authenticated mutations remain owner-scoped. Two-account rollback-only Staging tests verified own access, cross-user denial, anonymous denial, and the explicitly allowed nickname read.

`garage_rules.user_id` and `garage_history.user_id` remain nullable at column-metadata level in verified Staging revision `202608090001` and in regenerated database types. Contract `0.3.0-draft` enforces required normalized writes through applied `CHECK ... NOT VALID` constraints while preserving legacy rows. Final `NOT NULL` metadata and constraint/FK validation remain deferred; regenerated types correctly retain nullable legacy representations until that later hardening is approved and applied.

## Naming and numeric policy

- Canonical term: `app_tips`.
- Mobile property: `appTips`.
- Current database mapping: platform-specific `tips_uber`, `tips_wolt`, `tips_bolt`, `tips_glovo`, `tips_stuart`, and `tips_other`.
- Cash tips use corresponding `cash_tips_*` fields.
- Currency is reported as PLN and is supported by Web labels. Garage `0.3.0-draft` is explicitly PLN-only and adds no currency column.
- Garage costs are non-negative numeric values with at most two decimal places; greater precision is rejected. Garage mileage is an integer in `0…2147483647`.
- Expenses accepts `0.01…999999.99` PLN with at most two decimals and uses exact client string/minor-unit arithmetic. Rental is an ordinary payment row counted wholly in the payment month; no weekly proration exists. Precision and rounding remain unresolved for Statistics and Reports.

## Garage Stage 1 migration discipline

`202608090001_expand_garage_contract.sql` is applied to Staging and Production. It adds lifecycle-safe constraints, a `rule_id` FK with `ON DELETE SET NULL`, an INSERT invariant trigger, and the atomic routine RPC; authenticated Staging RPC verification completed with `PASS` and zero synthetic-data residue.

The migration does not validate `NOT VALID` constraints, backfill legacy rows, or harden the current direct routine INSERT policy. Canonical database types were regenerated from the verified Production public schema. Web RPC adoption, Mobile implementation, and final hardening remain separately gated.

## Expenses V1 migration discipline

`202608130001_create_expenses_schema.sql` is immutable because it is applied and verified on Staging and Production. It creates `expense_settings` and `expenses`, owner-only RLS policies, required constraints/indexes, and timestamp triggers without changing Garage or Work data.

The amount maximum is a separate forward-only migration, `202608140001_limit_expenses_amount.sql`. It adds and validates only `expenses_amount_max_check`; validation fails rather than rewriting an incompatible row. It passed Staging before the same canonical file was applied and verified on Production with explicit owner approval.

`lib/database.types.ts` was regenerated from the verified Production `public` schema. Existing Work, Tax, Profile, Garage, and Expenses surfaces remain present; the platform-only `graphql_public` schema is intentionally outside this canonical client artifact. Mobile remains paused and consumes a later versioned Web snapshot.

## Compatibility classes

- Class A: documentation and evidence metadata only.
- Class B: additive optional field or capability with safe defaults.
- Class C: schema/Auth/RLS/formula/currency/timezone/rounding or required-field change.
- Class D: emergency security change.

Any Class C or D change must update the manifest, schema summary, affected flow, business rule, fixtures, compatibility declaration, and changelog before client acceptance.
