# API Contract

Contract version: `0.2.0-draft`
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
| `garage_rules` | Select, insert, update, delete | `app/garage/page.tsx` | `partially_verified` | Not equivalent to Expenses |
| `garage_history` | Select, insert | `app/garage/page.tsx` | `partially_verified` | Not equivalent to Expenses |
| RPC | No call sites or callable generated functions found | `lib/database.types.ts`, repository search | `not_used` | Trigger helper is not an RPC |
| Edge Functions | No invocation or function source found | repository search | `not_used` | None today |
| Storage | No Storage calls found | repository search | `not_used` | None today |

The public schema and access claims above were verified against the named Staging revision `202608020002`. Production remains unchanged and was not used to fill evidence gaps.

## Work record contract

The current Web operation writes one `work_shifts` row per user and calendar date. Verified Staging requires `user_id`, provides no ownership default, retains the Auth-user foreign key, and enforces unique `(user_id, date)`. Create and update payloads explicitly include `user_id`, distance, hours, and platform-specific income, orders, app tips, cash tips, bonuses, plus an optional trimmed custom name for `other`.

Supported platform identifiers are `uber`, `wolt`, `bolt`, `glovo`, `stuart`, and `other`. For `other`, non-zero metrics require a non-empty trimmed name in local migration evidence. Cash tips are non-negative in both Web validation and local constraint evidence. General non-negativity for every other metric is not verified and must not be invented by Mobile.

Web reads all owned rows, performs filters and aggregations client-side, and writes directly. Errors from mutations are surfaced to the UI; several read paths do not expose structured errors. No shared error envelope or retry/idempotency contract exists.

## Profile operation contract

Profile creation is canonical at the Auth-user database trigger. It inserts the Auth identifier and an optional non-empty metadata nickname, never overwrites an existing profile, and lets uniqueness conflicts fail atomically. Client upserts are idempotent recovery/UX paths, not competing bootstrap authorities. A signup without nickname metadata receives a profile with `NULL` nickname and must complete the existing nickname flow.

## Multi-write warning

Garage history insertion followed by a garage-rule update is implemented as two direct client writes. It can partially fail and therefore meets the RPC criteria if it becomes shared Mobile behavior. It is not part of the current shared Expenses or rental contract.
