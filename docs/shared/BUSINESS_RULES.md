# Shared Business Rules

Contract version: `0.3.0-draft`

## TERM-APP-TIPS-001 — Application tips

- Status: `verified`
- Semantic definition: `app_tips` means tips recorded and paid through a delivery platform. It excludes cash tips.
- Affected flows: work, statistics, reports.
- Source fields: Mobile `appTips`; database `tips_uber`, `tips_wolt`, `tips_bolt`, `tips_glovo`, `tips_stuart`, `tips_other`; Web model `appTips`; Web UI label “App tips”.
- Legacy language: “online tips” is a deprecated synonym and must not become a new field.
- Source evidence: `lib/work-platforms.ts`, `app/work/components/PlatformSection.tsx`, `app/work/year/annual-report-calculations.ts`.
- Fixture IDs: `income-all-platforms`, `income-null-and-missing`.
- Introduced in contract: `0.2.0-draft`.

## STAT-BRUTTO-001 — Statistics Brutto

- Status: `partially_verified`.
- Semantic definition: `Brutto = base income + app tips + cash tips + bonuses` across included work records.
- Exclusions: expenses, rental, income-after-expenses, and tax Netto are excluded.
- Completion rule: Statistics is complete without Expenses.
- Affected flows: statistics, reports.
- Source evidence: reported Mobile milestone; `lib/work-platforms.ts`; `app/work/year/annual-report-calculations.ts`.
- Fixture IDs: `income-all-platforms`, `income-zero-values`, `report-six-platform-summary`.
- Introduced in contract: `0.2.0-draft`.

