# CourierDash Web ↔ Mobile Integration

## Призначення документа

Цей документ передає команді CourierDash Mobile локально підтверджені Web contracts, business rules і uncertainties. Він допомагає інтегрувати окремий mobile codebase зі спільним backend без копіювання Web UI.

Це не mobile roadmap і не status source для Mobile. Web status визначають [CourierDash Roadmap](./COURIERDASH_ROADMAP.md) та [CURRENT_STATE.md](./CURRENT_STATE.md).

## Межі відповідальності

- CourierDash Web і CourierDash Mobile — окремі applications та repositories.
- Web repository описує фактичний Next.js code, локальні Supabase artifacts і web behavior.
- Mobile repository має визначати власні architecture, delivery status, UI/UX і platform behavior.
- Mobile не повинен копіювати Web один в один.
- Будь-яке використання спільного Supabase project потребує погодженого contract і перевірки фактичного remote state.

## Що може бути спільним

Після окремого підтвердження спільними можуть бути:

- Supabase Auth identities;
- database tables і column semantics;
- RLS ownership rules;
- product terminology;
- calculation та validation rules;
- localization keys або узгоджені тексти;
- migration і compatibility expectations.

Основна integration matrix:

| Feature | Web status | Relevant web files | Supabase dependency | Reusable product rule | Web-specific part | Mobile decision required | Known uncertainty |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication | Implemented: email/password login, signup, logout і Web password recovery | <code>app/page.tsx</code>, <code>app/login/page.tsx</code>, <code>app/forgot-password/page.tsx</code>, <code>app/reset-password/page.tsx</code>, <code>lib/supabase.ts</code> | Supabase Auth | Один user identity може володіти user-scoped data; recovery request не розкриває існування акаунта | Forms, modal, browser recovery URL і Next.js redirects | Native screens, deep links, secure token storage | Remote Auth settings, redirect allow-list і email delivery: <code>REMOTE STATE: UNKNOWN</code> |
| Session behavior | Initial <code>getSession()</code> route policy і scoped <code>PASSWORD_RECOVERY</code> listener implemented | <code>lib/auth-route-policy.ts</code>, <code>app/reset-password/page.tsx</code>, protected pages | Supabase session | Protected content не показується до завершення auth check; normal session не є recovery proof | <code>router.replace</code>, browser client, cleanup subscription | Refresh/expiry, app resume, secure persistence | Native recovery/deep-link lifecycle потребує окремого рішення |
| Profiles | Read/upsert nickname implemented | <code>app/page.tsx</code>, <code>app/work/page.tsx</code> | <code>profiles</code> | Nickname is user profile data; local snapshot має public SELECT | Nickname modal | Profile UX і privacy presentation | Remote RLS: <code>REMOTE STATE: UNKNOWN</code> |
| Work shifts | CRUD implemented | <code>app/work/page.tsx</code>, <code>lib/work-platforms.ts</code> | <code>work_shifts</code> | Platform metrics зберігаються per shift і per platform | Dashboard form, charts, local preferences | Native input UX, sync/error handling | Offline/conflict strategy: <code>UNKNOWN</code> |
| Annual Report | Current report implemented; 2.0 not implemented | <code>app/work/year/page.tsx</code>, <code>app/work/year/annual-report-calculations.ts</code> | <code>work_shifts</code> | Aggregation includes all supported platforms, tips and bonuses | Chart.js UI, hardcoded year selector | Native report design і performance | Future 2.0 design unresolved |
| Garage | Rules/history implemented | <code>app/garage/page.tsx</code> | <code>garage_rules</code>, <code>garage_history</code> | Garage is technical history, not total expenses | Browser odometer storage, web forms | Vehicle UX, local/remote odometer model | Nullable model conflict; remote schema unknown |
| Tax settings | Read/create/update and presentation implemented | <code>app/work/page.tsx</code> | <code>tax_settings</code> | Не змішувати income after expenses із Netto | Web toggle і inline formulas | Чи підтримувати до завершення tax audit | Формули не підтверджені окремим audit |
| Expenses/rentals | Planned, not implemented | <code>docs/COURIERDASH_ROADMAP.md</code>, PHASE 8 | Planned <code>expenses</code>, <code>transport_rentals</code>; не знайдені локально | First version: PLN; fuel plus rental; inclusive rental periods | Planned <code>/expenses</code> UI | Mobile UX і storage після shared schema approval | Schema, RPC і UI не існують |
| Localization | PL/UK/EN/RU implemented | <code>lib/translations.ts</code>, <code>context/LanguageContext.tsx</code> | None in current code | Узгоджені terminology/keys можуть бути reusable | React context, browser detection/localStorage | Mobile i18n framework, device locale rules | Shared key package не існує |

## Authentication

