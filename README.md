# CourierDash

## Що це за проєкт

CourierDash — web-застосунок для кур’єрів: облік робочих змін і доходів, статистика та технічна історія транспорту. Цей repository містить лише CourierDash Web.

CourierDash Mobile є окремим проєктом та окремим repository. Узгоджені точки інтеграції описано в [CourierDash Web ↔ Mobile Integration](docs/MOBILE_INTEGRATION.md).

## Поточний статус

Public Landing Page V1 у концепції Courier Command Center реалізована у feature-гілці та очікує review. Наступна продуктова задача за [roadmap](docs/COURIERDASH_ROADMAP.md) — PHASE 2.3, підтвердження email для нових користувачів.

Поточний локально підтверджений snapshot наведено в [CURRENT_STATE.md](docs/CURRENT_STATE.md).

## Основні можливості

- Адаптивна public Landing Page для delivery couriers із локалізацією PL, UK, EN і RU, demo dashboard, product sections, FAQ та reduced-motion support.
- Login, registration і password recovery flows.
- Protected Work dashboard із create, edit і delete для робочих змін.
- Uber, Wolt, Bolt, Glovo, Stuart і named Other.
- Income, orders, hours, distance, online tips, cash tips і bonuses.
- Calculator тривалості зміни з breaks.
- Місячні totals, averages, charts і personal records.
- Поточний Annual Report із річними/місячними totals, charts і records.
- Garage rules та routine/repair history.
- Localization PL, UK, EN і RU.

Tax/fee presentation існує, але не повинна трактуватися як гарантовано точна податкова модель або «точний Netto». Expenses, rentals, exports, Annual Report 2.0 і leaderboard залишаються roadmap work, а не готовими можливостями.

## Технології

- Next.js 16.2.9 і React 19.2.4;
- TypeScript 5;
- Tailwind CSS 4;
- Supabase JS 2.108.x;
- Chart.js 4.5.x і <code>react-chartjs-2</code> 5.3.x;
- Vitest 4.1.x та ESLint 9.

Актуальні версії й constraints визначає <code>package.json</code>.

## Локальний запуск

Потрібні Node.js, npm, встановлені dependencies і локальний environment із такими назвами variables:

- <code>NEXT_PUBLIC_SUPABASE_URL</code>;
- <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.

Значення environment variables не документуються й не додаються до Git.

Запуск development server:

~~~bash
npm run dev
~~~

Production-mode запуск після окремо виконаного build:

~~~bash
npm run build
npm run start
~~~

## Перевірки

Доступні scripts із <code>package.json</code>:

~~~bash
npm run lint
npm run typecheck
npm test
npm run build:check
npm run verify
~~~

<code>npm run verify</code> послідовно запускає lint, typecheck, tests і build check.

## Структура repository

~~~text
app/                 Next.js routes і UI
context/             React context для localization
lib/                 Supabase client, generated types, translations і helpers
public/              PWA/static assets
tests/               Vitest tests
docs/                Product і engineering documentation
supabase/            Local Supabase config, migrations і schema snapshots
~~~

## Документація

- [Контекст проєкту](docs/PROJECT_CONTEXT.md)
- [Поточний стан](docs/CURRENT_STATE.md)
- [Roadmap](docs/COURIERDASH_ROADMAP.md)
- [Журнал рішень](docs/DECISIONS.md)
- [Workflow розробки](docs/WORKFLOW.md)
- [Web ↔ Mobile Integration](docs/MOBILE_INTEGRATION.md)

## Supabase

Application code використовує typed browser client із <code>lib/supabase.ts</code>. Локальні generated types, schema snapshot і migration history не є автоматично production truth.

Безпечний workflow і caveats описано в [CourierDash Supabase](supabase/README.md).

## Web і Mobile

Web і Mobile — окремі codebases. Спільними можуть бути погоджені Auth flows, data model, column semantics, RLS rules, product calculations і terminology. Next.js routes, web UI та browser <code>localStorage</code> не є готовою mobile architecture.

## Важливі обмеження

- [Roadmap](docs/COURIERDASH_ROADMAP.md) є головним джерелом статусів.
- Remote Supabase і production state без окремої перевірки мають статус <code>REMOTE STATE: UNKNOWN</code>.
- Не починати migrations без read-only remote schema audit.
- Не змінювати tax formulas без окремого предметного audit.
- Не додавати secrets або environment values до code, docs чи commits.
- Не називати planned або design-stage можливості реалізованими.
