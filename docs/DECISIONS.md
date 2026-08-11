# CourierDash Web — журнал рішень

## Як читати цей документ

Цей журнал містить лише погоджені product та engineering decisions. <code>Status: ACTIVE</code> означає, що правило діє зараз, навіть якщо пов’язана функція ще запланована. <code>Status: SUPERSEDED</code> зберігає історичне рішення, яке замінене новішим погодженим рішенням. <code>Date: UNKNOWN</code> використано там, де точну дату рішення неможливо підтвердити локально.

Статуси робіт визначає [CourierDash Roadmap](./COURIERDASH_ROADMAP.md), а фактичний snapshot — [CURRENT_STATE.md](./CURRENT_STATE.md).

## Активні рішення

### DEC-001 — Окремі Web і Mobile repositories

Status: ACTIVE
Date: UNKNOWN
Scope: Product architecture
Source: ця документаційна інструкція; [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md)

Decision:

CourierDash Web і CourierDash Mobile зберігаються як окремі applications та окремі repositories.

Reason:

Web repository визначає web implementation, але не mobile architecture.

Consequences:

Code і UI не копіюються автоматично; спільні backend contracts та product rules узгоджуються явно.

Revisit when:

Лише якщо буде окремо погоджено зміну меж codebases.

### DEC-002 — Roadmap є джерелом статусів

Status: ACTIVE
Date: UNKNOWN
Scope: Documentation governance
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md); ця документаційна інструкція

Decision:

<code>docs/COURIERDASH_ROADMAP.md</code> є головним джерелом завершених, поточних, запланованих, відкладених і дискусійних статусів web-roadmap.

Reason:

Єдине джерело статусів запобігає суперечностям між документами.

Consequences:

README та інші документи посилаються на roadmap і не дублюють його повністю.

Revisit when:

Коли буде погоджено інший офіційний status source.

### DEC-003 — Одна задача, одна feature branch

Status: ACTIVE
Date: UNKNOWN
Scope: Git workflow
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), розділ «Принцип роботи»; ця документаційна інструкція

Decision:

Кожна задача виконується в окремій feature або fix branch, створеній від актуального <code>main</code>.

Reason:

Це зберігає scope задачі контрольованим і reviewable.

Consequences:

Документаційні, функціональні й unrelated changes не змішуються.

Revisit when:

Коли repository офіційно переходить на інший branching model.

### DEC-004 — Main не є робочою branch

Status: ACTIVE
Date: UNKNOWN
Scope: Git safety
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), розділ «Принцип роботи»; ця документаційна інструкція

Decision:

Пряма розробка та прямий push у protected <code>main</code> заборонені.

Reason:

<code>main</code> має залишатися стабільним integration baseline.

Consequences:

Зміни потрапляють у <code>main</code> лише через погоджений review/merge flow.

Revisit when:

Коли protection і release workflow офіційно зміняться.

### DEC-005 — PR, Preview і verification є частиною delivery

Status: ACTIVE
Date: UNKNOWN
Scope: Delivery workflow
Source: ця документаційна інструкція; [WORKFLOW.md](./WORKFLOW.md)

Decision:

Після push створюється Pull Request; до merge перевіряються Vercel Preview і ручні сценарії, після merge виконується production verification.

Reason:

Автоматичні checks не підтверджують browser UX і deployment behavior.

Consequences:

Merge не вважається повним завершенням без доречної Preview та production перевірки.

Revisit when:

Коли deployment platform або release policy зміняться.

### DEC-006 — Remote schema audit перед migrations

Status: ACTIVE
Date: UNKNOWN
Scope: Supabase schema safety
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 7; ця документаційна інструкція

Decision:

Нові Supabase migrations не створюються до окремого read-only audit фактичної linked remote schema.

Reason:

Локальна migration history incomplete, а відповідність local artifacts production не підтверджена.

Consequences:

Schema task починається з remote baseline audit без SQL changes, migrations або type generation.

Revisit when:

Коли remote schema та migration history будуть підтверджені й зафіксовані.

### DEC-007 — Generated types оновлюються після schema changes

Status: ACTIVE
Date: UNKNOWN
Scope: Supabase/TypeScript contract
Source: ця документаційна інструкція; [CourierDash Supabase](../supabase/README.md)

