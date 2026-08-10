# Expenses Contract Draft

Contract version: `0.3.0-draft`

Status: `owner_approved_contract_draft`

This document is a documentation and shared-contract artifact. Expenses is not implemented. Nothing in this draft authorizes a database migration, production rollout, `/expenses` route, UI, finance refactor, or change to Garage Contract `0.3.0-draft`.

## Decision language

- `OWNER APPROVED` means the product owner explicitly approved the rule on 2026-08-10. It is normative for future Expenses implementation while this contract remains a draft.
- `CONFIRMED` means the product owner supplied the rule for this draft before the decision-gate approval.
- `EXISTING DECISION` means the rule is already recorded as active in `docs/DECISIONS.md`.
- `PROPOSED` means a recommended unresolved choice. It is non-normative until the owner approves it.
- Repository runtime behavior is evidence, not an automatic shared-contract decision.

## Scope

The future Expenses V1 contract covers:

- PLN-only expense classification;
- source-aware expense history and date-range aggregation;
- recorded manual, rental-period, and Garage costs;
- gross, tax/fee, and recorded-expense calculation boundaries;
- explicit availability/completeness results shared by Web and Mobile;
- owner isolation and the approved product gates that future persistence work must preserve.

## Non-goals

This draft does not define or implement:

- an Expenses page or any UI;
- a database schema, migration, RPC, generated database types, or RLS policy;
- a replacement or refactor of current Work or Annual calculations;
- a legal or audited tax model;
- multi-currency, conversion, charging, parking, insurance, washing, or arbitrary recurring billing;
- changes to Garage schema, runtime behavior, RPC semantics, acceptance, or provenance;
- Production or Staging deployment.

## Currency, categories, and sources

`CONFIRMED`: Expenses V1 uses PLN only.

The canonical category identifiers and permitted sources are:

| Category | Meaning | Permitted source |
| --- | --- | --- |
| `fuel` | Fuel purchased for courier work | `manual` |
| `rental` | Vehicle rental cost derived from rental periods | `rental_period` |
| `maintenance` | Planned or routine vehicle maintenance | `manual`, `garage` |
| `repair` | Fault remediation or repair | `manual`, `garage` |
| `food_on_shift` | Food purchased during a work shift | `manual` |

No other category or source is part of Expenses V1 without a new approved contract change.

An Expenses history item must retain its source identity. A future physical schema may represent the link differently, but the logical contract is a pair of `source` and `sourceRecordId`. The same source record must contribute at most once to a result.

## Financial components

For one requested calendar-date range:

- `G` is gross recorded work income.
- `T` is the tax-and-fee deduction supplied by the future audited tax/fee boundary.
- `E` is the total of recorded Expenses sources in the range.

`CONFIRMED`:

`G = base income + app tips + cash tips + bonuses`

`G` is canonical financial input and does not change when presentation toggles hide tips or bonuses. Existing Work and Annual toggles remain presentation/runtime behavior and are not the Expenses calculation contract.

`E` is the sum of eligible source records exactly once:

- manual rows for `fuel`, `maintenance`, `repair`, and `food_on_shift`;
- rental cost calculated from rental periods;
- Garage `routine` history as `maintenance` and Garage `repair` history as `repair`.

Taxes and fees are not expense categories and are never included in `E`.

## Calculation modes

The four canonical modes are:

| Mode | Formula |
| --- | --- |
| `gross` | `G` |
| `after_tax_and_fees` | `G - T` |
| `after_recorded_expenses` | `G - E` |
| `after_all_deductions` | `G - T - E` |

Negative results are valid calculation results. Calculated totals are derived values and are not persisted as authoritative database totals.

## Availability and completeness

Every future calculation result must distinguish:

| Status | Contract meaning |
| --- | --- |
| `available` | All components required by the selected mode are known for the requested range. |
| `partial` | A value can be shown only from an explicitly identified subset; omitted or incomplete components must be disclosed. |
| `unavailable` | A trustworthy value cannot be calculated because a required source failed, is inaccessible, or is invalid. |
| `not_configured` | A required configurable component has intentionally not been configured. |

