# API Contract

Contract version: `0.3.0-draft`
Status: `partially_verified`

## Boundary selection

Use direct Supabase access only for simple CRUD that is owned by the signed-in user, protected by verified RLS, does not require a secret or transaction, does not implement a shared calculation, and cannot leave dependent writes partially completed.

Use an RPC when one operation touches multiple tables, requires atomicity, performs a shared aggregation or calculation, needs idempotency, or contains dependent writes whose partial failure would be unsafe.

Use an Edge Function for external APIs, secrets, webhooks, email delivery, payments, integrations, or privileged side effects.

Introduce a versioned service API when the domain becomes complex, integrations multiply, rate limits or audit trails are required, or orchestration no longer fits a single database transaction.

## Observed Web API inventory

| Surface | Operation | Evidence | Status | Mobile relevance |
| --- | --- | --- | --- | --- |
| Auth | Password signup/login/logout/recovery/update | `app/login/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/work/page.tsx` | `partially_verified` | Required |
| `profiles` | Trigger bootstrap, select, insert/upsert | `202608020002_reconcile_ownership_profiles_rls.sql`, `app/page.tsx`, `app/work/page.tsx` | `verified` on Staging | Required; Mobile acceptance pending |
| `work_shifts` | Select, insert, update, delete with explicit required owner | `app/work/page.tsx`, `app/work/year/page.tsx` | `verified` on Staging | Required |
| `tax_settings` | Select, insert, update | `app/work/page.tsx` | `partially_verified` | Deferred unless Mobile exposes Web tax calculations |
| `garage_rules` | Select, insert, update, delete | `app/garage/page.tsx`, `docs/shared/GARAGE_CONTRACT.md` | `verified` on Staging | Owner-only; Mobile must not add rule-edit UI absent from Web |
| `garage_history` | Select, insert | `app/garage/page.tsx`, `docs/shared/GARAGE_CONTRACT.md` | `verified` on Staging | Append-only; manual INSERT is `repair` with null `rule_id` |
| RPC | `complete_garage_routine` | `supabase/migrations/202608090001_expand_garage_contract.sql` | `verified` on Staging | Authenticated RPC verification passed; Web call-site adoption is deferred |
| `expense_settings` | Select and owner upsert | `lib/use-expenses.ts`, `202608130001_create_expenses_schema.sql` | `verified` on Staging | Mobile catch-up paused |
| `expenses` | Owner select, insert, update, delete | `lib/use-expenses.ts`, `202608130001_create_expenses_schema.sql` | `verified` on Staging | All five V1 categories are direct CRUD rows |
| Edge Functions | No invocation or function source found | repository search | `not_used` | None today |
| Storage | No Storage calls found | repository search | `not_used` | None today |

The public Garage schema, access, and RPC claims above were verified against named Staging revision `202608090001`. Production remains unchanged and was not used to fill evidence gaps.

## Work record contract

The current Web operation writes one `work_shifts` row per user and calendar date. Verified Staging requires `user_id`, provides no ownership default, retains the Auth-user foreign key, and enforces unique `(user_id, date)`. Create and update payloads explicitly include `user_id`, distance, hours, and platform-specific income, orders, app tips, cash tips, bonuses, plus an optional trimmed custom name for `other`.

Supported platform identifiers are `uber`, `wolt`, `bolt`, `glovo`, `stuart`, and `other`. For `other`, non-zero metrics require a non-empty trimmed name in local migration evidence. Cash tips are non-negative in both Web validation and local constraint evidence. General non-negativity for every other metric is not verified and must not be invented by Mobile.

Web reads all owned rows, performs filters and aggregations client-side, and writes directly. Errors from mutations are surfaced to the UI; several read paths do not expose structured errors. No shared error envelope or retry/idempotency contract exists.

## Profile operation contract

Profile creation is canonical at the Auth-user database trigger. It inserts the Auth identifier and an optional non-empty metadata nickname, never overwrites an existing profile, and lets uniqueness conflicts fail atomically. Client upserts are idempotent recovery/UX paths, not competing bootstrap authorities. A signup without nickname metadata receives a profile with `NULL` nickname and must complete the existing nickname flow.

## Garage operation contract

The platform-neutral Garage contract is normative in `GARAGE_CONTRACT.md`, with importable contract-owned types in `types/garage.ts` and synthetic cases in `fixtures/garage-cases.json`. Current Web evidence still inserts Garage history and then updates its rule in two client writes. The Staging-verified RPC `public.complete_garage_routine` replaces that pair atomically after a later Web implementation stage.

The verified RPC may return `next_service_odometer = null` for monitoring-only interval `0`. Web and Mobile must use the contract-owned `CompleteGarageRoutineResult` rather than relying only on the generated RPC return type, which currently represents that column as `number`.

The additive migration intentionally leaves the existing owner INSERT policy compatible with deployed Web. A later separately approved hardening migration restricts direct history INSERT to `repair` with `rule_id = null` only after Web adopts the RPC. Garage is not an Expenses implementation.

## Expenses operation contract

Web loads `expense_settings` and `expenses` together for the authenticated user. A successful empty response is a known zero; failure of either read returns `EXPENSES_READ_FAILED` and every Expenses-dependent financial result is unavailable rather than calculated with zero.

Settings activation uses owner-scoped upsert. All five categories (`fuel`, `rental`, `maintenance`, `repair`, `food_on_shift`) use owner-scoped insert/update/delete on `expenses`. Clients send positive base-10 PLN text, `expense_date`, and for rental an inclusive `paid_period_from`/`paid_period_to` pair. The minimum is `0.01`, the maximum is `999999.99`, and scale greater than two is rejected.

Rental is one payment row attributed wholly to its payment `expense_date`; no weekly-rate/proration RPC or separate rental source exists. Maintenance and repair are complete direct Expenses rows. Garage import and Source filtering are deferred.

The database layer is simple owner CRUD protected by RLS and constraints; no Expenses RPC is required. Production application and Production-generated types remain separately gated.