Decision:

Після підтвердженої schema change потрібно оновити generated database types і пов’язані application models.

Reason:

Typed client має відображати фактичний database contract.

Consequences:

Schema change включає migration, constraints/RLS/grants review, type update, tests і documentation update.

Revisit when:

Коли type-generation strategy буде офіційно змінена.

### DEC-008 — Перша версія витрат використовує PLN

Status: ACTIVE
Date: UNKNOWN
Scope: Planned expenses module
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8

Decision:

Перша версія expenses використовує лише PLN, без currency selector, conversion або multi-currency.

Reason:

Це погоджена межа першої версії.

Consequences:

Інші валюти не додаються до початкової schema чи UI.

Revisit when:

Коли multi-currency буде окремо погоджено.

### DEC-009 — Загальні витрати першої версії: fuel і rental

Status: SUPERSEDED by DEC-025
Date: UNKNOWN
Scope: Planned expenses aggregation
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.1, 8.2 і 8.7

Decision:

Історично перша версія total expenses була обмежена fuel plus transport rental. Це рішення замінене підтвердженим ширшим Expenses V1 scope у DEC-025.

Reason:

Roadmap обмежує початковий expenses scope цими двома складовими.

Consequences:

Fuel планується як expense records, rental — як динамічний розрахунок із rental periods.

Revisit when:

Не переглядається окремо; актуальна категоризація визначається DEC-025.

### DEC-010 — Charging і Garage не входять до total expenses

Status: SUPERSEDED by DEC-025
Date: UNKNOWN
Scope: Product boundaries
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8 і 8.6

Decision:

Історично Charging, Garage, repair і service не включалися до загальних витрат. DEC-025 замінив цю межу: `maintenance` і `repair` входять до Expenses V1 з дозволеним manual або Garage source, але Garage records не копіюються і не рахуються двічі. Charging залишається поза V1.

Reason:

Garage залишається окремою технічною історією, а roadmap забороняє подвійне рахування.

Consequences:

Expenses має зберігати Garage як окреме source identity та враховувати відповідний Garage cost рівно один раз без створення manual duplicate.

Revisit when:

Не переглядається окремо; актуальна Garage/Expenses boundary визначається DEC-025 і прийнятим Garage Contract `0.3.0-draft`.

### DEC-011 — Rental зберігається періодами

Status: ACTIVE
Date: UNKNOWN
Scope: Planned rental model
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.2

Decision:

Оренда транспорту моделюється безперервними periods із weekly amount, <code>valid_from</code>, <code>valid_to</code> та user ownership.

Reason:

Period model зберігає історію ставок і підтримує пропорційний date-range calculation.

Consequences:

Rental не створює фізичні daily або weekly expense rows.

Revisit when:

До проєктування schema після обов’язкового remote audit.

### DEC-012 — Valid to є inclusive

Status: ACTIVE
Date: UNKNOWN
Scope: Rental date semantics
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.2

Decision:

<code>valid_from</code> входить у розрахунок, а <code>valid_to</code> є останнім оплаченим днем включно; null означає активний period.

Reason:

Inclusive semantics однозначно визначає перетин rental period із selected range.

Consequences:

Mobile і Web мають застосовувати однакові calendar-date rules.

Revisit when:

Лише разом із погодженою migration і compatibility plan.

### DEC-013 — Зміна ставки не переписує історію

Status: ACTIVE
Date: UNKNOWN
Scope: Rental history
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.4

Decision:

Звичайна зміна weekly rate завершує попередній period за день до нової ставки і створює новий period.

Reason:

Минулі reports мають зберігати історичну ставку.

Consequences:

Update не повинен in-place змінювати попередні rental periods.

Revisit when:

До реалізації transaction/RPC після schema audit.

### DEC-014 — Виправлення rental history є окремою дією

Status: ACTIVE
Date: UNKNOWN
Scope: Rental correction UX
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.5

Decision:

Історичне виправлення відокремлюється від звичайної зміни ставки й попереджає про перерахунок старих reports.

Reason:

Retroactive change має інші наслідки, ніж нова ставка.

Consequences:

Потрібні окремий action, warning і explicit confirmation; точний UI ще потребує design.

Revisit when:

Під час окремого UX design для history correction.

