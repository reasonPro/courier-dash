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
and on Staging. Generated public types differ only by the four new fields in
Row/Insert/Update and the observed PostgREST version (14.15).

## Verification status

Final local tests: 330 tests PASS; lint and typecheck PASS. Local browser
UK/PL/EN/RU × 1440/390/320 showed seven cards and no horizontal overflow.
Decimal-comma save/reload retained new and existing settings. Seven synthetic
platforms, each with base 1000 + online tips 100 + bonuses 100 + cash tips 100,
at 27.77% gave BRUTTO 9100.00 and NETTO 6767.32 on both Work and Expenses.
The independent history toggle retained BRUTTO. Modal focus cycles internally;
mobile stacking keeps its controls above the floating add buttons. Preview and
Production verification are pending.

Fresh private logical Production backup: 2026-11-22 09:52:33 UTC, outside Git/public
artifacts with restricted owner/SYSTEM ACL. It includes full database schema/data
and roles without passwords. Restore into a new network-disabled container passed;
49/49 table counts/content digests and public metadata counts matched Production.
Managed role grantor adaptation is local to restore only. This is not PITR: preserve
incident-time state and reconcile writes made after backup before any data recovery;
never overwrite the live database with this snapshot. No existing database was reset.
