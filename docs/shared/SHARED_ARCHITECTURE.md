# CourierDash Shared Architecture

Contract version: `0.3.0-draft`
Development phase: `mobile_catch_up`
Contract status: `partially_verified`

## Authority model

The versioned shared contract is the cross-client authority for behavior, data semantics, security expectations, and compatibility. Web source code and the local schema snapshot are evidence; neither silently becomes a shared rule.

CourierDash Web maintains canonical `docs/shared` and is the sole authoritative source of Supabase migrations. Mobile consumes versioned snapshots, performs compatibility review, and does not create or apply migrations. The complete ownership, approval, Staging, and rollout rules are normative in `SCHEMA_POLICY.md`.

Web is a behavioral reference only for a flow confirmed by a versioned snapshot; shared contract; source evidence; verified fixture. Unverified Web behavior is discovery evidence, not automatically canonical business behavior.

Evidence priority is:

1. A verified Staging snapshot tied to an unambiguous environment identity.
2. This versioned contract and its fixtures.
3. Generated database types and repository schema snapshots.
4. Migrations and application source.
5. Reported behavior that has not yet been independently reproduced.

Conflicts do not get resolved by choosing the newest-looking file. They become explicit mismatches or blockers until evidence is reconciled.

## Runtime boundaries

- Web and Mobile are separate clients of one shared domain contract.
- Simple user-owned CRUD may use Supabase directly when RLS is sufficient and the operation has no shared calculation, secret, transaction, or partial-failure risk.
- Shared atomic operations belong in RPCs; privileged integrations and secrets belong in Edge Functions or a future API.
- Client code must never contain elevated server credentials.
- Production is outside the scope of this snapshot and was not inspected or changed.

## Shared domain surface

| Flow | Canonical scope | Current contract state |
| --- | --- | --- |
| Auth | Email/password signup, login, logout, recovery, session | `reported_pending_snapshot` |
| Profile | One profile per Auth user; nickname uniqueness | `verified` on Staging; Mobile acceptance pending |
| Work | One dated record per user/day, six platforms, recorded metrics | `verified` on Staging for schema and access |
| Statistics | Brutto and platform aggregation | `reported_pending_snapshot` for Mobile |
| Reports | Annual totals and safe averages | `partially_verified` |
| Garage | Single-vehicle maintenance rules, append-only history, atomic routine completion | `draft_pending_schema_snapshot`; Mobile review pending |
| Expenses | Fuel and vehicle rental only | `draft_pending_schema_snapshot` |
| Vehicle rental | Optional dated weekly-price periods | `unresolved` |

## Required client boundaries

- UI layout and navigation may differ, but stored meaning, formulas, ownership, date interpretation, and error outcomes must remain compatible.
- `app_tips` is the canonical domain term. Mobile may expose it as `appTips`; the current database mapping uses per-platform `tips_*` fields.
- A dated work record is not an active shift. Start/stop shift semantics are not currently part of the shared contract.
- Statistics can be complete without Expenses. Expenses and rental do not enter Brutto.
- Income after expenses is a separate future metric and is not tax Netto.
- Garage current odometer is deliberately client-local and is not a shared backend field. Garage history remains technical maintenance/repair history; contract `0.3.0-draft` adds no Expenses integration.

## Evidence and verification

Each material statement carries one of the status values defined in `SCHEMA_POLICY.md`. Staging was identified unambiguously, reconciled through migration `202608020002`, captured without project identifiers or user data, and verified with metadata and rollback-only two-account tests. Production was not changed, and Mobile acceptance of snapshot `0.2.0-draft.5` is pending.

## Change governance

Changes are classified A-D:

- Class A: editorial or evidence-only changes that do not alter machine-readable semantics.
- Class B: additive, optional, backward-compatible fields or capabilities.
- Class C: breaking changes to schema, Auth, RLS, formulas, currency, timezone, rounding, required fields, or stored meaning.
- Class D: urgent security remediation. It may shorten normal migration windows but still requires an incident record, explicit compatibility impact, and follow-up snapshot.

Class C requires a new contract version, migration path, client catch-up gate, fixtures, and Staging verification. Class D requires the same evidence as soon as containment permits.

## Remaining architectural blockers

- Mobile has not yet reviewed snapshot `0.2.0-draft.5` and the separately verified generated database types.
- A clean executable migration bootstrap still needs a Docker-compatible or isolated PostgreSQL CI runtime before Production rollout.
- Garage calendar-date semantics are approved, but Web runtime adoption is deferred; other flows still have UTC/local-date mismatches.
- Shared precision and rounding, legacy income precedence, Expenses, and rental remain unresolved outside this schema reconciliation.
- Garage is promoted to a draft shared flow, but its migration, regenerated types, Web RPC adoption, Staging verification, and Mobile acceptance remain incomplete.
