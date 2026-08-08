# CourierDash Supabase

## Призначення каталогу

Каталог <code>supabase/</code> містить локальні config, migrations і schema snapshots для CourierDash Web. Він підтримує audit і контрольовані schema changes, але не підтверджує production state без окремої remote-перевірки.

Загальні межі проєкту: [CourierDash Web — контекст проєкту](../docs/PROJECT_CONTEXT.md). Процес розробки: [CourierDash Web — workflow](../docs/WORKFLOW.md).

## Локальні artifacts

| Artifact | Локально підтверджене призначення |
| --- | --- |
| <code>config.toml</code> | Local Supabase CLI configuration і service defaults. |
| <code>schema.snapshot.json</code> | Sanitized read-only Staging schema snapshot, captured 2026-08-08 at migration <code>202608020002</code>. |
| <code>schema.before-202607230001.json</code> | Snapshot до migration Stuart/Other. |
| <code>schema.before-202607240001.json</code> | Snapshot до migration cash tips. |
| <code>migrations/202607220000_baseline_production_schema.sql</code> | Reviewed historical five-table baseline. |
| <code>migrations/202607230001_add_stuart_and_other_platform.sql</code> | Додає Stuart, Other і related constraints до <code>work_shifts</code>. |
| <code>migrations/202607240001_add_cash_tips_per_platform.sql</code> | Додає per-platform cash tips і nonnegative/name constraints. |
| <code>migrations/202608020001_harden_public_api_privileges.sql</code> | Звужує application-role table/sequence ACL і migration-owner default privileges. |
| <code>migrations/202608020002_reconcile_ownership_profiles_rls.sql</code> | Узгоджує required Work ownership, Profile lifecycle і RLS boundaries. |
| [<code>lib/database.types.ts</code>](../lib/database.types.ts) | Local generated TypeScript database types. |

## Джерела правди

Джерела мають різні ролі:

1. Фактична named environment schema — environment truth лише після окремої перевірки target identity.
2. SQL migrations — canonical intended versioned changes; Web є єдиним migration owner.
3. <code>schema.snapshot.json</code> — verified Staging audit snapshot, не automatic Production truth.
4. <code>lib/database.types.ts</code> — generated Staging client contract, не доказ current Production state.
5. Application code і tests — фактичне локальне використання contract.

Статуси product phases визначає [CourierDash Roadmap](../docs/COURIERDASH_ROADMAP.md).

## Generated database types

[<code>lib/database.types.ts</code>](../lib/database.types.ts) містить локальні generated TypeScript types і використовується в <code>lib/supabase.ts</code> як generic <code>Database</code>. <code>app/work/work-page.types.ts</code> виводить <code>Shift</code> через helper <code>Tables&lt;"work_shifts"&gt;</code>.

Configured script:

~~~bash
npm run supabase:types
~~~

Він генерує types із явно перевіреної schema. Для revision <code>202608020002</code> types згенеровано один раз через explicit Staging project ID. Не запускати його як частину звичайного docs audit або з невідомого target.

## Migrations

<code>supabase/migrations/</code> містить reviewed baseline, дві незмінені additive migrations і дві forward reconciliation migrations. Local і Staging history узгоджені через <code>202608020002</code>.

Clean executable bootstrap ще має пройти в isolated Docker-compatible PostgreSQL/CI runtime до Production rollout. Staging не скидався і не використовувався як bootstrap target.

Migration file описує intended change, але не доводить, що change застосовано до production.

## Schema audit

Local <code>schema.snapshot.json</code> містить:

- tables, columns і nullability;
- primary/foreign keys;
- constraints та indexes;
- RLS flags і policies;
- functions і triggers.

Snapshot підтверджує tables <code>garage_history</code>, <code>garage_rules</code>, <code>profiles</code>, <code>tax_settings</code> і <code>work_shifts</code>, 67 columns, один non-callable trigger helper і Auth-user Profile trigger. Project refs, credentials і user data не зберігаються.

Перед новою migration потрібен окремий read-only audit linked remote schema, включно з tables, columns, constraints, indexes, foreign keys, RLS, policies, grants, functions, triggers і remote migration history. Audit не застосовує SQL і не змінює data.

## RLS

Local snapshot позначає RLS enabled для всіх п’яти public application tables.

Підтверджені локальні policy semantics:

- <code>garage_rules</code>: authenticated owner-scoped CRUD;
- <code>garage_history</code>: authenticated owner-scoped <code>SELECT</code>/<code>INSERT</code> only;
- <code>work_shifts</code>: <code>ALL</code> для authenticated role із owner check;
- <code>tax_settings</code>: owner-scoped <code>SELECT</code>, <code>INSERT</code> і <code>UPDATE</code>;
- <code>profiles</code>: owner-scoped <code>INSERT</code>/<code>UPDATE</code>; shared row visibility для nickname discovery, але anon SQL privilege дозволяє читати лише <code>nickname</code>.

Rollback-only two-account Staging tests підтвердили own access, cross-user denial, anonymous denial і дозволений nickname-only read. Production policies і grants не змінювалися в цій задачі.

