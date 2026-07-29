# CourierDash Web — контекст проєкту

## Призначення продукту

CourierDash Web — web-застосунок для кур’єрів, який допомагає записувати робочі зміни, доходи й операційні показники, переглядати місячну та річну статистику і вести технічну історію транспорту.

Цей документ описує лише фактично наявний web-проєкт. Статуси завершених і майбутніх фаз визначає [CourierDash Roadmap](./COURIERDASH_ROADMAP.md).

## Межі цього repository

У repository розміщено Next.js codebase CourierDash Web, локальні Supabase artifacts і автоматичні тести. CourierDash Mobile є окремим застосунком та окремим repository. Web і Mobile можуть використовувати один погоджений Supabase backend, але не мають спільного UI codebase.

Межі інтеграції з Mobile описує [CourierDash Web ↔ Mobile Integration](./MOBILE_INTEGRATION.md). Цей документ є integration bridge, а не mobile roadmap.

## Технологічний stack

Stack підтверджено файлом <code>package.json</code>:

- Next.js 16.2.9 з App Router;
- React і React DOM 19.2.4;
- TypeScript 5;
- Tailwind CSS 4;
- <code>@supabase/supabase-js</code> 2.108.x;
- Chart.js 4.5.x і <code>react-chartjs-2</code> 5.3.x;
- Vitest 4.1.x;
- ESLint 9 з <code>eslint-config-next</code> 16.2.9.

## Загальна архітектура

- <code>app/</code> містить routes і UI на основі Next.js App Router.
- <code>app/layout.tsx</code> підключає глобальні стилі, metadata і <code>LanguageProvider</code>.
- Фактичні сторінки застосунку є client components; session checks і значна частина data fetching виконуються у браузері.
- <code>lib/supabase.ts</code> створює один typed Supabase client.
- <code>lib/</code> містить translations і pure helpers для auth policy, робочого часу та platform-aware даних.
- <code>app/work/components/</code> містить UI-компоненти Work dashboard.
- <code>tests/</code> перевіряє pure business helpers, auth route policy та локальний schema snapshot.

У repository не знайдено власних Next.js Route Handlers, Server Actions або middleware. Це твердження стосується лише поточного локального codebase.

## Основні routes

| Route | Тип доступу | Фактична роль |
| --- | --- | --- |
| <code>/</code> | public | Landing Page з login/register modal; авторизований користувач перенаправляється на <code>/work</code>. |
| <code>/login</code> | login-specific | Окрема форма входу/реєстрації; авторизований користувач перенаправляється на <code>/work</code>. |
| <code>/work</code> | protected | Основний dashboard робочих змін, статистики, профілю й tax settings. |
| <code>/work/year</code> | protected | Поточний Annual Report. |
| <code>/garage</code> | protected | Правила обслуговування та історія Garage. |

Політику redirects централізовано в <code>lib/auth-route-policy.ts</code>. Заплановані routes, зокрема <code>/expenses</code>, не є реалізованими.

## Основні продуктові модулі

### Landing/Auth

<code>app/page.tsx</code> містить public landing, головний login/registration modal із nickname та основну точку входу у password recovery. <code>app/login/page.tsx</code> містить альтернативну login/register сторінку з такою самою recovery entry. Обидва посилання ведуть на <code>/forgot-password</code>.

### Work

<code>app/work/page.tsx</code> і <code>app/work/components/</code> реалізують create, read, update і delete для робочих змін, вибір платформ, online tips, cash tips, bonuses, orders, hours і distance. Підтримуються Uber, Wolt, Bolt, Glovo, Stuart і named Other.

### Annual Report

<code>app/work/year/page.tsx</code> агрегує <code>work_shifts</code> за вибраний рік, показує місячні та річні totals, averages, personal records і charts. Поточна реалізація не є запланованим Annual Report 2.0.

### Garage

<code>app/garage/page.tsx</code> керує правилами технічного обслуговування та історією routine/repair records. Garage не є загальним expenses module.

## Supabase у проєкті

<code>lib/supabase.ts</code> викликає <code>createClient&lt;Database&gt;</code> з environment variables <code>NEXT_PUBLIC_SUPABASE_URL</code> і <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Тип <code>Database</code> імпортується з <code>lib/database.types.ts</code>.

