# CourierDash Garage Contract

Contract version: `0.3.0-draft`
Status: `partially_verified`
Authority: CourierDash Web repository

## Scope

This contract is the platform-neutral Garage boundary for Web and Mobile. It covers the existing single-vehicle maintenance-rule and service-history behavior only. It does not add Expenses integration, a vehicle table, multiple vehicles, or a synchronized odometer.

The current odometer is a client-local calculation parameter. It is not a Supabase field, is not synchronized, and is never imported automatically from Web browser storage. Web and Mobile may remember their own last entered value locally for convenience, and the user may replace it with a larger or smaller non-negative integer at any time.

## Evidence and rollout status

- Staging is verified through revision `202608090001`; `202608090001_expand_garage_contract.sql` was applied to Staging only and has not been applied to Production.
- Authenticated Staging verification of `public.complete_garage_routine`, including ownership, validation, atomicity, stale-conflict behavior, and cleanup of synthetic rows, completed with `PASS`.
- `lib/database.types.ts` was regenerated from the verified Staging revision. The sanitized `supabase/schema.snapshot.json` remains the historical `202608020002` snapshot and is not the latest Garage evidence.
- Canonical rules below govern normalized new writes. Legacy nullable rows remain readable and are not silently deleted, backfilled, or invented.
- During the compatibility window, the deployed Web may continue its existing two-write routine flow. Direct routine INSERT is removed only in a separately approved hardening migration after Web adopts the RPC.
- The contract remains a draft. Web RPC adoption, Mobile implementation, constraint/FK validation, final nullability hardening, and Production rollout remain deferred.

## Database objects

### `public.garage_rules`

| Field | Database type | Current database | Canonical normalized write |
| --- | --- | --- | --- |
| `id` | `bigint` identity | Primary key, non-null | Server-generated primary key |
| `created_at` | `timestamptz` | Non-null, default `now()` | Server-generated instant |
| `name` | `text` | Nullable legacy representation | Required |
| `interval_km` | `numeric` | Nullable legacy representation | Required integer `0…2147483647`; `0` means monitoring-only |
| `last_change_km` | `numeric` | Nullable legacy representation, default `0` | Required integer `0…2147483647` |
| `user_id` | `uuid` | Nullable legacy representation; FK to `auth.users` | Required authenticated owner |

`user_id` references `auth.users(id) ON DELETE CASCADE`. The application can SELECT, INSERT, UPDATE, and DELETE only owner rows under RLS. The current UI creates and deletes rules; routine completion updates `last_change_km`. It does not expose arbitrary rule-field editing as a new user feature.

### `public.garage_history`

| Field | Database type | Current database | Canonical normalized write |
| --- | --- | --- | --- |
| `id` | `bigint` identity | Primary key, non-null | Server-generated primary key |
| `created_at` | `timestamptz` | Non-null, default `now()` | Server-generated instant |
| `service_type` | `text` | Nullable/unrestricted legacy representation | Required; exactly `routine` or `repair` |
| `name` | `text` | Nullable legacy representation | Required |
| `date` | `date` | Nullable legacy representation | Required `YYYY-MM-DD` calendar date |
| `cost` | `numeric` | Nullable/unrestricted legacy representation | Required PLN amount, `>= 0`, at most two decimal places |
| `rule_id` | migration changes `numeric` to `bigint` | Nullable, no current FK | Nullable FK to `garage_rules(id) ON DELETE SET NULL` |
| `odometer` | `numeric` | Nullable/unrestricted legacy representation | Required integer `0…2147483647` |
| `user_id` | `uuid` | Nullable legacy representation; FK to `auth.users` | Required authenticated owner |

History is append-only for application roles: SELECT and INSERT exist; UPDATE and DELETE are not application capabilities. Deleting a rule retains history and cost while setting linked `rule_id` to `null`.

## History invariants

- `repair` means repair or fault remediation. A manual record must use `service_type = 'repair'` and `rule_id = null`.
- `routine` means planned service such as oil, filter, or other scheduled work. At INSERT it must reference an owned rule.
- A stored routine row may later have `rule_id = null` only because its rule was deleted with `ON DELETE SET NULL`, or because it is an untouched legacy row.
- No third history type exists.
- The additive migration uses an INSERT trigger for lifecycle-sensitive rule linkage; a static `routine → rule_id NOT NULL` CHECK would incorrectly block `ON DELETE SET NULL`.

## Date semantics

- Garage service dates are date-only calendar values in exact `YYYY-MM-DD` form.
- They represent the day selected on the user's device.
- Clients must not construct, parse, or display them through a UTC conversion that can change the day.
- The `date` field never contains a time or timezone.
- `created_at` remains a server timestamp and is not a service date.

## Numeric semantics

- Mileage inputs and persisted mileage values are integers from `0` through `2147483647` inclusive.
- Negative, fractional, non-finite, or larger mileage is rejected, never rounded.
- Garage currency is PLN only. There is no Garage currency column.
- Cost is `>= 0` with at most two decimal places. Greater precision is rejected, never rounded silently.
- Presentation may render two decimal places, but persistence validation happens before formatting.
- A current local odometer can increase or decrease. It is not database state.

