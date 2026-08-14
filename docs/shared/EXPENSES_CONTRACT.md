# Expenses Contract Draft

Contract version: `0.3.0-draft`

Status: `owner_approved_web_implemented_staging_verified`

This is the canonical Web-owned Expenses V1 contract. Web runtime and the
owner-scoped Supabase schema from
`202608130001_create_expenses_schema.sql` are implemented and verified on
Staging. Production rollout remains separately gated. Mobile is paused and may
catch up to a later immutable snapshot; it does not author schema or migrations.

## Scope

Expenses V1 provides:

- optional per-user activation and category selection;
- owner-scoped CRUD for expense rows;
- five PLN-only categories;
- actual calendar-date attribution, including backdated entry;
- a manual rental payment with an inclusive paid period;
- monthly totals and income-after-expenses calculations;
- explicit unavailable/partial behavior when required data cannot be trusted.

Garage import, a Source filter, multiple currencies, recurring billing,
receipts, tax advice, and annual Expenses reporting are not part of this V1.
Future `Підтягувати з Garage` is a separate feature and must not be inferred
from maintenance or repair category activation.

## Canonical categories

All five categories are created, edited, and deleted as ordinary owner-owned
Expenses rows:

| Identifier | Meaning |
| --- | --- |
| `fuel` | Fuel purchased for courier work |
| `rental` | A vehicle-rental payment |
| `maintenance` | Planned vehicle service or maintenance |
| `repair` | Vehicle repair or fault remediation |
| `food_on_shift` | Food purchased during a work shift |

`maintenance` and `repair` are complete manual expenses. They do not create a
Garage gap and do not make a calculation partial. Garage remains unchanged and
is only a deferred future integration.

## Persistence model

### `expense_settings`

- `user_id uuid` — primary key, Auth-user foreign key, owner identity;
- `enabled boolean` — whether Expenses is active;
- `active_categories text[]` — unique subset of the five canonical categories;
- `created_at timestamptz`, `updated_at timestamptz` — technical timestamps.

An enabled settings row must contain at least one category.

### `expenses`

- `id uuid` — stable primary key;
- `user_id uuid` — required Auth-user foreign key and owner identity;
- `category text` — one of the five canonical categories;
- `amount numeric` — positive PLN amount;
- `currency text` — always `PLN`;
- `expense_date date` — actual calendar date used by filters and calculations;
- `paid_period_from date`, `paid_period_to date` — required together only for
  `rental`, inclusive at both ends;
- `created_at timestamptz`, `updated_at timestamptz` — technical timestamps.

`created_at` never replaces `expense_date` in financial attribution. A user may
record an expense for an earlier calendar day.

## Money rules

- Currency is PLN only.
- Canonical client payloads use base-10 decimal strings.
- Minimum amount: `0.01` PLN.
- Maximum amount: `999999.99` PLN.
- At most two decimal places are accepted; greater precision is rejected.
- Client calculations use exact string/minor-unit arithmetic, not JavaScript
  binary floating point.
- Derived values may be negative and are not persisted as authoritative totals.

The lower bound and scale checks are introduced by migration `202608130001`.
The upper bound is introduced by forward-only migration `202608140001`; that
migration does not rewrite user rows and must be verified on Staging before a
separately approved Production rollout.

## Calendar and rental rules

- Date-only values use exact `YYYY-MM-DD` and are never converted through UTC.
- Range boundaries are inclusive.
- A rental row stores the payment date in `expense_date`, the paid-period start
  in `paid_period_from`, and the final paid day in `paid_period_to`.
- `paid_period_to >= paid_period_from`.
- The full rental amount contributes only to the month containing
  `expense_date`; it is not prorated across the paid period.
- Rental is ordinary CRUD. No weekly rate, rental-period source, overlap rule,
  close-and-create RPC, proration, or rental idempotency model exists in V1.

## Calculations

For a requested calendar range:

- `G = base income + app tips + cash tips + bonuses` across recorded Work rows;
- `E` is the exact sum of all five Expenses categories whose `expense_date` is
  inside the range;
- `T` is the tax deduction produced by the existing configured Work tax logic.

| Mode | Formula |
| --- | --- |
| `gross` | `G` |
| `after_tax_and_fees` | `G - T` |
| `after_recorded_expenses` | `G - E` |
| `after_all_deductions` | `G - T - E` |

BRUTTO income after expenses is `G - E`. NETTO income after expenses is
`G - T - E`. Expenses are subtracted exactly once.

## Availability and failure behavior

Every calculation result distinguishes `available`, `partial`, `unavailable`,
and `not_configured` and carries a nullable value plus missing components.

- A successfully queried empty Expenses result is known zero.
- A failed Expenses read makes every Expenses-dependent result unavailable;
  the client must not substitute zero.
- A NETTO mode is not available when the current tax logic cannot reliably
  determine `T`; tax is never silently assumed to be zero.
- `partial` always has a non-empty missing-component list and is never final.
- Activation of maintenance or repair is not a missing component.

## Ownership, RLS, and operations

Both tables enable RLS. Authenticated users may select, insert, update, and
delete only rows where `user_id = auth.uid()`. Clients derive the current user
from Supabase Auth and never need an elevated browser credential.

Expenses settings use owner-scoped upsert. Expense records use owner-scoped
select, insert, update, and delete. Invalid category, currency, amount, date, or
rental period is rejected by client validation and database constraints.

Stable client domain errors are:

- `EXPENSES_AUTH_REQUIRED`;
- `EXPENSES_READ_FAILED`;
- `EXPENSES_WRITE_FAILED`;
- `EXPENSES_INVALID_CATEGORY`;
- `EXPENSES_INVALID_AMOUNT`;
- `EXPENSES_INVALID_DATE`;
- `EXPENSES_INVALID_RENTAL_PERIOD`.

Internal SQL details are not user-facing error text.

## Rollout state

- Web runtime: implemented against Supabase owner CRUD.
- Staging migration `202608130001`: applied and verified.
- Staging migration `202608140001`: local forward-only draft pending explicit
  remote approval.
- Production Expenses schema: not applied by this local stage.
- Mobile implementation and compatibility catch-up: paused/deferred and not a
  gate for this owner-approved Web rollout.
- Garage integration: deferred; Garage contract/runtime are unchanged.

The shared contract remains `0.3.0-draft` until the owner approves a later
versioned snapshot. No remote migration is authorized by this document alone.
