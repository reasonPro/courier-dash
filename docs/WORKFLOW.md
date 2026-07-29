# CourierDash Web — workflow розробки

## Основний принцип

Одна задача — одна branch — один контрольований scope. Repository змінюється лише в межах погодженого завдання. <code>main</code> залишається стабільним, а [roadmap](./COURIERDASH_ROADMAP.md) не переписується довільно.

## Перед початком задачі

1. Коротко дослідити лише пов’язані місця.
2. Узгодити план і дозволений scope.
3. Переконатися, що working tree clean:

~~~bash
git status --short
~~~

4. Оновити remote refs і актуальний <code>main</code>:

~~~bash
git fetch origin
git switch main
git pull --ff-only
git status --short
git rev-parse HEAD
~~~

Якщо working tree не clean, fast-forward неможливий або очікуваний baseline відсутній, потрібно зупинитися й розібратися без reset чи перезапису чужих змін.

## Створення feature branch

Branch створюється від актуального <code>main</code>.

Приклади:

~~~bash
git switch -c feat/password-recovery
git switch -c fix/annual-report-calculation
git switch -c docs/project-documentation-foundation
~~~

Якщо branch уже існує, не перезаписувати її та не виконувати reset без окремого рішення.

## Реалізація

- Змінювати лише files і behavior у погодженому scope.
- Не змішувати documentation, feature, fix і unrelated cleanup.
- Зберігати backward compatibility для data, routes і browser storage, якщо інше явно не погоджено.
- Не змінювати фінансові, tax або product formulas у межах технічного cleanup.
- Не називати planned behavior реалізованим до завершення code, tests і verification.
- Виконувати schema changes лише через окрему migration.

## Локальні перевірки

Доречні scripts визначає <code>package.json</code>:

~~~bash
npm run lint
npm run typecheck
npm test
npm run build:check
~~~

Повна configured перевірка:

~~~bash
npm run verify
~~~

Не встановлювати dependencies і не запускати production build, dev server або deployment без потреби задачі. Для docs-only changes build не є обов’язковим.

## Commit

Перед commit:

~~~bash
git diff --check
git status --short
git diff --name-status
git diff
~~~

Commit має описувати один scope. Приклади:

~~~text
feat(auth): add password recovery flow
fix(year): handle missing platform metrics
docs: add project documentation foundation
~~~

Не додавати secrets, environment values, generated noise чи unrelated files.

## Push і Pull Request

Push виконується у feature branch:

~~~bash
git push -u origin feat/password-recovery
~~~

Force push не використовується без окремого явного рішення. Прямий push у protected <code>main</code> заборонений.

Після push створюється Pull Request:

- Base: <code>main</code>;
- Compare: feature branch;
- приклад title: <code>feat(auth): add password recovery flow</code>;
- description: scope, user-visible behavior, verification results, known caveats.

## Vercel Preview

Перед merge перевірити:

- Preview deployment завершився успішно;
- змінені routes відкриваються без runtime errors;
- expected Auth/session behavior працює;
- responsive layout перевірено на relevant widths;
- PL, UK, EN і RU перевірено, якщо зміна зачіпає текст або layout;
- browser console і network requests не мають нових unexpected errors.

Preview environment і data не слід вважати production без підтвердження.

## Ручна перевірка

Checklist формується за acceptance criteria задачі. Перевіряються happy path, empty/error states, protected access, backward compatibility і відсутність регресій у суміжних flows.

Ручна перевірка не замінює automated tests, а automated tests не замінюють browser verification.

## Merge у main

- Переконатися, що PR scope чистий і checks пройдені.
- Переглянути final diff та unresolved comments.
- Виконати погоджений merge через Pull Request.
- Не виконувати ручний direct merge/push у protected <code>main</code>.
- Status roadmap змінювати лише відповідно до фактично завершеної задачі.

## Production verification

Після deployment:

- відкрити affected production routes;
- перевірити основний user flow;
- перевірити Auth redirect behavior, якщо relevant;
- перевірити data read/write лише в межах безпечного сценарію;
- перевірити browser console;
- підтвердити localization і responsive behavior, якщо relevant;
- зафіксувати результат і всі uncertainties.

Production verification не надає дозволу на незапитані data або schema changes.

## Видалення merged branch

Merged branch можна видалити лише після:

1. підтвердженого merge;
2. успішного production deployment;
3. production verification;
4. відсутності потреби в додатковому fix у тій самій branch.

Не використовувати destructive reset або branch overwrite як спосіб cleanup.

## Оновлення документації

- Оновлювати лише documents, на які фактично вплинула задача.
- [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md) залишається status source.
- [CURRENT_STATE.md](./CURRENT_STATE.md) є коротким snapshot, а не копією roadmap.
- Нові затверджені decisions додавати до [DECISIONS.md](./DECISIONS.md).
- Shared Web/Mobile contract changes відображати в [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md).
- Не документувати assumptions як готовий behavior.

## Робота з Supabase

Перед новою migration потрібен окремий read-only audit фактичної linked remote schema.

Кожна schema change повинна включати:

1. окрему SQL migration;
2. перевірку constraints;
3. перевірку RLS;
4. перевірку grants;
5. update generated types;
6. update application models;
7. update tests;
8. update impacted documentation.

Migration не застосовується до remote database без окремого явного підтвердження. Деталі: [CourierDash Supabase](../supabase/README.md).

## Read-only аудит

Read-only audit може читати code, local artifacts і явно дозволені remote metadata, але не має права:

- редагувати repository;
- запускати SQL або migrations;
- генерувати types;
- змінювати remote state;
- трактувати local snapshot як production truth.

Результат має чітко відділяти confirmed local facts, <code>UNKNOWN</code>, <code>POSSIBLY STALE</code>, <code>CONFLICT</code> і <code>REMOTE STATE: UNKNOWN</code>.

## Заборонені дії

- Незапитані або unrelated changes.
- Прямий push у <code>main</code>.
- Force push без окремого явного рішення.
- Destructive reset для чужих або невідомих changes.
- Secrets, service-role keys або environment values у commits/docs.
- <code>service_role</code> у client code.
- Remote migrations, SQL, deploy або schema repair без окремого дозволу.
- Довільна зміна roadmap status.
- Твердження про production, яких не підтверджено.

## Формат звіту після задачі

Короткий звіт має містити:

- Git baseline і branch;
- змінені files;
- фактично реалізований scope;
- навмисно незмінені files/areas;
- lint, typecheck, tests і build status;
- commit hash і push status;
- Pull Request status;
- Preview/production verification status;
- всі <code>UNKNOWN</code>, <code>POSSIBLY STALE</code> або <code>CONFLICT</code>.