## Auth

Application client використовує:

- <code>getSession()</code>;
- <code>signInWithPassword()</code>;
- <code>signUp()</code>;
- <code>signOut()</code>.
- <code>resetPasswordForEmail()</code>;
- <code>onAuthStateChange()</code> для <code>PASSWORD_RECOVERY</code> у reset route;
- <code>updateUser()</code> для нового пароля.

Client створюється з <code>NEXT_PUBLIC_SUPABASE_URL</code> і <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Значення environment variables не документуються.

Password recovery реалізовано локально через <code>/forgot-password</code> і <code>/reset-password</code>. Recovery request має neutral response, reset form потребує події <code>PASSWORD_RECOVERY</code>, а після <code>updateUser()</code> виконується <code>signOut()</code>. OAuth і server-side session flow у local application code не знайдені. Local <code>config.toml</code> містить development Auth defaults і minimum password length 6, але production Auth settings, confirmation policy, redirect allow-list, SMTP і email delivery мають status <code>REMOTE STATE: UNKNOWN</code>.

Параметр <code>redirectTo</code> формується як <code>${window.location.origin}/reset-password</code> без hardcoded production domain. Власник має вручну перевірити Auth Site URL, Redirect URLs для localhost, production і Vercel Preview, доставку recovery email, template link та expiration behavior. Remote Dashboard у цій задачі не перевірявся і не змінювався; branded email належить до окремої задачі.

## RPC

У <code>lib/database.types.ts</code> generated public functions відсутні. У application code не знайдено викликів <code>.rpc(...)</code>.

Remote RPC state: <code>REMOTE STATE: UNKNOWN</code>.

## Storage

Application Storage calls і локальні configured buckets не знайдені. <code>config.toml</code> має local Storage service settings, що не означає product integration.

Remote Storage buckets і policies: <code>REMOTE STATE: UNKNOWN</code>.

## Realtime

У application code не знайдено <code>.channel(...)</code> або інших Realtime subscriptions. Local Realtime service enabled у <code>config.toml</code>, але це не підтверджує використання продуктом.

Remote Realtime configuration: <code>REMOTE STATE: UNKNOWN</code>.

## Edge Functions

У repository не знайдено local Edge Function source directory або application calls <code>functions.invoke(...)</code>. Local Edge Runtime enabled у <code>config.toml</code> не підтверджує deployed Functions.

Deployed Edge Functions: <code>REMOTE STATE: UNKNOWN</code>.

## Безпечний workflow schema changes

Нормативний ownership і повний Web–Mobile rollout route визначає [Schema Policy](../docs/shared/SCHEMA_POLICY.md). Цей Web repository є єдиним авторитетним джерелом Supabase migrations; Mobile не створює і не застосовує їх. Власник проєкту окремо дозволяє створення migration і окремо — її застосування.

Окремий read-only audit і Staging reconciliation завершені для revision <code>202608020002</code>. Кожна наступна remote change знову потребує однозначного Staging target, compatibility review та окремого дозволу; Production rollout для цього пакета ще не дозволений.

Перед зміною:

1. Отримати окреме підтвердження на read-only remote schema audit.
2. Порівняти remote schema, migration history, local snapshot і generated types.
3. Підготувати migration strategy та backward-compatibility plan.
4. Пояснити migration і всі affected objects.

Для кожної підтвердженої schema change:

1. створити окрему SQL migration;
2. перевірити constraints;
3. перевірити RLS;
4. перевірити grants;
5. оновити generated types;
6. оновити application models;
7. оновити tests;
8. оновити affected documentation.

Migration або інші remote changes не застосовуються без окремого явного підтвердження користувача.

## Заборонені практики

- Використовувати <code>service_role</code> у client code.
- Додавати secrets або environment values до repository чи документації.
- Вважати local snapshot, generated types або migrations гарантованим production state.
- Створювати нову migration до required remote audit.
- Редагувати schema вручну без versioned migration.
- Застосовувати remote SQL, migration, reset або repair без окремого дозволу.
- Генерувати types із невідомого remote baseline.
- Вважати enabled local service готовою product integration.

## Remote state

- Staging schema і migration history: <code>VERIFIED THROUGH 202608020002</code>;
- Staging RLS, policies, grants і profile trigger: <code>VERIFIED</code>;
- Staging Auth provider/confirmation settings: <code>VERIFIED BY REMOTE AUDIT</code>;
- Production schema/RLS/history: <code>UNCHANGED; NOT RECONCILED BY THIS TASK</code>;
- Redirects і SMTP: <code>OUTSIDE THIS SCHEMA RECONCILIATION</code>;
- Storage buckets і policies: <code>REMOTE STATE: UNKNOWN</code>;
- Realtime configuration: <code>REMOTE STATE: UNKNOWN</code>;
- deployed Edge Functions: <code>REMOTE STATE: UNKNOWN</code>.

Локальні artifacts відповідають verified Staging revision <code>202608020002</code>; вони не є доказом Production parity.
