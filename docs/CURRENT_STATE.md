# CourierDash Web — поточний стан

## Остання перевірка

- Дата: 2026-07-29.
- Landing Page V1 feature branch створено від актуального <code>main</code> commit <code>fb4239ccc2b5a88af17bb6047c0a76037b9570d0</code>.
- Snapshot підтверджено локальним аудитом і автоматичними перевірками Landing Page V1.
- Remote Supabase state не перевірявся: <code>REMOTE STATE: UNKNOWN</code>.

## Поточна фаза

[Roadmap](./COURIERDASH_ROADMAP.md) позначає PHASE 3 — сучасна Landing Page — як <code>COMPLETED</code>. Після цього продукт повертається до PHASE 2, auth і email flows.

## Остання завершена значна задача

PHASE 3 — public Landing Page V1 у концепції Courier Command Center. Реалізовано адаптивні секції, HTML/CSS product mockups, локалізацію PL/UK/EN/RU, browser-language fallback на EN, доступний FAQ, анімації без важких dependencies і reduced-motion behavior. Production-стан цієї версії ще не перевірявся.

## Наступна задача

PHASE 2.3 — підтвердження email для нових користувачів. Production Auth settings, redirect allow-list, SMTP та email delivery спочатку потребують окремої перевірки: <code>REMOTE STATE: UNKNOWN</code>.

## Реалізована функціональність

- Public Landing Page для delivery couriers із Hero, demo dashboard, Features, Product showcase, How it works, Platforms, Benefits, FAQ, CTA і footer.
- Наявний login/register modal і password recovery entry збережені; додаткова сторінка <code>/login</code> також веде на recovery flow.
- Ручний вибір мови зберігається в <code>courier_dash_lang</code>; без збереженого вибору перевіряються <code>navigator.languages</code> та <code>navigator.language</code>, а unsupported language отримує EN.
- Landing motion використовує CSS, <code>IntersectionObserver</code> і <code>requestAnimationFrame</code> із підтримкою <code>prefers-reduced-motion</code>.
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
| <code>/forgot-password</code> | Public form запиту neutral recovery email response; доступна з login modal на <code>/</code> і з окремої сторінки <code>/login</code>. |
| <code>/reset-password</code> | Recovery-only form; відкривається після події <code>PASSWORD_RECOVERY</code>, а invalid/expired link має окремий стан. |
| <code>/work</code> | Protected Work dashboard. |
| <code>/work/year</code> | Protected current Annual Report. |
| <code>/garage</code> | Protected Garage. |

## Поточний стан тестів і перевірок

На 2026-07-29:

- <code>npm run lint</code> — пройдено;
- <code>npm run typecheck</code> — пройдено;
- <code>npm test</code> — 7 test files, 71 test, усі пройдено;
- <code>npm run build</code> — production build пройдено.

Перевіряються auth route policy, password recovery validation і URL states, browser-language resolution, Work platforms і cash tips, worked-hours logic, Annual Report calculations та локальний Supabase schema snapshot.

HTTP smoke-check і точна viewport-перевірка Landing Page V1 мають бути виконані до merge або у Vercel Preview. Реальний recovery email, recovery token і password update не перевірялися без контрольованого акаунта.

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