### DEC-015 — Формула income after expenses

Status: AMENDED by DEC-025
Date: UNKNOWN
Scope: Planned financial metric
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.10

Decision:

Income after expenses дорівнює `G - E`, де `G` включає base income, app tips, cash tips і bonuses незалежно від presentation toggles, а `E` включає всі п'ять категорій і лише дозволені sources з DEC-025.

Reason:

Це погоджена product formula, незалежна від presentation toggles.

Consequences:

Показник розраховується динамічно, може бути від’ємним і не зберігається як database total.

Revisit when:

Коли буде окремо погоджено зміну категорій, sources або calculation modes з DEC-025.

### DEC-016 — Income after expenses не є Netto

Status: ACTIVE
Date: UNKNOWN
Scope: Financial terminology
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.10 і PHASE 12

Decision:

Income after expenses не називається Netto і не включає taxes.

Reason:

Income, expenses, tax base, taxes і Netto є різними поняттями.

Consequences:

Web і Mobile мають використовувати однакову незмішану terminology.

Revisit when:

Після окремого product audit tax model.

### DEC-017 — Tax formulas не змінюються без audit

Status: ACTIVE
Date: UNKNOWN
Scope: Tax logic
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 12

Decision:

Чинні tax formulas не змінюються без окремого предметного audit реальної моделі платформ і партнерів.

Reason:

Roadmap не підтверджує їх як повністю точний legal/tax model.

Consequences:

Technical cleanup не може навмання змінювати calculations або terminology.

Revisit when:

Після погодження формул, assumptions, terminology і disclaimers.

### DEC-018 — Mobile має власну документацію

Status: ACTIVE
Date: UNKNOWN
Scope: Mobile governance
Source: ця документаційна інструкція; [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md)

Decision:

CourierDash Mobile підтримує власні README, ROADMAP, CURRENT_STATE і DECISIONS у своєму repository.

Reason:

Mobile-specific delivery, UX та architecture не визначаються web roadmap.

Consequences:

Web docs не використовуються як mobile status source.

Revisit when:

Коли ownership mobile documentation буде офіційно змінено.

### DEC-019 — Mobile Integration є лише bridge

Status: ACTIVE
Date: UNKNOWN
Scope: Cross-repository documentation
Source: ця документаційна інструкція; [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md)

Decision:

<code>docs/MOBILE_INTEGRATION.md</code> описує підтверджені contracts, reusable rules і uncertainties, але не є mobile roadmap.

Reason:

Bridge має допомогти інтеграції без нав’язування web UI чи mobile plan.

Consequences:

Mobile-specific choices залишаються у mobile repository.

Revisit when:

Коли зміняться shared backend contracts або межі applications.

### DEC-020 — Документація змінюється разом із функцією

Status: ACTIVE
Date: UNKNOWN
Scope: Documentation maintenance
Source: ця документаційна інструкція; [WORKFLOW.md](./WORKFLOW.md)

Decision:

Документація оновлюється разом із відповідною функціональною задачею, а не на основі окремих непідтверджених припущень.

Reason:

Документи мають відповідати фактичному code і погодженому roadmap.

Consequences:

Змінюються лише impacted docs; status не випереджає implementation.

Revisit when:

Коли буде запроваджено інший documentation lifecycle.

### DEC-021 — Password recovery не розкриває існування акаунта

