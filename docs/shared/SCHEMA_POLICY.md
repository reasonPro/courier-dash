# Schema Policy

Contract version: `0.2.0-draft`
Status: `draft_pending_schema_snapshot`

## Status vocabulary

Only these evidence statuses are used by this contract:

`verified`, `reported_pending_snapshot`, `inferred`, `proposed`, `unresolved`, `deferred_for_mobile`, `not_implemented_on_mobile`, `blocked`, `draft_pending_schema_snapshot`, `partially_verified`, `not_used`.

`verified` requires direct evidence against the named target. `partially_verified` means repository evidence is internally consistent but the target environment is not independently verified. `reported_pending_snapshot` preserves a supplied fact without upgrading it to verification.

## Source-of-truth rules

- Every schema, data, function, trigger, or RLS change starts as a versioned SQL migration.
- CourierDash Web is the sole authoritative repository for Supabase migrations and the canonical `docs/shared` contract.
- A generated database type file is a client artifact, not a migration and not proof that Staging matches.
- A local schema snapshot is evidence only. It must record capture context and must not contain project references, credentials, database URLs, user data, or concrete ownership defaults in exported documentation.
- `schemaRevision` and `latestMigration` stay `null` until an unambiguous Staging target is checked read-only.
- Production metadata is not used to fill Staging gaps.

## Supabase governance

This section is the canonical governance rule for shared Supabase changes across CourierDash Web and CourierDash Mobile.

### Repository authority

- Web owns and authors changes to shared schema, RLS, Auth configuration, database functions, triggers, and shared enums.
- Only Web may plan, create, review, and store Supabase migrations. Parallel or independent migration creation in Web and Mobile is forbidden.
- Mobile must not create or apply Supabase migrations. It may describe a need or propose a schema change, but planning and migration authoring take place in Web.
- Web maintains the canonical `docs/shared`. Mobile consumes a versioned snapshot and must not edit it into an independent contract version.
- Mobile must review the planned change against its code and report compatibility before a migration is created or applied.

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

If Staging cannot be verified and identified unambiguously, no remote Supabase change may be applied. Until the separate read-only Supabase audit is complete, no new migration may be created and no schema, RLS, or Auth change may be made.

## Observed local public schema

Repository evidence describes five RLS-enabled public tables: `profiles`, `work_shifts`, `tax_settings`, `garage_rules`, and `garage_history`. It describes no public views, RPC functions, triggers, or Postgres enums. This is `partially_verified`, not a Staging inventory.

The generated types in `lib/database.types.ts` match those five table names and expose no public Functions, Views, or Enums. Nullable database fields must stay nullable in clients unless a verified migration makes them required.

## Migration discipline

The repository migration directory currently contains only:

- `202607230001_add_stuart_and_other_platform.sql`
- `202607240001_add_cash_tips_per_platform.sql`

They add platform and cash-tip fields and related checks. They do not create the base tables, base RLS policies, profile model, or the complete set of earlier constraints. Consequently a clean database cannot be reconstructed from the checked-in migrations alone. This is a blocker for a verified mobile schema snapshot.

Migration rollout must follow expand, migrate clients, verify, deprecate, remove within the governance and approval route above. Applying a migration remotely always requires separate explicit approval and is outside this contract-generation task.

## Ownership and nullability

User-owned rows use Auth identity as the ownership boundary. The intended invariant is that ownership is present and immutable after insert. Local evidence currently conflicts with that invariant:

- `work_shifts.user_id`, `garage_rules.user_id`, and `garage_history.user_id` are reported nullable.
- `work_shifts.user_id` is reported to have a concrete default value. The value is redacted because it is not contract data.
- Application models sometimes treat nullable garage fields as required.

Mobile must not depend on the reported default. It must send the authenticated user identifier where the current direct-CRUD contract requires it and rely on RLS as defense in depth. Schema remediation is Class C and requires a migration plus two-account Staging verification.

## Naming and numeric policy

- Canonical term: `app_tips`.
- Mobile property: `appTips`.
- Current database mapping: platform-specific `tips_uber`, `tips_wolt`, `tips_bolt`, `tips_glovo`, `tips_stuart`, and `tips_other`.
- Cash tips use corresponding `cash_tips_*` fields.
- Currency is reported as PLN and is supported by Web labels, but no verified currency column or shared money type exists.
- Numeric precision and rounding are unresolved. Clients must not introduce silent shared rounding rules. Fixtures compare exact supplied decimal values; presentation formatting is not a persistence rule.

## Compatibility classes

- Class A: documentation and evidence metadata only.
- Class B: additive optional field or capability with safe defaults.
- Class C: schema/Auth/RLS/formula/currency/timezone/rounding or required-field change.
- Class D: emergency security change.

Any Class C or D change must update the manifest, schema summary, affected flow, business rule, fixtures, compatibility declaration, and changelog before client acceptance.