Mobile milestone evidence: implementation commit `3332409f7b549a255235eb30aa182ada3302c519` (“feat: add statistics overview”) and documentation commit `f4126fbb58531be751f67b059ada54c451ececdd` (“docs: record statistics milestone”). An independent Mobile compatibility review at HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` evaluated snapshot `0.2.0-draft.2` and passed all supplied income/report cases. It confirmed Mobile calculation compatibility for base income, app tips, cash tips, bonuses, all six platforms, Stuart, Other, orders, and a zero denominator.

This promotes the calculation evidence to `partially_verified`, not the complete backend contract. Staging schema, timezone, and shared rounding remain unresolved.

## MONEY-CURRENCY-001 — Currency

- Status: `partially_verified`.
- Semantic definition: monetary values are reported and displayed in PLN.
- Affected flows: work, statistics, reports, expenses, vehicle rental.
- Source evidence: Web UI currency labels and product copy.
- Fixture IDs: `income-decimal-values`.
- Introduced in contract: `0.2.0-draft`.

No verified schema-level currency column or multi-currency mechanism exists. Currency changes are Class C.

## WORK-RECORDED-INCOME-001 — Recorded work income

- Status: `partially_verified`.
- Semantic definition: one work record contains date, distance, hours, and zero or more platform metrics for the six supported platform identifiers. Platform metrics are base income, orders, app tips, cash tips, and bonuses. `other` may have a custom display name.
- Null semantics: Web aggregation converts null or missing numeric platform values to zero. This behavior is verified in local unit tests but not against Staging.
- Affected flows: work, statistics, reports.
- Source evidence: `lib/work-platforms.ts`, `app/work/page.tsx`, `lib/database.types.ts`.
- Fixture IDs: `income-all-platforms`, `income-null-and-missing`, `income-multiple-records`.
- Introduced in contract: `0.2.0-draft`.

The Mobile fixture runner normalized null and missing inputs into the domain's non-negative numeric representation before calculation. This proves calculation behavior after normalization; it does not prove remote row nullability, database defaults, or Staging data shape.

## EXP-INCOME-AFTER-001 — Income after expenses

- Status: `verified` for Web runtime and Staging Expenses schema.
- Semantic definition: `after_recorded_expenses = G - E`, where `G = base income + app tips + cash tips + bonuses` and `E` is the total of all five user-owned Expenses V1 categories attributed by `expense_date`.
- Presentation boundary: `G` does not depend on Work or Annual tips/bonuses display toggles.
- BRUTTO after expenses is `G - E`; NETTO after expenses is `G - T - E` when the existing Work tax logic provides reliable `T`.
- Affected flows: expenses, statistics.
- Source evidence: owner-confirmed product basis; `docs/shared/EXPENSES_CONTRACT.md`; actual Work/Annual calculations inspected as non-normative runtime evidence.
- Fixture IDs: `expense-four-calculation-modes`.
- Introduced in contract: `0.2.0-draft`.

## EXP-CATEGORY-001 — Expense categories

- Status: `reported_pending_snapshot`.
- Semantic definition: Expenses V1 is PLN-only and includes exactly `fuel`, `rental`, `maintenance`, `repair`, and `food_on_shift`.
- All five categories are stored as ordinary owner-owned Expenses rows. Rental additionally requires an inclusive paid-period start/end.
- Affected flows: expenses.
- Source evidence: owner-confirmed product basis; DEC-025; `202608130001_create_expenses_schema.sql`; Web runtime.
- Fixture IDs: `expense-v1-category-source-matrix`.
- Introduced in contract: `0.2.0-draft`.

Maintenance and repair are complete manual Expenses categories. Garage import is a deferred future integration and is not a current source or completeness requirement.

## EXP-CALCULATION-MODES-001 — Expenses financial modes

- Status: `verified` for current Web calculations; Mobile catch-up is paused.
- Semantic definition: `gross = G`; `after_tax_and_fees = G - T`; `after_recorded_expenses = G - E`; `after_all_deductions = G - T - E`.
- `G` always includes base income, app tips, cash tips, and bonuses across included records.
- `T` is a separate tax-and-fee component and is not an expense category.
- Calculated values may be negative and are not authoritative persisted totals.
- Source evidence: owner-confirmed product basis; `docs/shared/EXPENSES_CONTRACT.md`.
- Fixture IDs: `expense-four-calculation-modes`.
- Introduced in contract: `0.3.0-draft`.

## EXP-AVAILABILITY-001 — Calculation availability

- Status: `verified` for current Web availability behavior.
- Required vocabulary: `available`, `partial`, `unavailable`, `not_configured`.
- Missing, failed, or unconfigured inputs are not silently coerced to zero. A successfully queried empty source can be a known zero. A `partial` result has a non-empty missing-component list and is never final.
- Modes that require `T` cannot be `available` until `T` is reliable for the requested range. Current Work tax/fee runtime remains unchanged pending a separate tax audit.
- Source evidence: owner-approved DEC-025; `docs/shared/EXPENSES_CONTRACT.md` Gates 3 and 4.
- Fixture IDs: `expense-result-availability-vocabulary`.
- Introduced in contract: `0.3.0-draft`.

## EXP-PERSISTENCE-001 — Owner-owned Expenses rows

- Status: `verified` on Staging for migration `202608130001`.
- Semantic definition: `expense_settings` and `expenses` are owned by `auth.uid()` and protected by RLS. All five categories use direct owner CRUD.
- A successful empty query is a known zero; a failed Expenses query is unavailable and is never coerced to zero.
- Garage integration and a Source filter are not part of current V1.
- Source evidence: `202608130001_create_expenses_schema.sql`; `lib/use-expenses.ts`.
- Fixture IDs: `expense-v1-five-manual-categories`, `expense-read-failure-is-unavailable`.
- Introduced in contract: `0.3.0-draft`.

## EXP-RENTAL-PAYMENT-001 — Rental payment

- Status: `verified` in current Web runtime and Staging schema.
- Semantic definition: rental is one ordinary expense with positive PLN amount, payment `expense_date`, inclusive `paid_period_from`, and inclusive `paid_period_to`.
- The full amount contributes only to the month containing `expense_date`; the paid period is not prorated across months.
- No weekly-rate history, rental-period source, overlap rule, close-and-create RPC, correction workflow, or create idempotency model is part of V1.
- Source evidence: DEC-025; `202608130001_create_expenses_schema.sql`; `lib/expenses-prototype.ts`.
- Fixture IDs: `rental-payment-month-attribution`.
- Introduced in contract: `0.3.0-draft`.

## REPORT-ANNUAL-001 — Annual report

- Status: `verified` for local calculation behavior and `partially_verified` overall.
- Semantic definition: aggregate all six platforms, including Stuart and Other, cash tips, and orders. When tips and bonuses are included, the total follows STAT-BRUTTO-001. Averages return zero when the denominator is zero.
- Affected flows: reports, statistics.
- Source evidence: `app/work/year/annual-report-calculations.ts` and its unit tests.
- Fixture IDs: `report-six-platform-summary`, `report-zero-denominator`.
- Introduced in contract: `0.2.0-draft`.

Mobile pure arithmetic helpers satisfy the supplied report numeric fixtures. Mobile Annual Report itself is not implemented and remains blocked by timezone-boundary and shared-rounding policy. Staging schema/RLS evidence is verified through revision `202608020002`.

## TIME-LOCAL-DATE-001 — Calendar-date semantics

- Status: `reported_pending_snapshot` with a Web mismatch.
- Reported Mobile definition: store dates as local `YYYY-MM-DD`; interpret day and month in device local time; weeks run Monday through Sunday.
- Web evidence: several defaults derive dates with UTC `toISOString()`, and report/display paths parse date-only strings through JavaScript Date. This can move a calendar boundary by timezone.
- Affected flows: work, statistics, reports, garage, vehicle rental.
- Source evidence: reported Mobile behavior; `app/work/page.tsx`, `app/garage/page.tsx`, `app/work/year/page.tsx`.
- Fixture IDs: none until a platform-neutral boundary oracle is approved.
- Introduced in contract: `0.2.0-draft`.

For Garage in contract `0.3.0-draft`, the owner-approved rule is narrower and canonical: `garage_history.date` is an exact `YYYY-MM-DD` calendar date chosen on the device and must not pass through UTC conversion. The existing Web Garage runtime does not yet satisfy this rule and is intentionally deferred to the post-review implementation stage.

For Expenses, DEC-025 provides a flow-specific owner-approved rule: an expense row's actual `YYYY-MM-DD` expense date is distinct from technical `created_at`, may be entered after the fact, and controls filters, history, and financial attribution. Rental paid-period dates are inclusive and descriptive; payment-month attribution uses `expense_date`. Garage integration is deferred.

## MONEY-ROUNDING-001 — Precision and rounding

- Status: `unresolved` for Statistics and Reports; `verified` for current Expenses client validation and totals.
- Semantic definition: Expenses accepts `0.01…999999.99` PLN with at most two decimal places and uses exact decimal string/minor-unit arithmetic. Values outside the range or scale are rejected, not rounded into range.
- Affected flows: statistics, reports, expenses, vehicle rental.
- Source evidence: Web formatting call sites; no schema-level money type policy.
- Fixture IDs: `income-decimal-values` validates legacy arithmetic inputs; `expense-amount-boundaries` locks the Expenses rule.
- Introduced in contract: `0.2.0-draft`.

Garage has an independent approved persistence rule: PLN only, cost `>= 0`, at most two decimal places, and rejection rather than silent rounding. Garage mileage is an integer from `0` through `2147483647`. Expenses uses the separate bounded rule above; Statistics and Reports remain unresolved.

## GARAGE-HISTORY-001 — Routine and repair history

- Status: `draft_pending_schema_snapshot`.
- `routine` is planned maintenance and is created canonically through `complete_garage_routine` with the owned rule ID.
- `repair` is manual repair/fault remediation and has `rule_id = null`.
- Deleting a rule keeps history and cost and sets `rule_id = null`.
- Existing legacy nulls are readable but are never silently deleted or backfilled.
- Source: `docs/shared/GARAGE_CONTRACT.md`, `docs/shared/fixtures/garage-cases.json`.

## GARAGE-ODOMETER-LOCAL-001 — Current odometer

- Status: `proposed` pending Mobile acceptance.
- Current odometer is a local calculation parameter, not Supabase data.
- Web and Mobile may remember separate values locally; values may increase or decrease.
- No backend field, synchronization, or automatic browser-storage import exists.