`OWNER APPROVED`: each result carries a nullable value, a completeness status, and a missing-component list. Missing, failed, or unconfigured data must not be silently converted to zero. An empty but successfully queried category set may be a known zero.

- `available` requires every component used by the selected mode to be known and has an empty missing-component list.
- `partial` requires a non-empty missing-component list and is never a final result, even if a provisional value is present.
- `not_configured` identifies an intentionally absent required configuration.
- `unavailable` identifies a failed, inaccessible, invalid, or otherwise unreliable required component.
- Modes that depend on `T` must not be `available` when `T` cannot be determined reliably.

## Calendar-date semantics

`OWNER APPROVED`: Expenses uses exact `YYYY-MM-DD` calendar dates across all sources. Garage already owns the same date-only contract, and rental decisions use inclusive calendar dates.

- a manual row stores its actual calendar expense date separately from its technical creation timestamp;
- a user may create a manual expense with an earlier calendar date when recording it late;
- filters, history, and financial calculations attribute the row to its actual expense date, never to `createdAt`/`created_at`;
- date-only values do not pass through UTC conversion;
- a selected range includes both start and end dates;
- Garage rows use their existing accepted Garage date without reinterpretation;
- rental overlap is evaluated using rental calendar dates, not Work-shift presence.

This draft does not claim that current Work, Annual, or Garage Web runtime already has full cross-feature timezone parity.

## Rental-period semantics

`EXISTING DECISION`:

- rental is optional and represented by periods rather than copied daily or weekly expense rows;
- a period has a weekly PLN amount, inclusive `valid_from`, and inclusive optional `valid_to`;
- `valid_to = null` identifies an open period;
- rental is calculated for the intersection of the rental period and requested date range, independently of Work shifts;
- the direction of the calculation is `weekly amount × active calendar days / 7`;
- changing a normal rate closes the previous period and creates a new period instead of rewriting unrelated history;
- historical correction is a separate warned action.

`OWNER APPROVED`: PLN inputs accept at most two decimal places. Calculations use decimal arithmetic, rental proration retains full intermediate precision, and only the final result is rounded to `0.01 PLN` with `ROUND_HALF_UP` identically on Web and Mobile.

For one owner, rental periods must not overlap. A normal rate change closes the current period and creates the replacement atomically. Historical correction remains a separate controlled action, and retryable creates require idempotency keys. The physical persistence and RPC shape remain deferred.

## Double-counting protection

The aggregation boundary is a source-aware union, not a copied manual ledger:

- a Garage row remains owned by Garage and is referenced as `source = garage`;
- Garage rows must not be copied into manual expenses;
- a rental period remains owned by the rental source and does not generate manual expense rows;
- a manual expense has `source = manual` and must not claim a Garage or rental source identity;
- one logical `(source, sourceRecordId)` may contribute at most once to one calculation result.

Deleting or hiding a presentation item must not cause a second source representation to appear automatically.

## Ownership and RLS expectations

Any future persisted Expenses or rental object must be owner-scoped to the authenticated user. Before implementation, the approved schema must define and verify:

- owner foreign keys and ownership defaults, if any;
- authenticated owner-only read and mutation policies;
- denial of cross-user source references;
- Garage references that resolve only to Garage rows owned by the same user;
- whether aggregation is safe as direct CRUD/read queries or requires an owner-scoped RPC;
- grants, indexes, constraints, and deletion behavior.

These are expectations, not claims about an existing Expenses schema. No Expenses or rental table is evidenced at this baseline.

## Correction and idempotency boundaries

