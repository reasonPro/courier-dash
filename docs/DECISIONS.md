# CourierDash Web — журнал рішень

## Як читати цей документ

Цей журнал містить лише погоджені product та engineering decisions. <code>Status: ACTIVE</code> означає, що правило діє зараз, навіть якщо пов’язана функція ще запланована. <code>Date: UNKNOWN</code> використано там, де точну дату рішення неможливо підтвердити локально.

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

Status: ACTIVE
Date: UNKNOWN
Scope: Planned expenses aggregation
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.1, 8.2 і 8.7

Decision:

У першій версії total expenses дорівнюють fuel plus transport rental.

Reason:

Roadmap обмежує початковий expenses scope цими двома складовими.

Consequences:

Fuel планується як expense records, rental — як динамічний розрахунок із rental periods.

Revisit when:

Коли буде погоджено додаткові expense categories.

### DEC-010 — Charging і Garage не входять до total expenses

Status: ACTIVE
Date: UNKNOWN
Scope: Product boundaries
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8 і 8.6

Decision:

Charging, Garage, repair і service поки не включаються до загальних витрат.

Reason:

Garage залишається окремою технічною історією, а roadmap забороняє подвійне рахування.

Consequences:

<code>garage_history.cost</code> не додається до planned expense totals.

Revisit when:

Коли ці categories буде окремо погоджено для expenses module.

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

Status: ACTIVE
Date: UNKNOWN
Scope: Planned financial metric
Source: [COURIERDASH_ROADMAP.md](./COURIERDASH_ROADMAP.md), PHASE 8.10

Decision:

Income after expenses дорівнює всьому recorded income, включно з base income, online tips, cash tips і bonuses, мінус fuel і rental.

Reason:

Це погоджена product formula, незалежна від presentation toggles.

Consequences:

Показник розраховується динамічно, може бути від’ємним і не зберігається як database total.

Revisit when:

Коли склад total expenses буде офіційно розширено.

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

## Рішення, що потребують перегляду

Затверджених рішень із простроченим status локально не виявлено. Окремого product/design рішення ще потребують, зокрема, Annual Report 2.0, UX <code>/expenses</code>, rental history correction, branded email і tax model. До погодження вони не є активними decisions.

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
