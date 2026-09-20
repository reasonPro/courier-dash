# CourierDash Web — поточний стан

## Поточний реліз Work / Pyszne — 2026-09-20

Статус: **локальна перевірка виконана частково; remote rollout заблокований**. Гілка `feat/platform-filter-netto`, основа `origin/main` — `c38e23e2ec3199bd5ddf5daf8b2705966304bdb7`. Нижче збережено історичний snapshot від 2026-07-29; він не є актуальним статусом цього релізу.

- Scope: незалежний BRUTTO/NETTO історії, спільний фільтр платформ, cash tips поза відсотковою базою, Pyszne та його податки, панель «Налаштування статистики», доступна інформаційна підказка UK/PL/EN/RU. Garage → Expenses не включено.
- На ізольованій локальній Supabase застосована `202609160001_add_pyszne_platform.sql`. На справжньому `/work` перевірено створення, читання після reload та редагування synthetic Pyszne; перемикачі незалежні. При доході 2200 PLN, cash tips 50 PLN та ставці 12% NETTO становить 1942 PLN, cash tips залишаються 50 PLN. Контрольний новий запис існує лише в локальному тестовому акаунті.
- Focused Work/Pyszne/platform/Expenses-summary/annual tests: 65 PASS; typecheck, focused release lint і production-equivalent Webpack build: PASS. Підказка перевірена мишею, клавіатурою, Escape, повторним натисканням і натисканням поза нею; mobile 390 px. Це не замінює майбутню Staging/Preview перевірку.
- `courier-dash-staging`, fingerprint `52e93ed81919`, відновлено з паузи без зміни тарифу; `ACTIVE_HEALTHY`. Remote history містить 9 migrations до `202608150001`; Pyszne відсутній. Remote migration у цьому запуску не застосовувалась; generated types не перегенеровувались.
- Preview BLOCKED: наявна Vercel CLI авторизація відхилена (`invalidToken`). Scope Preview environment ще не підтверджений; push/PR/deployment не виконано, щоб не запустити Preview з неперевіреною базою.
- Production BLOCKED: API backups повернув порожній список, PITR вимкнений; актуальна резервна копія та перевірене відновлення ще не забезпечені. Production schema/data не змінювалися. Mobile parity не підтверджено; Mobile catch-up відкладено.

### Обов'язкові умови продовження

Відновити Vercel sign-in локально, не передаючи token у чат; підтвердити branch-scoped Preview → Staging, застосувати лише перевірену Pyszne migration із канонічною версією та виконати Staging/Preview сценарії. Production не починати до завершення цих перевірок і backup/restore gate.

Відкат Web означає повернення попереднього сумісного deployment зі збереженням additive Pyszne schema. Це **не** відновлення даних. При інциденті даних спочатку зберегти поточний стан і нові записи після backup, відновити backup в ізольоване середовище та звірити відновлення; не перезаписувати живу базу старою копією і не видаляти нові Pyszne поля. Ця процедура поки не перевірена практично й не є дозволом обійти backup gate.

## Історичний snapshot — 2026-07-29

## Остання перевірка

- Дата: 2026-07-29.
- Landing Page V2 інтегрована в <code>main</code> merge commit <code>63276c3a42243d2642b49b33cf7b8deadc4cff8e</code>.
- Production-стан Landing Page V2 перевірений і підтверджений власником проєкту.
- Landing-фаза повністю завершена; V1 більше не є окремим актуальним production-напрямом.
- Remote Supabase state не перевірявся: <code>REMOTE STATE: UNKNOWN</code>.

## Поточна фаза

[Roadmap](./COURIERDASH_ROADMAP.md) позначає PHASE 3 — сучасна Landing Page V2 — як <code>COMPLETED</code>. Після завершення Landing продукт повертається до PHASE 2, auth і email flows.

## Остання завершена значна задача

PHASE 3 — Landing Page V2. Фінальна production-версія використовує компактний premium dark дизайн із night-route visual direction, адаптивні секції, HTML/CSS Dashboard preview, product tabs, FAQ, CTA, локалізацію PL/UK/EN/RU, browser-language fallback на EN, анімації без важких dependencies і reduced-motion behavior.

У header використовується офіційний <code>app/icon.png</code> поруч із назвою CourierDash. Dashboard preview вирівняно: проблемний rotation і floating transform прибрано без зміни demo-даних або структури секцій.

## Наступна задача

PHASE 2.3 — підтвердження email для нових користувачів. Production Auth settings, redirect allow-list, SMTP та email delivery спочатку потребують окремої перевірки: <code>REMOTE STATE: UNKNOWN</code>.

## Реалізована функціональність

- Landing Page V2 для delivery couriers із Hero, Dashboard preview, compact bento Features, Product showcase з tabs, How it works, Platforms, FAQ, CTA і footer.
- Animated route background, responsive mobile/desktop layout і <code>prefers-reduced-motion</code> behavior.
- Офіційний <code>app/icon.png</code> у header; назва CourierDash, language selector і Sign In збережені.
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

На 2026-07-29 у documentation branch, створеній безпосередньо від інтегрованого <code>origin/main</code>:

- <code>npm run lint</code> — пройдено;
- <code>npm run typecheck</code> — пройдено;
- <code>npm test</code> — 8 test files, 75 tests, усі пройдено;
- <code>npm run build</code> — production build пройдено після повторного запуску з мережевим доступом; перша спроба зупинилася лише через недоступність Google Fonts.

Перевіряються auth route policy, password recovery validation і URL states, browser-language resolution, Work platforms і cash tips, worked-hours logic, Annual Report calculations та локальний Supabase schema snapshot.

Landing Page V2 пройшла production-перевірку за підтвердженням власника проєкту. Landing не змінювала Supabase schema, RLS або shared Web/Mobile contracts. Реальний recovery email, recovery token і password update не перевірялися без контрольованого акаунта.

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