Web Supabase client використовує <code>NEXT_PUBLIC_SUPABASE_URL</code> і <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Реалізовано <code>signInWithPassword()</code>, <code>signUp()</code>, <code>signOut()</code>, <code>resetPasswordForEmail()</code> і <code>updateUser()</code>. Web reset route приймає форму лише після <code>PASSWORD_RECOVERY</code>, а після успішного update виконує sign-out. Nickname під час основної registration передається також у user metadata і записується до <code>profiles</code>, якщо session доступна.

Mobile може використовувати ті самі Auth identities лише після підтвердження production project, redirect policy та email delivery. Web password recovery є reference для neutral response і recovery-only update, але native deep links, secure recovery session lifecycle та screen navigation потрібно спроєктувати окремо. Email confirmation behavior, OAuth і branded email не можна виводити з поточного Web code як готові flows.

## Session behavior

<code>checkAuthRoute()</code> перетворює результат <code>getSession()</code> на єдину Web policy:

- public/login-specific route лишається доступним без session;
- authenticated user із <code>/</code> або <code>/login</code> переходить на <code>/work</code>;
- unauthenticated user із protected route переходить на <code>/login</code>;
- session error для protected route трактується як unauthenticated.

Це reusable behavior rule, але не ready-made mobile session architecture. Mobile має окремо вирішити secure token storage, refresh, app resume, deep links, expired recovery links і logout cleanup.

## Supabase data model

<code>lib/database.types.ts</code> і локальний <code>supabase/schema.snapshot.json</code> містять:

| Table | Використання Web code | Основна семантика |
| --- | --- | --- |
| <code>profiles</code> | <code>app/page.tsx</code>, <code>app/work/page.tsx</code> | User nickname. |
| <code>tax_settings</code> | <code>app/work/page.tsx</code> | Per-user settings для Uber/Wolt/Bolt/Glovo tax/fee presentation. |
| <code>work_shifts</code> | <code>app/work/page.tsx</code>, <code>app/work/year/page.tsx</code> | Work records і platform metrics. |
| <code>garage_rules</code> | <code>app/garage/page.tsx</code> | Maintenance intervals і last-change odometer. |
| <code>garage_history</code> | <code>app/garage/page.tsx</code> | Routine/repair history, date, odometer і cost. |

Local snapshot має RLS enabled для всіх п’яти tables. Mutation policies прив’язують user-owned rows до <code>auth.uid()</code>; <code>profiles</code> окремо має public <code>SELECT</code>. Не слід узагальнювати це як owner-only читання всіх tables.

Generated types містять nullable fields, які Mobile має обробляти без unsafe assumptions. Production відповідність має статус <code>REMOTE STATE: UNKNOWN</code>.

## Work і earnings

Один <code>work_shifts</code> record представляє одну дату користувача; local snapshot має unique constraint для <code>(user_id, date)</code>.

Ключові fields:

- identity/time: <code>id</code>, <code>user_id</code>, <code>date</code>, <code>hours</code>, <code>km</code>;
- base income: <code>uber</code>, <code>wolt</code>, <code>bolt</code>, <code>glovo</code>, <code>stuart</code>, <code>other_income</code>;
- orders: <code>orders_uber</code>, <code>orders_wolt</code>, <code>orders_bolt</code>, <code>orders_glovo</code>, <code>orders_stuart</code>, <code>orders_other</code>;
- online tips: <code>tips_uber</code>, <code>tips_wolt</code>, <code>tips_bolt</code>, <code>tips_glovo</code>, <code>tips_stuart</code>, <code>tips_other</code>;
- cash tips: <code>cash_tips_uber</code>, <code>cash_tips_wolt</code>, <code>cash_tips_bolt</code>, <code>cash_tips_glovo</code>, <code>cash_tips_stuart</code>, <code>cash_tips_other</code>;
- bonuses: <code>bonuses_uber</code>, <code>bonuses_wolt</code>, <code>bonuses_bolt</code>, <code>bonuses_glovo</code>, <code>bonuses_stuart</code>, <code>bonuses_other</code>;
- custom platform: <code>other_platform_name</code>.

<code>lib/work-platforms.ts</code> є primary business-rule reference для mapping platform keys до columns, validation named Other, cash tips non-negativity, platform totals і safe edit payloads. Cash tips не змішуються зі stored online tips, але входять до total tips. Named Other потребує trimmed non-empty name, якщо має metrics.

<code>lib/work-hours.ts</code> є reference для calculation hours із breaks та переходом через північ.

Browser <code>localStorage</code> keys для field settings і preferred platforms є Web preferences, не backend contract.

## Annual Report

Поточний Annual Report:

- читає <code>work_shifts</code> client-side;
- фільтрує records за selected year;
- агрегує 12 місяців та annual totals;
- враховує всі шість platform keys, online/cash tips і bonuses;
- дозволяє presentation toggles для tips і bonuses;
- рахує averages і personal records із safe division;
- відображає Chart.js charts;
- має hardcoded year options 2025–2027.

Pure reference — <code>app/work/year/annual-report-calculations.ts</code>. Current Annual Report не дорівнює planned Annual Report 2.0 і не містить expenses, rentals, exports чи спільної analytics foundation для всіх periods.