## Operations

| User behavior | Canonical operation | Result |
| --- | --- | --- |
| Load Garage | Owner-filtered SELECT from rules and history | Owner rows; legacy nullable rows may be returned |
| Create rule | INSERT `garage_rules` with session owner | Normalized rule |
| Delete rule | DELETE owned `garage_rules` row | Rule removed; linked history retained with null `rule_id` |
| Add repair | INSERT `garage_history` as `repair`, null `rule_id` | Append-only repair record |
| Complete routine | RPC `public.complete_garage_routine` | Atomic routine history row plus updated rule |
| Edit/delete history | Not implemented | No application operation |
| Store current odometer | Client-local only | No Supabase operation |

Clients derive the owner from the authenticated session. Platform-neutral inputs omit arbitrary `user_id`; direct table adapters set it only to the current session user.

## `public.complete_garage_routine`

Parameters, in order:

1. `p_rule_id bigint`
2. `p_expected_last_change_km numeric`
3. `p_date date`
4. `p_odometer integer`
5. `p_cost numeric`

The expected mileage is the optimistic concurrency token and may be `null` only when reading a legacy nullable rule. The RPC does not accept `user_id`, history name, or service type.

The function:

1. requires `auth.uid()`;
2. loads the owned rule with `FOR UPDATE`;
3. compares `last_change_km` with `p_expected_last_change_km` using null-safe equality;
4. rejects a stale value with `GARAGE_CONFLICT`;
5. validates the rule and inputs;
6. inserts one `routine` history row using the rule name, rule ID, and authenticated owner;
7. updates the same rule's `last_change_km`;
8. returns the history row, updated rule values, and `next_service_odometer`;
9. rolls back both writes on every exception.

Current Web rules have kilometre intervals and no persisted date interval. `next_service_odometer` is `p_odometer + interval_km` when the interval is greater than zero and is `null` for monitoring-only interval `0`. No next-service date is invented.

The generated RPC return type currently represents `next_service_odometer` as `number`, but the verified runtime result can be `null`. Web and Mobile adapters must use the contract-owned `CompleteGarageRoutineResult` and must not rely on the generated RPC return type alone.

The function is `SECURITY DEFINER`, has an empty locked search path, uses fully qualified objects, performs explicit ownership checks, revokes default/public execution, and grants execution only to `authenticated`.

## RPC result

The RPC returns one row with:

- `history_id bigint`;
- `history_created_at timestamptz`;
- `rule_id bigint`;
- `rule_name text`;
- `service_type text` with value `routine`;
- `service_date date`;
- `odometer integer`;
- `cost numeric`;
- `interval_km numeric`;
- `last_change_km numeric`;
- `next_service_odometer numeric | null`.

## Stable domain errors

| Domain code | SQLSTATE | Meaning | Retry |
| --- | --- | --- | --- |
| `GARAGE_AUTH_REQUIRED` | `CDG01` | No authenticated user | No; authenticate |
| `GARAGE_RULE_NOT_FOUND` | `CDG02` | Rule absent or not owned | No |
| `GARAGE_INVALID_DATE` | `CDG03` | Missing/invalid service date | No |
| `GARAGE_INVALID_ODOMETER` | `CDG04` | Mileage outside canonical rules | No |
| `GARAGE_INVALID_COST` | `CDG05` | PLN amount outside canonical rules | No |
| `GARAGE_CONFLICT` | `CDG06` | Rule changed since client read | Yes; refetch before retry |
| `GARAGE_READ_FAILED` | client mapping | Read failure outside the RPC | Conditional |
| `GARAGE_WRITE_FAILED` | `CDG08` or client mapping | Invalid legacy rule or unexpected write failure | Conditional |
| `GARAGE_INVALID_HISTORY_TYPE` | `CDG09` | Invalid type/rule linkage on INSERT | No |

Database messages are stable machine codes, not localized user copy. Web and Mobile map them to localized messages and never display internal SQL details.

## Legacy strategy

- Legacy nullable representations remain in contract types because Stage 1 preserves existing rows and does not apply final database `NOT NULL` metadata.
- `CHECK ... NOT VALID` constraints preserve existing rows while enforcing normalized new INSERT/UPDATE rows.
- No migration in this draft deletes, backfills, or invents legacy Garage values.
- The `rule_id` conversion has a fail-closed precondition for fractional/out-of-range non-null values.
- The FK is added `NOT VALID`; future validation requires separate sanitized Staging evidence and approval.
- Generated Supabase types were regenerated from verified Staging revision `202608090001`. They continue to expose nullable legacy columns because `CHECK ... NOT VALID` does not change column-level nullability metadata.

## Compatibility window

The additive migration does not tighten the current `garage_history` INSERT RLS policy, so the deployed Web's existing valid direct routine INSERT continues to work. After Web adopts the RPC and both clients pass Staging verification, a separately approved hardening migration must restrict direct history INSERT to manual `repair` rows with `rule_id = null`, validate eligible constraints/FK, and apply final database `NOT NULL` metadata where safe.
