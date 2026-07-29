# CourierDash Web — поточний стан

## Остання перевірка

- Дата: 2026-07-29.
- Branch створено від актуального <code>main</code> commit <code>06dcbc0e0cbf0c7ef528a0e93d98d0da768c80a7</code>.
- Snapshot підтверджено read-only аудитом локального repository.
- Remote Supabase state не перевірявся: <code>REMOTE STATE: UNKNOWN</code>.

## Поточна фаза

[Roadmap](./COURIERDASH_ROADMAP.md) позначає PHASE 2.1 як <code>COMPLETED</code>. Поточний напрям — PHASE 2, auth і email flows.

## Остання завершена значна задача

PHASE 2.1 — єдина політика auth routes. Реалізація міститься в commit <code>12cf2ee36f087431f2ded052d54d01b220043006</code>, а merge commit у <code>main</code> — <code>06dcbc0e0cbf0c7ef528a0e93d98d0da768c80a7</code>.

Перед нею завершено Annual Report correctness fix: чинний report враховує Stuart, Other, cash tips і відповідні orders та має safe division.

## Наступна задача

PHASE 2.2 — відновлення пароля. У локальному codebase recovery flow ще не знайдено.

## Реалізована функціональність

- Public Landing Page та login/register flows.
- Єдина client-side route policy для public, login-specific і protected routes.
- Work shift CRUD з Uber, Wolt, Bolt, Glovo, Stuart і named Other.
- Окремі platform fields для income, orders, online tips, cash tips і bonuses.
- Облік hours і distance, calculator робочого часу з breaks.
- Місячні totals, averages, charts, personal best day і tax/fee presentation.
- Поточний Annual Report із місячною/річною агрегацією, charts і personal records.
- Garage rules та routine/repair history.
- Localization PL, UK, EN і RU.

Planned expenses, rentals, Annual Report 2.0, exports і leaderboard не належать до реалізованої функціональності.

## Поточні routes

| Route | Стан |
| --- | --- |
| <code>/</code> | Public landing; authenticated user переходить на <code>/work</code>. |
| <code>/login</code> | Login-specific; authenticated user переходить на <code>/work</code>. |
| <code>/work</code> | Protected Work dashboard. |
| <code>/work/year</code> | Protected current Annual Report. |
| <code>/garage</code> | Protected Garage. |

## Поточний стан тестів і перевірок

На 2026-07-29:

- <code>npm run lint</code> — пройдено;
- <code>npm run typecheck</code> — пройдено;
- <code>npm test</code> — 5 test files, 54 tests, усі пройдено;
- production build у docs-only задачі не запускався.

Перевіряються auth route policy, Work platforms і cash tips, worked-hours logic, Annual Report calculations та локальний Supabase schema snapshot. У цій задачі application code, tests і dependencies не змінюються.

## Supabase state

Локально наявні:

- <code>lib/database.types.ts</code>;
- <code>supabase/schema.snapshot.json</code>, captured 2026-07-24;
- два before-snapshots;
- <code>supabase/config.toml</code>;
- дві migrations для Stuart/Other і cash tips.

Generated types і snapshot містять tables <code>garage_history</code>, <code>garage_rules</code>, <code>profiles</code>, <code>tax_settings</code> і <code>work_shifts</code>. Application code використовує всі п’ять.

Відповідність цих artifacts production має статус <code>REMOTE STATE: UNKNOWN</code>. Перед будь-якою новою migration потрібен окремий read-only audit фактичної linked remote schema.

## Відомі проблеми та технічний борг

- Migration history не містить bootstrap migrations для п’яти базових tables; локальна history є incomplete.
- Generated types мають nullable fields, зокрема частину owner і Garage columns, тоді як локальні <code>GarageRule</code>/<code>GarageHistory</code> models у <code>app/garage/page.tsx</code> трактують їх як non-null.
- <code>app/work/year/page.tsx</code> має hardcoded список років <code>2025</code>, <code>2026</code>, <code>2027</code> і hardcoded <code>2026</code> для назв місяців.
- Є pure platform та annual helpers, але окремої shared analytics foundation для dashboard, periods і Annual Report ще немає.
- Поточні tax calculations залишаються inline у <code>app/work/page.tsx</code> і потребують окремого предметного audit до будь-яких змін.
- <code>garage_current_odometer</code> у browser <code>localStorage</code> не scoped за user id.
- Старий README мав placeholder clone URL, незавершений code fence, claim про global leaderboard і надмірно сильні claims про Netto; у цій документаційній гілці ці твердження прибрано.

## Відомі невизначеності

- Production schema, grants, RLS, Auth settings, redirects, SMTP, Storage buckets і deployed Functions: <code>REMOTE STATE: UNKNOWN</code>.
- Production deployment state не перевірявся.
- Вимоги й architecture CourierDash Mobile не визначаються цим repository.
- Documents, notifications, offline behavior і product roles: <code>UNKNOWN</code>.

## Як оновлювати цей документ

Оновлювати snapshot лише разом із задачею, яка фактично змінює стан проєкту. Потрібно вказати дату, новий <code>main</code> baseline, результати доречних перевірок і підтверджені зміни. Не переносити сюди весь roadmap і не змінювати status фази без фактичного завершення відповідної задачі.
