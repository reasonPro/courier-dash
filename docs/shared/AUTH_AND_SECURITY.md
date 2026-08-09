# Authentication and Security Contract

Contract version: `0.3.0-draft`
Status: `partially_verified`

UI and navigation may differ between Web and Mobile, but authentication meaning, session lifecycle, ownership, and authorization outcomes must remain compatible.

## Verified Staging Auth settings

The separate remote audit identified Staging unambiguously and verified these settings without exporting credentials or user data.

| Field | Value | Environment | verificationStatus | verifiedAt | verifiedBy | evidenceRefs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Email/password | enabled | staging | `verified` | 2026-08-08 | remote audit | `remote-audit:staging-auth-settings` |
| Email confirmation | enabled | staging | `verified` | 2026-08-08 | remote audit | `remote-audit:staging-auth-settings` |
| Signup | allowed | staging | `verified` | 2026-08-08 | remote audit | `remote-audit:staging-auth-settings` |
| Anonymous signup | disabled | staging | `verified` | 2026-08-08 | remote audit | `remote-audit:staging-auth-settings` |
| OAuth providers | disabled | staging | `verified` | 2026-08-08 | remote audit | `remote-audit:staging-auth-settings` |
| Mobile deep links | unresolved | staging | `unresolved` | null | null | `reported:mobile-auth` |

Local `supabase/config.toml` enables email/password signup, disables anonymous signup, has no enabled OAuth provider, and disables email confirmation. This is an intentional local-environment difference, not Staging evidence. Staging confirmation remains enabled as the Phase 2.3 feature gate; Mobile deep-link and recovery behavior still require client acceptance.

## Supported Web flows

- Login uses email and password.
- Signup exists on both the landing surface and `/login`.
- Password recovery sends a redirect to `/reset-password`; the reset page requires a password-recovery session, updates the password, signs out, and returns to login.
- Password validation requires at least six characters and matching confirmation in the Web recovery helper.
- Logout calls Supabase sign-out. The additional removal of a literal local-storage key is implementation-specific and not canonical session behavior.
- Magic link, phone OTP, anonymous access, and OAuth are not implemented in the inspected Web source.

## Mobile review evidence

The review of Mobile HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` against snapshot `0.2.0-draft.2` confirmed a typed Supabase singleton, AsyncStorage session persistence, refresh lifecycle handling, and no secret or session logging. It also confirmed explicit authenticated ownership in Work inserts and owner-scoped Work reads, updates, and deletes.

These are `partially_verified` client-compatibility facts. Staging Auth settings are verified; Mobile deep links, recovery redirects, and the final confirmation UX remain pending Mobile verification.

## Canonical profile invariant

Target invariant: every Auth user that enters an authenticated product flow has exactly one `profiles` row whose primary key equals the Auth user identifier. Nickname is unique and is the only observed profile attribute.

Current mechanism status: `verified` on Staging; Mobile acceptance pending.

The canonical mechanism is the database trigger introduced by `202608020002_reconcile_ownership_profiles_rls.sql`:

1. Every new Auth user receives one profile row keyed by the Auth user identifier.
2. A non-empty metadata nickname is copied atomically; otherwise the profile is created with `NULL` nickname.
3. Existing Web upserts remain idempotent compatibility fallbacks and the nickname modal fills a `NULL` nickname.
4. A nickname collision aborts the Auth insert rather than assigning or overwriting another user's nickname.

The trigger and backfill were verified on Staging, including a rollback-only trigger test. All four existing Auth users have profiles after the backfill; the two previously missing profiles correctly retain `NULL` nickname because no metadata value existed. Mobile acceptance of snapshot `0.2.0-draft.5` remains required before Production.

## Session contract

- The Supabase client is created in the browser from public URL and anonymous-client environment variables.
- Protected Web pages inspect the current session and redirect unauthenticated users to login.
- Public/login route redirection is implemented in client code; no server middleware authorization layer was found.
- Refresh rotation is enabled in local config with a one-hour local token lifetime; detailed Staging token-lifetime parity was not part of this schema reconciliation.
- Mobile deep-link and recovery URL configuration is unresolved.
- Client bundles must contain no elevated server key. The inspected Web client uses only public client credentials by variable name; secret values were not read or exported.

## RLS semantic summary

Verified Staging evidence reports RLS enabled on all five public tables:

- `work_shifts`: authenticated users may operate only where `auth.uid()` equals `user_id`.
- `garage_rules`: authenticated owner equality protects select, insert, update, and delete.
- `garage_history`: authenticated owner equality permits select and insert; update and delete are denied by SQL privileges and have no RLS policy.
- `tax_settings`: owner equality is used for select, insert, and update; no delete policy is reported.
- `profiles`: insert and update are owner-bound; select is visible to `anon` and `authenticated`, while `anon` has column privilege only for `nickname`. No client delete is allowed.

Rollback-only two-account Staging tests passed for profiles, work shifts, tax settings, garage rules, and garage history. Both authenticated identities could perform allowed actions on their own rows; cross-user private reads and mutations were denied; anonymous private access was denied; and anonymous nickname-only read remained available. Test data residue was zero.

### Garage RPC Staging verification

`public.complete_garage_routine` is applied to Staging only and its authenticated verification completed with `PASS`. It accepts no `user_id`, derives the caller from `auth.uid()`, selects only that owner's rule under `FOR UPDATE`, uses an empty locked search path and fully qualified object names, and grants execution only to `authenticated`. Not-found and foreign-owned rule IDs share `GARAGE_RULE_NOT_FOUND`, so the RPC does not disclose cross-user existence. Atomic success, rollback, validation, ownership, and stale-conflict paths were verified, and all synthetic Staging rows were removed.

The current direct history INSERT policy remains temporarily unchanged for deployed-Web compatibility. The INSERT invariant trigger verifies that a new routine references a rule with the same `user_id`; a later hardening migration must restrict direct INSERT to manual repair only after both clients use the RPC.

Client owner filters remain defense in depth only. They do not replace verified RLS, SQL privileges, ownership constraints, or regression tests. Production still has status `not_applied`; Web RPC adoption and Mobile implementation remain deferred.

## Security constraints

- Never export passwords, tokens, session data, user emails, user identifiers, project references, database URLs, or credential values.
- Never use Production to fill an evidence gap.
- Never bypass RLS from Web or Mobile.
- Any Auth or RLS semantic change is Class C; emergency containment is Class D.
