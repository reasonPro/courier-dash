# CourierDash Supabase

## Призначення каталогу

Каталог <code>supabase/</code> містить локальні config, migrations і schema snapshots для CourierDash Web. Він підтримує audit і контрольовані schema changes, але не підтверджує production state без окремої remote-перевірки.

Загальні межі проєкту: [CourierDash Web — контекст проєкту](../docs/PROJECT_CONTEXT.md). Процес розробки: [CourierDash Web — workflow](../docs/WORKFLOW.md).

## Локальні artifacts

| Artifact | Локально підтверджене призначення |
| --- | --- |
| <code>config.toml</code> | Local Supabase CLI configuration і service defaults. |
| <code>schema.snapshot.json</code> | Read-only snapshot public schema, captured 2026-07-24. |
| <code>schema.before-202607230001.json</code> | Snapshot до migration Stuart/Other. |
| <code>schema.before-202607240001.json</code> | Snapshot до migration cash tips. |
| <code>migrations/202607230001_add_stuart_and_other_platform.sql</code> | Додає Stuart, Other і related constraints до <code>work_shifts</code>. |
| <code>migrations/202607240001_add_cash_tips_per_platform.sql</code> | Додає per-platform cash tips і nonnegative/name constraints. |
| [<code>lib/database.types.ts</code>](../lib/database.types.ts) | Local generated TypeScript database types. |

## Джерела правди

Джерела мають різні ролі:

1. Фактична linked remote schema — production truth лише після окремого read-only audit.
2. SQL migrations — intended versioned changes, але локальна history може бути incomplete.
3. <code>schema.snapshot.json</code> — local audit snapshot, не automatic production truth.
4. <code>lib/database.types.ts</code> — local generated client contract, не доказ current production state.
5. Application code і tests — фактичне локальне використання contract.

Статуси product phases визначає [CourierDash Roadmap](../docs/COURIERDASH_ROADMAP.md).

## Generated database types

[<code>lib/database.types.ts</code>](../lib/database.types.ts) містить локальні generated TypeScript types і використовується в <code>lib/supabase.ts</code> як generic <code>Database</code>. <code>app/work/work-page.types.ts</code> виводить <code>Shift</code> через helper <code>Tables&lt;"work_shifts"&gt;</code>.

Configured script:

~~~bash
npm run supabase:types
~~~

Він генерує types із linked schema. Не запускати його як частину звичайного docs audit або до підтвердженої schema task. Generated file може бути <code>POSSIBLY STALE</code>, доки remote state не перевірено.

## Migrations

<code>supabase/migrations/</code> містить лише дві additive migrations:

- Stuart/Other fields і constraints;
- per-platform cash tips і constraints.

Вони не створюють п’ять базових application tables, які вже присутні в snapshot і types. Отже, локальна migration history не є повним bootstrap і має status incomplete.

Migration file описує intended change, але не доводить, що change застосовано до production.

## Schema audit

Local <code>schema.snapshot.json</code> містить:

- tables, columns і nullability;
- primary/foreign keys;
- constraints та indexes;
- RLS flags і policies;
- functions і triggers.

У snapshot знайдено tables <code>garage_history</code>, <code>garage_rules</code>, <code>profiles</code>, <code>tax_settings</code> і <code>work_shifts</code>. Public functions і triggers відсутні. Це лише local captured state.

Перед новою migration потрібен окремий read-only audit linked remote schema, включно з tables, columns, constraints, indexes, foreign keys, RLS, policies, grants, functions, triggers і remote migration history. Audit не застосовує SQL і не змінює data.

## RLS

Local snapshot позначає RLS enabled для всіх п’яти public application tables.

Підтверджені локальні policy semantics:

- <code>garage_history</code> і <code>garage_rules</code>: <code>ALL</code> із <code>auth.uid() = user_id</code>;
- <code>work_shifts</code>: <code>ALL</code> для authenticated role із owner check;
- <code>tax_settings</code>: owner-scoped <code>SELECT</code>, <code>INSERT</code> і <code>UPDATE</code>;
- <code>profiles</code>: owner-scoped <code>INSERT</code>/<code>UPDATE</code>, але <code>SELECT</code> має condition <code>true</code>.

Тому не можна стверджувати, що читання всіх tables є owner-only. Фактичні production policies і grants: <code>REMOTE STATE: UNKNOWN</code>.

## Auth

Application client використовує:

- <code>getSession()</code>;
- <code>signInWithPassword()</code>;
- <code>signUp()</code>;
- <code>signOut()</code>.

Client створюється з <code>NEXT_PUBLIC_SUPABASE_URL</code> і <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Значення environment variables не документуються.

Password recovery, OAuth, <code>onAuthStateChange</code> і server-side session flow у local application code не знайдені. Local <code>config.toml</code> містить development Auth defaults, але production Auth settings, confirmation policy, redirect URLs, SMTP і email delivery мають status <code>REMOTE STATE: UNKNOWN</code>.

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

Без окремої remote-перевірки:

- schema: <code>REMOTE STATE: UNKNOWN</code>;
- remote migration history: <code>REMOTE STATE: UNKNOWN</code>;
- RLS, policies і grants: <code>REMOTE STATE: UNKNOWN</code>;
- Auth settings, redirects і SMTP: <code>REMOTE STATE: UNKNOWN</code>;
- Storage buckets і policies: <code>REMOTE STATE: UNKNOWN</code>;
- Realtime configuration: <code>REMOTE STATE: UNKNOWN</code>;
- deployed Edge Functions: <code>REMOTE STATE: UNKNOWN</code>.

Локальні artifacts слід трактувати як audit baseline із можливим status <code>POSSIBLY STALE</code>, доки linked remote state не підтверджено.