## Garage і vehicles

Garage працює з <code>garage_rules</code> та <code>garage_history</code>. Він підтримує maintenance intervals, routine completion, repair records, odometer і cost summaries.

Garage не є expenses module. Погоджене правило: <code>garage_history.cost</code> не входить до planned total expenses, repair/service поки виключені. <code>garage_current_odometer</code> зберігається у browser <code>localStorage</code> і не є спільним backend field.

## Expenses і rentals

У generated types, snapshot, migrations та application code не знайдено tables <code>expenses</code> або <code>transport_rentals</code>. Route <code>/expenses</code> і rental RPC також не реалізовані.

Погоджені майбутні product rules описано в PHASE 8 [roadmap](./COURIERDASH_ROADMAP.md):

- first version використовує PLN;
- total expenses дорівнює fuel plus rental;
- rental зберігається periods із weekly amount;
- <code>valid_from</code> і <code>valid_to</code> мають inclusive semantics;
- rate change не переписує history;
- income after expenses не є Netto і не включає taxes.

Ці rules не підтверджують існування schema або готової implementation.

## Localization

Web dictionaries: PL, UK, EN і RU у <code>lib/translations.ts</code>. Mobile може перевикористати terminology або погоджені keys, але React context і browser <code>localStorage</code> не переносяться як mobile solution.

Mobile repository має визначити власний i18n framework, device-locale detection, fallback, pluralization і persistence.

## Business rules

Найнадійніші локальні pure references:

- <code>lib/auth-route-policy.ts</code>;
- <code>lib/work-platforms.ts</code>;
- <code>lib/work-hours.ts</code>;
- <code>app/work/year/annual-report-calculations.ts</code>.

Product decisions щодо expenses, rentals і terminology зафіксовано в [DECISIONS.md](./DECISIONS.md). Tax formulas із <code>app/work/page.tsx</code> не слід переносити як підтверджену фінансову модель до окремого audit.

## Web-specific частини

- Next.js routes і <code>router.replace()</code>;
- React components, contexts і hooks;
- Chart.js configuration;
- Tailwind layout;
- browser <code>localStorage</code>;
- PWA manifest;
- Web forms, modal states і responsive navigation.

Ці частини не є готовою mobile architecture.

## Mobile-specific рішення

Mobile repository повинен мати власні:

- README;
- ROADMAP;
- CURRENT_STATE;
- DECISIONS;
- UI/UX decisions;
- offline strategy;
- navigation;
- secure credential/session storage;
- deep-link behavior;
- platform-specific permissions;
- release і telemetry strategy.

## Нереалізовані або невизначені можливості

| Area | Local Web audit |
| --- | --- |
| Documents | Not implemented; product requirements <code>UNKNOWN</code>. |
| Notifications | Not implemented; requirements <code>UNKNOWN</code>. |
| Realtime product integration | No <code>.channel(...)</code> calls found. |
| Offline behavior | Not implemented as a confirmed data strategy; <code>UNKNOWN</code>. |
| Product roles | No role model found; <code>UNKNOWN</code>. |
| Storage | No application Storage calls found; remote buckets <code>REMOTE STATE: UNKNOWN</code>. |
| RPC | No <code>.rpc(...)</code> calls or generated public functions found. |
| Edge Functions | No invoke calls or local functions found; deployed state <code>REMOTE STATE: UNKNOWN</code>. |

Local service enablement у <code>supabase/config.toml</code> не означає готову product integration.

## Supabase remote-state caveat

Local <code>lib/database.types.ts</code>, <code>supabase/schema.snapshot.json</code> і <code>supabase/migrations/</code> є audit artifacts, а не automatic production truth. Snapshot captured 2026-07-24; remote schema, migration history, grants, Auth configuration, redirects, SMTP, Storage buckets і deployed Functions не перевірялися.

Статус: <code>REMOTE STATE: UNKNOWN</code>.

Перед shared schema changes потрібні окремий read-only remote audit, migration strategy, RLS/grants review, generated type update і compatibility plan для обох applications.

## Правила сумісності

1. Не змінювати shared table/column semantics лише в одному client.
2. Кожна schema change має migration і review RLS, grants, types, clients, tests та docs.
3. Підтримувати nullable/legacy records, доки migration і backfill не підтверджені.
4. Не перейменовувати або повторно використовувати columns без compatibility plan.
5. Узгоджувати calendar-date, inclusive range і rounding rules.
6. Не виводити backend contracts із Web UI labels.
7. Не використовувати <code>service_role</code> у Web або Mobile client.
8. Не трактувати local snapshot як production truth.
9. Web- і Mobile-specific state зберігати окремо від shared product data.

## Коли оновлювати цей документ

Оновлювати bridge, коли змінюються shared Auth behavior, tables/columns, RLS, business calculations, localization contract або confirmed integration uncertainty. Не оновлювати його припущеннями про mobile roadmap чи UI.