Application code використовує Data API для tables <code>profiles</code>, <code>tax_settings</code>, <code>work_shifts</code>, <code>garage_rules</code> і <code>garage_history</code>. Локальні виклики <code>.rpc(...)</code>, Storage, Realtime channels і Edge Functions не знайдені.

Локальні types, migrations і schema snapshot не гарантують відповідність production. Деталі наведено в [CourierDash Supabase](../supabase/README.md).

## Auth і session model

Наявний browser flow використовує:

- <code>supabase.auth.getSession()</code> для початкової перевірки;
- <code>signInWithPassword()</code> для входу;
- <code>signUp()</code> для реєстрації;
- <code>signOut()</code> для виходу;
- <code>resetPasswordForEmail()</code> для neutral recovery request;
- <code>onAuthStateChange()</code> для підтвердження події <code>PASSWORD_RECOVERY</code>;
- <code>updateUser()</code> для встановлення нового пароля у recovery session;
- <code>checkAuthRoute()</code> для узгодженого redirect policy.

Password recovery реалізовано в routes <code>/forgot-password</code> і <code>/reset-password</code>. Підписка <code>onAuthStateChange</code> обмежена reset route і очищується при unmount. Звичайна session не вважається recovery proof; після успішної зміни пароля виконується sign-out і перехід на <code>/login?password-reset=success</code>. OAuth і server-side session enforcement у локальному codebase не знайдені. Remote Auth settings, redirect allow-list, SMTP та email delivery мають статус <code>REMOTE STATE: UNKNOWN</code>.

## Localization

<code>lib/translations.ts</code> містить PL, UK, EN і RU dictionaries. <code>context/LanguageContext.tsx</code> визначає browser language, використовує польську як fallback і зберігає вибір у browser <code>localStorage</code> за ключем <code>courier_dash_lang</code>.

## Business logic

Основні підтверджені references:

- <code>lib/work-platforms.ts</code> — platform columns, validation, preferences, payload building і platform totals;
- <code>lib/work-hours.ts</code> — тривалість зміни з перервами, включно з переходом через північ;
- <code>app/work/year/annual-report-calculations.ts</code> — pure annual aggregation і safe averages;
- <code>app/work/page.tsx</code> — поточні місячні показники та tax/fee presentation logic;
- <code>app/garage/page.tsx</code> — Garage calculations.

Спільної analytics foundation для всіх періодів ще немає: dashboard і Annual Report мають окремі aggregation paths. Чинні tax formulas не вважаються підтвердженою податковою моделлю і не повинні змінюватися без окремого аудиту.

## Джерела правди

- [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md) — головне джерело статусів і погодженого плану.
- [CURRENT_STATE.md](./CURRENT_STATE.md) — короткий локально підтверджений snapshot.
- [DECISIONS.md](./DECISIONS.md) — реєстр затверджених рішень.
- [WORKFLOW.md](./WORKFLOW.md) — безпечний workflow розробки.
- <code>app/</code>, <code>lib/</code>, <code>context/</code> і <code>tests/</code> — фактична локальна реалізація.
- <code>lib/database.types.ts</code>, <code>supabase/schema.snapshot.json</code> і <code>supabase/migrations/</code> — локальні Supabase artifacts із caveat щодо remote state.

## Відомі обмеження

- Email confirmation для нових користувачів є наступною, а не завершеною функцією.
- Expenses, transport rentals, documents, notifications, exports і leaderboard schema не реалізовані.
- Annual Report 2.0 ще потребує окремого product/design етапу.
- Поточна tax/Netto presentation logic не пройшла окремий предметний audit.
- Значна частина data access і route protection працює client-side.
- Production deployment і remote Supabase state у межах цього аудиту не перевірялися.

## Що не входить до цього repository

- codebase CourierDash Mobile;
- mobile navigation, offline strategy, secure token storage і platform permissions;
- production Supabase configuration як підтверджений факт;
- Vercel production configuration як локально підтверджений факт;
- заплановані product modules до їх фактичної реалізації.