Status: ACTIVE
Date: 2026-07-29
Scope: Authentication security and UX
Source: PHASE 2.2 implementation; [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 2.2

Decision:

Форма запиту відновлення пароля показує однакове neutral success повідомлення незалежно від того, чи існує акаунт із введеною адресою. Технічні деталі Auth errors користувачу не показуються.

Reason:

Різні відповіді для наявної та відсутньої адреси можуть дозволити account enumeration.

Consequences:

Web і майбутній Mobile flow не повинні підтверджувати існування акаунта через recovery UI. Реальні network/system failures показуються generic localized error.

Revisit when:

Лише після окремого security review Auth UX.

### DEC-022 — Recovery session має окремий lifecycle

Status: ACTIVE
Date: 2026-07-29
Scope: Password recovery session and redirects
Source: PHASE 2.2 implementation; [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 2.2

Decision:

Запит і встановлення нового пароля розділені між <code>/forgot-password</code> та <code>/reset-password</code>. Reset form відкривається лише після події <code>PASSWORD_RECOVERY</code>; звичайна auth session не є достатньою. Після успішного <code>updateUser()</code> виконується <code>signOut()</code> і redirect на <code>/login?password-reset=success</code>, а не на <code>/work</code>. Мінімальна довжина пароля лишається 6 символів відповідно до чинної local registration policy.

Reason:

Recovery token не повинен перетворювати password reset на неявний звичайний login, а правила пароля не мають розходитися між registration і recovery.

Consequences:

Recovery listener існує лише на reset route та очищується при unmount. Production Auth settings, redirect allow-list, SMTP і email delivery не виводяться з local code і мають статус <code>REMOTE STATE: UNKNOWN</code>.

Revisit when:

Після підтвердження production Auth configuration або зміни password policy.

### DEC-023 — Landing Page V1 використовує Courier Command Center

Status: SUPERSEDED
Date: 2026-07-29
Scope: Public Landing Page
Source: погоджене продуктове завдання Landing Page V1; [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 3
Superseded by: DEC-024

Decision:

Public Landing Page орієнтована лише на delivery couriers і використовує premium dark концепцію Courier Command Center. Наявний modal auth flow зберігається: основний CTA відкриває registration, Sign in — login. Мова визначається після збереженого ручного вибору за browser preferences із fallback на EN. Product mockups є демонстраційними, а motion реалізується без важких dependencies із повною reduced-motion альтернативою.

Reason:

Landing має чітко пояснювати фактично наявний продукт, показувати його можливості без непідтверджених інтеграцій і залишатися швидким, доступним та сумісним із чинною auth-архітектурою.

Consequences:

Testimonials, fleet/company positioning, platform partnership claims, автоматична API sync, exports, готовий expenses module і native mobile app не заявляються. Demo values позначаються як demo. Supabase, route policy та password recovery flow не змінюються в межах Landing Page V1.

Revisit when:

Після підтвердженого продуктового рішення про нову аудиторію, інший auth UX або заміну Landing visual direction.

### DEC-024 — Landing Page V2 є фінальним production-рішенням

Status: ACTIVE
Date: 2026-07-29
Scope: Public Landing Page
Source: підтверджене власником продуктове рішення; merge commit <code>63276c3a42243d2642b49b33cf7b8deadc4cff8e</code>; [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 3; <code>app/components/landing/</code>

Decision:

Фінальним production-рішенням є Landing Page V2 — компактний premium dark Landing із night-route visual direction. Офіційна назва в документації: <code>Landing Page V2</code>; назва <code>Courier Night Route</code> не використовується як офіційна. V1 зберігається лише як історична альтернатива й не підтримується паралельно як окремий production-напрям.

Landing Page V2 містить Hero, Dashboard preview, основні feature/bento sections, Product showcase з tabs, How it works, Platforms, FAQ, final CTA, footer, responsive behavior і локалізацію PL, UK, EN та RU. CTA повторно використовують чинні login/register flows із <code>app/page.tsx</code>.

Reason:

Після порівняння варіантів власник обрав компактну V2 як остаточний public experience. Вона зберігає фактичні можливості продукту, чинну Auth-архітектуру та контрольований lightweight motion без паралельної підтримки двох Landing-версій.

Consequences:

Документація й майбутні Landing-зміни орієнтуються лише на V2. Landing не змінює backend, Supabase schema, RLS або shared Web/Mobile contracts. Нові CTA продовжують використовувати наявні login/register callbacks; V1 не розгортається й не розвивається окремо.

Revisit when:

Після окремого підтвердженого продуктового рішення про нову аудиторію, auth UX або повну заміну Landing visual direction.

### DEC-025 — Expenses V1 categories, sources і calculation modes

Status: ACTIVE
Date: 2026-08-10
Scope: Expenses V1 shared-contract product basis
Source: підтверджене власником продуктове рішення; `docs/shared/EXPENSES_CONTRACT.md`

Decision:

Expenses V1 використовує тільки PLN і п'ять категорій: `fuel`, `rental`, `maintenance`, `repair`, `food_on_shift`.

Допустимі sources:

- `fuel` — manual;
- `rental` — rental periods;
- `maintenance` — manual або Garage;
- `repair` — manual або Garage;
- `food_on_shift` — manual.

Garage Contract `0.3.0-draft` залишається окремим прийнятим source contract. Garage rows не копіюються до manual expenses і не рахуються двічі; майбутня Expenses history зберігає Garage source identity.

Підтримуються чотири calculation modes:

- `gross = G`;
- `after_tax_and_fees = G - T`;
- `after_recorded_expenses = G - E`;
- `after_all_deductions = G - T - E`.

`G` включає base income, app tips, cash tips і bonuses та не залежить від presentation toggles. Майбутній calculation result відрізняє `available`, `partial`, `unavailable` і `not_configured`.

Це рішення supersede DEC-009 і DEC-010 та amend DEC-015.

OWNER APPROVED 2026-08-10:

1. Expenses зберігає лише manual rows. Rental periods і Garage history залишаються окремими sources та входять до read/aggregation model через стабільну пару `(source, sourceRecordId)` без копіювання і подвійного підрахунку.
2. PLN inputs є невід'ємними decimal values із максимум двома знаками після коми. Розрахунки використовують decimal arithmetic; rental intermediate values не округлюються, а фінальний результат округлюється до `0.01 PLN` за `ROUND_HALF_UP` однаково на Web і Mobile.
3. Calculation result повертає nullable value, completeness status і missing components. `partial` завжди має непорожній missing-component list і ніколи не показується як фінальний результат.
4. Чинний Work tax/fee runtime не змінюється до окремого tax audit. Режим, що залежить від `T`, не може мати status `available`, якщо `T` не визначається надійно.
5. Rental periods одного користувача не перетинаються; normal close-and-create є атомарним, historical correction — окремою контрольованою дією, а retryable creates використовують idempotency keys.

Manual expense можна створити заднім числом. Її фактична календарна дата зберігається окремо від технічного `created_at`; filters, history і financial calculations використовують фактичну дату витрати. Garage-derived expense створюється або виправляється у Garage та не дублюється manual row. Rental expense залишається прив'язаною до відповідного rental period.

Reason:

Попередній fuel-plus-rental scope більше не відповідає підтвердженій продуктовій моделі, а виключення Garage не дозволяє коректно представити maintenance і repair як source-aware витрати.

Consequences:

Roadmap і shared contract використовують п'ять категорій, source-aware aggregation, затверджені date/precision/completeness boundaries і чотири різні financial modes. Expenses implementation, schema, UI та Production rollout залишаються не розпочатими й потребують окремих approvals. Manual deletion/audit retention, concrete schema, RLS, RPC/error contracts і tax model після audit не затверджені цим рішенням.

Revisit when:

Лише після окремого підтвердження зміни категорій, sources, валюти, формул, date/rounding/completeness semantics, rental mutation boundaries або Garage boundary.

## Рішення, що потребують перегляду

Затверджених рішень із простроченим status локально не виявлено. П'ять Expenses owner gates із `docs/shared/EXPENSES_CONTRACT.md` затверджені 2026-08-10. Окремого рішення все ще потребують manual deletion/audit retention, concrete Expenses/rental schema, RLS, RPC/error contracts, tax model після audit, Annual Report 2.0, UX <code>/expenses</code> і branded email. До погодження ці implementation/design питання не є активними decisions.

## Відкладені рішення

Roadmap відкладає або не включає до поточного scope:

- comparison of periods;
- year comparison;
- multi-currency;
- leaderboard schema;
- universal recurring billing engine;
- exports до стабільного Annual Report 2.0.

Це не означає схвалення конкретної implementation.

## Як додавати нові рішення

1. Підтвердити decision у product discussion, roadmap, code або existing documentation.
2. Призначити наступний <code>DEC-XXX</code>.
3. Заповнити <code>Status</code>, <code>Date</code>, <code>Scope</code> і точний <code>Source</code>.
4. Описати Decision, Reason, Consequences і умову Revisit.
5. Не переносити сюди ideas, plans або assumptions як активні рішення.
6. Разом перевірити [Roadmap](./COURIERDASH_ROADMAP.md), [CURRENT_STATE.md](./CURRENT_STATE.md) та integration docs, якщо decision на них впливає.
