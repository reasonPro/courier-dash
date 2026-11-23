# Stuart / Other tax settings — release evidence

## Scope and baseline

Production baseline: `d31d0d9922c37c546e4841cdcdc085072ead6f33`, READY deployment
`dpl_6PZjWgjM5wQqcaGDjsK5cuaF3hZq`. This deployment is the Web rollback target.
Only Stuart / Other tax support is included. Annual-report development, leaderboard
prototypes, PDF generation and Garage integration are excluded.

## Behavior approved by owner

All seven stable IDs participate in the existing shared tax helper. Each platform's
percentage applies only to its own base income, included online tips and bonuses;
cash tips are not reduced. Other uses ID `other`, never its editable display name.
Absent new fields default to `none` / `0`, without copying another platform's rate.

The existing common fixed-fee mechanism is deliberately unchanged. Adding Stuart
and Other to it means their eligible income participates in the non-Glovo shared
denominator, even in `none` mode. Existing shared fees can therefore reduce that
income; this is not an automatically assigned percentage rate. Owner explicitly
withdrew isolation of the new platforms' fixed fees for this release.

Deferred issues: Glovo contributes configured fixed fees to the common sum but is
excluded from both its denominator and deductions. Glovo-only fixed fees therefore
do not reduce income. Active ISO weeks are capped at four per monthly context.
Neither behavior is corrected in this release. Fixed-fee redesign is a separate task.

## Migration and rollback

`202611210001_add_stuart_other_tax_settings.sql` adds four columns and two mode
checks to `public.tax_settings`. Defaults are `none` and `0`. Existing platform
values, work records, ownership, RLS, grants, triggers and Auth are unchanged.
Old Web ignores these additive fields. Apply schema before new Web writes.
Web rollback retains additive columns and any newly saved settings; no DROP or
data reset. A database restore is not the ordinary Web rollback procedure.

Production metadata preflight verified existing owner SELECT/INSERT/UPDATE policies,
RLS enabled, unique `user_id`, Auth FK and migration history through `202609160001`.
New columns were absent before this release. Staging was restored by the owner;
equivalent schema/history/RLS checks passed. The owner separately approved applying
this exact migration on Staging and, after Preview/backup gates, Production.
Staging application passed, including a transaction-local digest assertion preserving
all pre-existing tax values. Rollback-only seven-platform persistence, mode constraint,
cross-owner SELECT/INSERT/UPDATE denial and anonymous-denial tests passed locally
and on Staging. Final public types match Production exactly and differ from the
release baseline only by the four new fields in Row/Insert/Update. Production
reports PostgREST 14.5; Staging reports 14.15. No unrelated object was removed.

Production migration `202611210001` applied on 2026-11-23 after the Preview and
backup gates. Tax metadata (17 columns, constraints, policies and grants) matches
Staging exactly; RLS remains enabled. A transaction-local digest assertion proved
all old tax values were preserved, including timestamps; new modes default to
`none` and values to `0`. No work/expense/Auth rows were mutated by the migration.
An initial preflight incorrectly expected 15 old columns instead of 13 and aborted
before DDL. Read-only verification confirmed zero new fields/history entry; the
guard was corrected to the exact old-column list, then the unchanged SQL applied.

## Verification status

Final local tests: 330 tests PASS; lint and typecheck PASS. Local browser
UK/PL/EN/RU × 1440/390/320 showed seven cards and no horizontal overflow.
Decimal-comma save/reload retained new and existing settings. Seven synthetic
platforms, each with base 1000 + online tips 100 + bonuses 100 + cash tips 100,
at 27.77% gave BRUTTO 9100.00 and NETTO 6767.32 on both Work and Expenses.
The independent history toggle retained BRUTTO. Modal focus cycles internally;
mobile stacking keeps its controls above the floating add buttons. Final Webpack
build passed after the Preview-discovered stacking fix (tax modal above z-90 actions).

Staging Preview `41ec6d722fecd851a7e7d7100b558b86646460d7` is READY:
https://courier-dash-pmxssc8bi-romans-projects-388d465a.vercel.app
Branch-scoped Preview variables target Staging fingerprint `52e93ed81919`;
shared Production variables were unchanged. Authenticated synthetic-account UI
verified percent/weekly/monthly/none persistence, decimal comma, reload/re-login,
preservation of existing Pyszne 10%, UK/PL/EN/RU and 320/390/1440 layouts.
The save button is uncovered at mobile width, Tab cycles inside the dialog, Escape
closes it, and console errors were absent. New test settings were returned to none.
PR: https://github.com/reasonPro/courier-dash/pull/25
Production Web deployment verification remains the final post-merge gate.

Fresh private logical Production backup: 2026-11-22 09:52:33 UTC, outside Git/public
artifacts with restricted owner/SYSTEM ACL. It includes full database schema/data
and roles without passwords. Restore into a new network-disabled container passed;
49/49 table counts/content digests and public metadata counts matched Production,
rechecked on 2026-11-23 immediately before the successful migration.
Managed role grantor adaptation is local to restore only. This is not PITR: preserve
incident-time state and reconcile writes made after backup before any data recovery;
never overwrite the live database with this snapshot. No existing database was reset.