- Pure calculation over the same source snapshot and date range must be deterministic and side-effect free.
- Manual-expense correction may target only the owned manual record; its final audit/history policy is unresolved.
- Garage correction stays inside the accepted Garage contract. Expenses does not update, clone, or reinterpret Garage records.
- Rental correction follows the separate historical-correction boundary and must not be treated as a normal rate change.
- Retryable rental creates require a stable client-generated idempotency key. The future schema/API must define its storage, scope, replay result, and conflict behavior before implementation.

The product-level mutation boundaries are owner approved. Their concrete schema, transaction/RPC contract, authorization, manual deletion/audit retention, and stable mutation errors still require a separate design review before any migration or runtime implementation.

## Garage integration

Garage Contract `0.3.0-draft` is an accepted upstream source contract and is not amended here.

Expenses consumes Garage history by reference:

- `routine` contributes to `maintenance`;
- `repair` contributes to `repair`;
- `garage_history.cost` remains the source amount in PLN;
- the Garage row ID is retained as source identity;
- the source row is not copied to a manual expense and is counted at most once;
- a Garage-derived expense is created or corrected in Garage and cannot be recreated as a manual duplicate;
- Expenses cannot change Garage validation, RPC behavior, history lifecycle, or ownership.

Any future cross-source query or reference constraint requires its own schema and compatibility review.

## Owner-approved decision gates

All five product decision groups below were explicitly approved by the owner on 2026-08-10. Approval records the required behavior; it does not authorize schema, runtime, UI, migration, database, or Production work.

### Gate 1 — Persistence model and source identity

`OWNER APPROVED`: use a source-aware Expenses read model with a stable `(source, sourceRecordId)` identity. Persist only manual records; derive rental entries and reference Garage rows without copying them.

Consequence: deduplication and ownership remain explicit, but queries may require a shared aggregation boundary instead of one simple table scan.

### Gate 2 — Money precision and rounding

`OWNER APPROVED`: accept manual and rental monetary inputs as non-negative PLN decimal values with at most two decimal places, use decimal arithmetic, keep rental proration at full intermediate precision, and round only the final range result to `0.01 PLN` with `ROUND_HALF_UP`.

Consequence: Web, Mobile, and database calculations need one accepted rounding oracle and fixtures before implementation.

### Gate 3 — Availability state matrix

`OWNER APPROVED`: return a nullable value plus per-component completeness. Use `available` only when every component required by the selected mode is known; use `partial` only with a non-empty missing-component list and never present it as final; use `not_configured` for an intentionally absent required configuration; otherwise use `unavailable`.

Consequence: consumers can avoid false zeroes, but every source adapter must report completeness rather than only a number.

### Gate 4 — Tax-and-fee component `T`

`OWNER APPROVED`: treat `T` as a separate audited input contract. Preserve current Work tax runtime unchanged, and do not mark tax-dependent modes `available` until the applicable tax/fee configuration and calculation for the requested range are defined and verified.

Consequence: `gross` and expense-only calculations can progress independently, while tax-dependent results remain gated by the dedicated tax audit.

### Gate 5 — Mutations, rental overlap, correction, and idempotency

`OWNER APPROVED`: prohibit overlapping owned rental periods, perform normal close-and-create rate changes atomically, keep historical correction as a separate controlled action, and require client-generated idempotency keys for retryable creates.

`UNRESOLVED`: manual deletion/audit retention and the concrete transaction/RPC/error contract must be decided before schema work.

Consequence: this likely requires constraints and one or more transactional RPCs, which cannot be designed or deployed during this documentation stage.

## Migration and production approval process

No migration is authorized by this draft. Production implementation requires separate sequential approval for:

1. owner decisions for all five product gates — completed on 2026-08-10;
2. read-only inspection of the actual target Supabase environment;
3. a reviewed forward-only SQL migration and rollback/compatibility analysis;
4. generated database types and sanitized contract fixtures;
5. local and Staging verification, including RLS isolation and calculation parity;
6. Mobile compatibility review for the resulting immutable contract snapshot;
7. a separate explicit Production approval.

Until the remaining steps complete, Expenses remains a contract draft and Production implementation has not started.
