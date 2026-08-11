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

- Status: `reported_pending_snapshot`.
- Semantic definition: `after_recorded_expenses = G - E`, where `G = base income + app tips + cash tips + bonuses` and `E` is the source-aware total of all five Expenses V1 categories.
- Presentation boundary: `G` does not depend on Work or Annual tips/bonuses display toggles.
- Explicit distinction: this mode is not Netto and does not subtract `T`.
- Affected flows: expenses, statistics.
- Source evidence: owner-confirmed product basis; `docs/shared/EXPENSES_CONTRACT.md`; actual Work/Annual calculations inspected as non-normative runtime evidence.
- Fixture IDs: `expense-four-calculation-modes`.
- Introduced in contract: `0.2.0-draft`.

## EXP-CATEGORY-001 — Expense categories

- Status: `reported_pending_snapshot`.
- Semantic definition: Expenses V1 is PLN-only and includes exactly `fuel`, `rental`, `maintenance`, `repair`, and `food_on_shift`.
- Permitted sources: fuel/manual; rental/rental period; maintenance/manual or Garage; repair/manual or Garage; food on shift/manual.
- Affected flows: expenses.
- Source evidence: owner-confirmed product basis; DEC-025; no matching Expenses or rental tables in repository evidence.
- Fixture IDs: `expense-v1-category-source-matrix`.
- Introduced in contract: `0.2.0-draft`.

Garage remains an accepted separate source contract. Expenses references eligible Garage rows instead of copying them into manual expenses.

## EXP-CALCULATION-MODES-001 — Expenses financial modes

- Status: `reported_pending_snapshot`.
- Semantic definition: `gross = G`; `after_tax_and_fees = G - T`; `after_recorded_expenses = G - E`; `after_all_deductions = G - T - E`.
- `G` always includes base income, app tips, cash tips, and bonuses across included records.
- `T` is a separate tax-and-fee component and is not an expense category.
- Calculated values may be negative and are not authoritative persisted totals.
- Source evidence: owner-confirmed product basis; `docs/shared/EXPENSES_CONTRACT.md`.
- Fixture IDs: `expense-four-calculation-modes`.
- Introduced in contract: `0.3.0-draft`.

## EXP-AVAILABILITY-001 — Calculation availability

- Status: `reported_pending_snapshot`; owner approved on 2026-08-10, implementation not started.
- Required vocabulary: `available`, `partial`, `unavailable`, `not_configured`.
- Missing, failed, or unconfigured inputs are not silently coerced to zero. A successfully queried empty source can be a known zero. A `partial` result has a non-empty missing-component list and is never final.
- Modes that require `T` cannot be `available` until `T` is reliable for the requested range. Current Work tax/fee runtime remains unchanged pending a separate tax audit.
- Source evidence: owner-approved DEC-025; `docs/shared/EXPENSES_CONTRACT.md` Gates 3 and 4.
- Fixture IDs: `expense-result-availability-vocabulary`.
- Introduced in contract: `0.3.0-draft`.

## EXP-SOURCE-IDENTITY-001 — Source identity and double-counting

- Status: `reported_pending_snapshot`; owner approved on 2026-08-10.
- Semantic definition: manual, rental-period, and Garage inputs retain separate source identities; one `(source, sourceRecordId)` contributes at most once.
- Garage `routine` maps to `maintenance`; Garage `repair` maps to `repair`.
- Garage and rental records are not copied into manual expense rows.
- A Garage-derived expense is created or corrected in Garage and cannot be recreated as a manual duplicate.
- Source evidence: owner-approved DEC-025; accepted Garage Contract `0.3.0-draft`.
- Fixture IDs: `expense-garage-reference-no-copy`.
- Introduced in contract: `0.3.0-draft`.

## RENTAL-PERIOD-001 — Vehicle rental periods

- Status: `reported_pending_snapshot`; product behavior owner approved on 2026-08-10, implementation not started.
- Semantic definition: rental is optional and is modeled as a history of periods with weekly price, inclusive start date, and inclusive optional end date. Closing or correcting a period must preserve history rather than rewrite unrelated past periods, and destructive corrections require a warning.
- Calculation direction: `weekly amount × active calendar days / 7` for the inclusive intersection with the requested date range; rental is independent of Work shifts and does not generate copied daily or weekly expense rows.
- Owner-approved boundaries: periods for one owner cannot overlap; normal close-and-create is atomic; correction is a separate controlled action; retryable creates require idempotency keys; PLN inputs have at most two decimal places; intermediate proration is not rounded; the final result uses `ROUND_HALF_UP` to `0.01 PLN`.
- Unresolved implementation details: physical persistence, authorization/RLS, transaction or RPC shape, stable mutation errors, idempotency-key storage, and correction audit mechanics.
- Affected flows: vehicle rental, expenses.
- Source evidence: DEC-011 through DEC-014; owner-approved DEC-025; `docs/shared/EXPENSES_CONTRACT.md`; no matching repository schema.
- Fixture IDs: `rental-owner-overlap-atomicity-and-idempotency`, `expense-pln-decimal-and-rental-rounding`.
- Introduced in contract: `0.2.0-draft`.

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

For Expenses, DEC-025 now provides a flow-specific owner-approved rule: a manual row's actual `YYYY-MM-DD` expense date is distinct from technical `created_at`, may be entered after the fact, and controls filters, history, and financial attribution. Garage dates are consumed without reinterpretation; rental overlap uses inclusive rental calendar dates. Expenses implementation remains pending.

## MONEY-ROUNDING-001 — Precision and rounding

- Status: `unresolved` for Statistics and Reports; `reported_pending_snapshot` for owner-approved Expenses and Vehicle Rental rules.
- Semantic definition: Expenses/rental PLN inputs accept at most two decimal places and use decimal arithmetic. Rental intermediate calculations are not rounded; the final result is rounded to `0.01 PLN` with `ROUND_HALF_UP`. Web and Mobile must use the same oracle. Existing Web fixed-decimal presentation does not implement this contract.
- Affected flows: statistics, reports, expenses, vehicle rental.
- Source evidence: Web formatting call sites; no schema-level money type policy.
- Fixture IDs: `income-decimal-values` validates legacy arithmetic inputs; `expense-pln-decimal-and-rental-rounding` locks the Expenses/rental rule.
- Introduced in contract: `0.2.0-draft`.

Garage has an independent approved persistence rule: PLN only, cost `>= 0`, at most two decimal places, and rejection rather than silent rounding. Garage mileage is an integer from `0` through `2147483647`. Expenses and Vehicle Rental now have the separate DEC-025 rounding rule above; Statistics and Reports remain unresolved.

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
