# CourierDash Roadmap

Це актуальний погоджений план розвитку CourierDash. Він є головним джерелом інформації про завершені роботи, найближчі задачі, заплановані фази, залежності, відкриті рішення та правила безпечної розробки. Roadmap може доповнюватися на основі нових продуктових рішень і відгуків користувачів.

Актуалізовано після:

- завершення технічної стабілізації A2;
- локалізації Annual Report;
- локалізації Garage;
- продуктового аудиту власника CourierDash;
- read-only технічного аудиту архітектури;
- read-only аудиту майбутньої системи витрат і оренди транспорту;
- інтеграції та production-перевірки фінальної Landing Page V2.

## Поточний стабільний baseline

- Landing Page V2 інтегрована в `main` merge commit `63276c3a42243d2642b49b33cf7b8deadc4cff8e`.
- Production-стан Landing Page V2 перевірений і підтверджений власником проєкту.
- Landing-фаза завершена; V1 більше не підтримується як окремий production-напрям.
- Lint і typecheck проходять.
- 8 test files і 75 tests проходять.
- Production build проходить; зовнішнє завантаження Google Fonts потребує мережевого доступу.
- PL, UK, EN і RU підтримуються на основних локалізованих сторінках.

## Принцип роботи

1. Один активний кодовий напрям за раз.
2. Спочатку продуктове обговорення.
3. Потім затвердження поведінки.
4. За потреби — read-only технічний аудит.
5. Реалізація в окремій локальній feature- або fix-гілці.
6. Автоматичні перевірки.
7. Ручна перевірка власником продукту.
8. Лише після затвердження — commit, fast-forward merge, push і production verification.
9. `main` завжди залишається стабільним.
10. Широкий refactor не виконується без підтвердженої продуктової або технічної причини.

## Відповідальність і правила безпеки

- Продуктові рішення приймає власник CourierDash.
- Codex аналізує технічну можливість, залежності й ризики та виконує лише затверджене завдання.
- Невизначені UX-рішення не реалізуються навмання.
- Для функцій із позначкою `REQUIRES DESIGN` або `REQUIRES DISCUSSION` спочатку створюються й погоджуються варіанти.
- Потрібно зберігати backward compatibility та враховувати старих користувачів.
- Потрібно враховувати desktop, tablet і mobile.
- Потрібно враховувати PL, UK, EN і RU.
- Приватні дані повинні захищатися через Supabase RLS.
- Кожна зміна Supabase виконується окремою migration після перевірки remote schema.
- Supabase `service_role` ніколи не використовується в клієнтському коді.
- Існуючі localStorage-ключі не змінюються без окремого плану сумісності.
- Фінансові й податкові формули не змінюються в межах технічного очищення або refactor.

# COMPLETED — завершена історія

## COMPLETED — базовий roadmap і аудит A1

- Створено головний документ розвитку CourierDash.
- Проведено початковий read-only аудит репозиторію.
- Код застосунку в межах A1 не змінювався.
- Початковий lint baseline було зафіксовано для подальшого контрольованого очищення.

## COMPLETED — технічна стабілізація A2

- Широкий lint cleanup завершено малими контрольованими підзадачами A2.1–A2.11.
- Lint: 0 errors, 0 warnings.
- Typecheck, 3/3 test files, 34/34 tests і production build проходять.
- Типізовано користувача Supabase через офіційний тип `User`.
- Усунено `explicit any` у погоджених структурах Chart.js офіційними типами бібліотеки.
- Виправлено порядок loader/auth helper функцій без зміни runtime-поведінки.
- Browser-only hydration для налаштувань полів і вибраної мови збережено та документовано вузькими ESLint exceptions.
- Фінансові формули, Supabase-запити, localStorage-поведінка й UI в межах A2 не змінювалися.
- Широке технічне очищення завершене; майбутні refactors виконуються лише за конкретної необхідності.

Перевірені commits A2:

- `dbb0e3c fix(garage): use const for percent usage`
- `fe9df18 fix(work): clean up calculation variables`
- `61da881 fix(work): remove unused catch binding`
- `8ad34fd fix(work): use Supabase User type`
- `81f667b fix(work): type Chart.js datasets`
- `5a21e09 fix(work): split tax settings result`
- `576cb4b fix(garage): declare loader before effect`
- `ce67092 fix(work): declare auth helpers before effect`
- `190e4e0 fix(year): declare loader before effect`
- `ced41f3 chore(work): document field settings hydration`
- `f589cd7 chore(i18n): document language hydration`

Roadmap sync:

- Commit: `23569c87997ffab4803ce79767fa277942a072de`
- Message: `docs: sync roadmap after A2`

## COMPLETED — Work platforms і cash tips

- Додано Stuart.
- Додано платформу Other із власною назвою.
- Реалізовано гнучкий вибір активних платформ.
- Вибрані платформи зберігаються в localStorage.
- Uber і Wolt більше не є обов’язковими для збереження зміни.
- Онлайн-чайові й готівкові чайові враховуються окремо для кожної платформи.
- Сторінку Work розділено на менші компоненти без зміни зовнішньої поведінки.
- Збережено безпечне редагування старих записів.
- Пов’язані Supabase migrations, generated types і тести актуалізовано.

## COMPLETED — Annual Report localization

- Commit: `db6a2b9a0c2dd55905f18e2288e4bde0bad0fb02`
- Message: `feat(i18n): localize annual report`
- Annual Report локалізований для PL, UK, EN і RU.
- Локалізація перевірена локально й у production.
- Локалізація завершена, але функціональне оновлення Annual Report 2.0 ще заплановане.

## COMPLETED — Garage localization

- Commit: `20be974d196c5b15bd07f5ac8f0ebc7d26072d43`
- Message: `feat(i18n): localize garage`
- Garage локалізований для PL, UK, EN і RU.
- Локалізація перевірена локально й у production.
- Користувацькі назви деталей і ремонтів не перекладаються, оскільки це введені користувачем дані.

# PHASE 1 — термінові точкові виправлення

## 1.1. COMPLETED — Mobile auth header fix

Мета:

- виправити некоректну шапку сторінки авторизації на вузьких мобільних екранах;
- прибрати вихід мовних кнопок за межі viewport;
- прибрати некоректний перенос довгих написів;
- зберегти desktop без регресій.

Scope:

- тільки responsive layout шапки;
- не змінювати auth logic;
- не змінювати Landing Page;
- не робити redesign сторінки;
- не змінювати modal;
- не змінювати тексти.

Перевірка:

- PL, UK, EN і RU;
- ширини 320, 360, 390 і 430 px;
- відсутність horizontal scroll;
- desktop;
- browser console.

Результат:

- виправлено responsive layout мобільної шапки;
- перемикач мов на mobile замінено на компактний dropdown;
- кнопка входу залишається в межах viewport і не переноситься;
- перевірено PL, UK, EN і RU на ширинах 320, 360, 390 і 430 px;
- auth logic, modal і Hero не змінювалися.

## 1.2. COMPLETED — Annual Report correctness fix до версії 2.0

Це окрема рання задача, а не Annual Report 2.0.

Потрібно:

- додати Stuart у чинні річні розрахунки;
- додати Other;
- врахувати cash tips;
- врахувати `orders_stuart`;
- врахувати `orders_other`;
- захистити ділення на нуль;
- зберегти чинний дизайн;
- зберегти локалізацію PL, UK, EN і RU;
- не додавати витрати;
- не додавати нові секції;
- не додавати exports;
- не починати повне перепроєктування;
- не робити широкий refactor.

Мета — не залишати чинним користувачам неповні річні результати до появи Annual Report 2.0.

Результат:

- Stuart і Other додано до чинних річних розрахунків;
- cash tips враховано в річних підсумках;
- `orders_stuart` і `orders_other` враховано в загальній кількості замовлень;
- додано захист від ділення на нуль;
- чинний дизайн Annual Report і локалізацію PL, UK, EN і RU збережено;
- Supabase, migrations і generated database types не змінювалися.

# PHASE 2 — авторизація й email flows

## 2.1. COMPLETED — єдина політика auth routes

Завершено:

- уніфіковано поведінку `/`, `/login`, `/work`, `/work/year` і `/garage`;
- публічний `/` збережений для неавторизованих користувачів;
- авторизований користувач із `/` і `/login` переходить на `/work`;
- захищені routes перенаправляють неавторизованого користувача на `/login`;
- login/register session і redirect logic більше не має суперечливої поведінки;
- для одного сценарію використовується один redirect без redirect loops;
- приватний content не показується до завершення auth check;
- Supabase schema, migrations і generated types не змінювалися;
- дизайн і локалізація збережені.

## 2.2. COMPLETED — відновлення пароля

Завершено:

- додано окремі routes <code>/forgot-password</code> і <code>/reset-password</code>;
- recovery email запитується через <code>resetPasswordForEmail()</code> з neutral response;
- reset form відкривається лише після події <code>PASSWORD_RECOVERY</code>;
- звичайна auth session не приймається як recovery proof;
- новий пароль перевіряється за чинним minimum 6 символів і встановлюється через <code>updateUser()</code>;
- після успішної зміни виконується sign-out і перехід на login із success state;
- invalid і expired links мають окремий стан із можливістю запросити нове посилання;
- тексти додано для PL, UK, EN і RU;
- local redirect формується з поточного browser origin; production redirect allow-list і email delivery мають статус <code>REMOTE STATE: UNKNOWN</code>.

## 2.3. NEXT — підтвердження email для нових користувачів

Потрібно:

- confirmation flow для нових реєстрацій;
- не блокувати старих користувачів заднім числом;
- стан «Перевірте пошту»;
- resend confirmation;
- поведінка непідтвердженого акаунта;
- локалізація;
- production activation лише після перевірки email delivery і redirect settings.

## 2.4. REQUIRES DISCUSSION — branded email

Перед реалізацією потрібно перевірити фактичні налаштування Supabase.

Можливі рівні:

- зміна назви відправника;
- зміна тем і шаблонів листів;
- оформлення листів як CourierDash;
- власна адреса відправника;
- custom SMTP, якщо він справді потрібен;
- домен, DNS, SPF, DKIM і DMARC лише за фактичної необхідності.

Не вважати складну SMTP-конфігурацію обов’язковою наперед. Спочатку потрібно перевірити мінімальний достатній варіант саме для CourierDash.

# PHASE 3 — сучасна Landing Page

Статус фази: `COMPLETED`.

Власник продукту свідомо поставив Landing Page перед PHASE 2.3. Фінальну Landing Page V2 інтегровано в `main`, розгорнуто й перевірено в production; Landing-фаза завершена.

## 3.1. Продуктова структура

Landing Page повинна виконувати дві головні функції:

1. Новий відвідувач одразу розуміє, що таке CourierDash.
2. У нього виникає бажання зареєструватися.

Реалізовано:

- сильний Hero-блок;
- зрозуміле пояснення продукту;
- основні можливості;
- користь для кур’єра;
- демонстрація dashboard;
- Annual Report;
- Garage;
- FAQ;
- CTA;
- footer;
- адаптивний mobile, tablet і desktop layout;
- локалізація PL, UK, EN і RU;
- browser-language detection із fallback на EN та пріоритетом збереженого ручного вибору;
- доступні reveal/count/parallax ефекти з підтримкою `prefers-reduced-motion`.

## 3.2. Погоджена візуальна концепція

- Фінальна версія: `Landing Page V2`.
- Аудиторія: індивідуальні delivery couriers, а не fleets, компанії чи platform partners.
- Стиль: компактний premium dark productivity/fintech interface із night-route visual direction, синіми, фіолетовими, magenta та green accents.
- `night-route` є описом візуального напряму, а не окремою офіційною назвою Landing.
- Product mockups створені локальним HTML/CSS/inline SVG і чітко позначені як demo.
- У header використовується офіційний `app/icon.png` поруч із назвою CourierDash.
- Dashboard preview вирівняно: проблемний rotation і floating transform прибрано без зміни demo-даних.
- Heavy animation dependencies, stock photos, testimonials і непідтверджені product claims не використовуються.
- Motion реалізовано через CSS, `IntersectionObserver` і `requestAnimationFrame`; reduced-motion вимикає декоративне переміщення.
- Основний Landing UI винесено в компоненти <code>app/components/landing/</code>.

## 3.3. Погоджена route behavior

- Неавторизований користувач відкриває `/` і бачить Landing Page.
- Авторизований користувач при звичайному відкритті CourierDash автоматично потрапляє на `/work`.
- Після login/register користувач переходить на `/work`.
- Головні CTA відкривають наявний register modal; Sign in відкриває наявний login modal.
- Password recovery routes і protected-route policy не змінюються.
- Route `/about` не входить до Landing Page V2 і не створювався.

# PHASE 4 — інформаційна архітектура dashboard

Статус фази: `REQUIRES DESIGN`.

До хаотичного додавання нових карток потрібно погодити структуру dashboard.

## 4.1. Аудит і групування показників

Можливі групи:

- дохід;
- час;
- замовлення;
- пробіг;
- продуктивність;
- платформи;
- чайові й бонуси;
- витрати;
- ефективність.

Це не остаточний дизайн.

## 4.2. Адаптивний layout

Потрібно підготувати варіанти для:

- desktop;
- tablet;
- mobile;
- різної кількості активних показників;
- прихованих блоків;
- залежних метрик;
- майбутніх routes `/about`, `/expenses` і settings;
- масштабованої mobile navigation.

## 4.3. Правило прихованих показників

Погоджено:

- вимкнена метрика повністю зникає;
- blur не використовується;
- сітка перебудовується;
- не залишаються порожні місця;
- разом із недоступним базовим полем зникають залежні розрахунки;
- усі сценарії повинні виглядати рівно й презентабельно.

# PHASE 5 — спільна статистична та календарна основа

Статус: `PLANNED`.

Це точковий технічний фундамент, а не широкий refactor.

## 5.1. Єдині platform-aware calculations

Потрібно:

- використовувати актуальну модель Uber, Wolt, Bolt, Glovo, Stuart і Other;
- враховувати app tips;
- враховувати cash tips;
- враховувати bonuses;
- використовувати generated database types;
- прибрати ризик різних формул між dashboard і Annual Report;
- додати pure helper tests.

## 5.2. Calendar-date helpers

Потрібно:

- не використовувати UTC `toISOString()` там, де потрібна локальна календарна дата;
- створити безпечну роботу з `YYYY-MM-DD`;
- підтримати inclusive date ranges;
- уникнути off-by-one і timezone errors.

## 5.3. Date-range aggregation

Потрібна спільна можливість рахувати статистику за:

- місяць;
- тиждень;
- рік;
- власний діапазон.

Поточні числові результати не повинні змінитися без погодженої продуктової причини.

# PHASE 6 — нові періоди й показники

## 6.1. PLANNED — тижнева статистика

Погоджено:

- тиждень починається в понеділок;
- завершується в неділю;
- користувач може переходити між тижнями назад і вперед.

## 6.2. PLANNED — власний діапазон дат

Потрібно:

- початкова дата;
- кінцева дата;
- статистика лише за вибраний inclusive range.

Порівняння двох періодів зараз не входить у план і переноситься в `DEFERRED`.

## 6.3. PLANNED — замовлень за годину

Формула: `total orders / total hours`.

При нульових або відсутніх годинах:

- не показувати хибний 0;
- повертати unavailable;
- у UI показувати `—` або зрозуміле повідомлення.

## 6.4. PLANNED — середня відстань за замовлення

Формула: `total mileage / total orders`.

При нульових замовленнях або відсутньому mileage:

- не показувати хибний 0;
- повертати unavailable.

## 6.5. Залежності показників

Потрібна невелика typed dependency model.

Приклади:

- mileage → incomePerKm;
- mileage + orders → averageDistancePerOrder;
- hours + orders → ordersPerHour;
- mileage + fuel → fuelExpensePerKm;
- mileage + all expenses → allExpensesPerKm.

Не розкидати випадкові умови по багатьох компонентах.

# PHASE 7 — read-only remote Supabase baseline audit

Статус: `PLANNED`, обов’язкова передумова перед новими migrations.

Потрібно лише read-only перевірити фактичну remote Supabase schema:

- public tables;
- columns;
- types;
- constraints;
- indexes;
- foreign keys;
- RLS;
- policies;
- grants;
- functions;
- triggers;
- remote migration history;
- відповідність `supabase/schema.snapshot.json`;
- відповідність `lib/database.types.ts`;
- наявність або відсутність hardcoded UUID default;
- nullable owner columns;
- доступність `btree_gist`;
- можливі конфлікти назв із `expenses`, `transport_rentals` і `user_settings`.

Під час цього аудиту:

- не створювати migration;
- не змінювати Supabase;
- не застосовувати SQL;
- не оновлювати generated types;
- не робити backfill.

Результат фази — безпечна migration strategy.

# PHASE 8 — Expenses V1 contract та майбутня реалізація

Статус: `OWNER DECISIONS APPROVED — CONTRACT DRAFT`; production implementation: `NOT STARTED`.

Нормативний draft: `docs/shared/EXPENSES_CONTRACT.md`. П'ять owner decision gates затверджені 2026-08-10. Це не дозволяє автоматично переходити до schema, migration, `/expenses`, UI або Production implementation: кожен такий етап потребує окремого review та approval.

Валюта:

- тільки PLN;
- без currency selector;
- без multi-currency;
- без conversion.

Категорії Expenses V1:

1. `fuel`;
2. `rental`;
3. `maintenance`;
4. `repair`;
5. `food_on_shift`.

Дозволені sources:

- `fuel` — manual;
- `rental` — rental periods;
- `maintenance` — manual або Garage;
- `repair` — manual або Garage;
- `food_on_shift` — manual.

Charging, parking, insurance, washing, taxes та довільні recurring expenses не входять до V1.

## 8.1. Manual expenses

Manual source використовується тільки для `fuel`, `maintenance`, `repair` і `food_on_shift`. Мінімальна логічна інформація: owner, actual `YYYY-MM-DD` expense date, separate technical `created_at`, category, PLN amount і stable source identity. Користувач може створити manual expense заднім числом; filters, history і financial calculations використовують actual expense date, а не `created_at`.

Owner-approved persistence boundary зберігає тільки manual rows; rental periods і Garage history залишаються окремими sources зі стабільною парою `(source, sourceRecordId)`. Майбутня physical persistence model, correction history, deletion policy, constraints, RLS і CRUD/RPC boundary ще не погоджені. На contract-draft stage таблиця або migration не створюється.

Manual expense не потрібно обов'язково прив'язувати до Work shift і він не може дублювати Garage або rental source record.

## 8.2. Оренда транспорту

Один rental record означає один безперервний період однієї тижневої ставки з weekly amount, inclusive `valid_from`, inclusive optional `valid_to` та user ownership.

- `valid_to = null` означає незавершену оренду;
- оренда рахується незалежно від наявності Work shifts;
- старим користувачам вона не нараховується без явного створення rental period;
- rental periods не копіюються у manual expenses і не створюють physical daily/weekly expense rows.

Фізична schema потребує окремого remote audit і approval.

## 8.3. Математика оренди

Напрям формули за вибраний період:

`weekly_amount × active_calendar_days / 7`

Потрібно рахувати inclusive intersection rental period і selected date range, підтримувати calendar-month lengths, leap year, зміну ставки, паузу та повторне увімкнення. Повні сім активних днів дорівнюють weekly amount.

OWNER APPROVED: PLN inputs мають максимум два десяткові знаки; використовується decimal arithmetic; intermediate rental values не округлюються; фінальний результат округлюється до `0.01 PLN` за `ROUND_HALF_UP` однаково на Web і Mobile.

## 8.4. Зміна ставки

Звичайна зміна ставки не переписує минуле: вона завершує попередній period за день до нової ставки та створює новий period із вибраної дати.

OWNER APPROVED: rental periods одного користувача не перетинаються, normal close-and-create є атомарним, correction залишається окремою контрольованою дією, а retryable creates використовують idempotency keys. Конкретний schema/RPC/transaction/error contract не проєктується на цьому етапі.

## 8.5. Виправлення історії

Історичне виправлення є окремою дією, не звичайною зміною ставки. Воно має попереджати про перерахунок старих reports і вимагати свідомого підтвердження. Точні authorization, audit retention та UI потребують окремого рішення.

## 8.6. Garage і витрати

Garage Contract `0.3.0-draft` залишається окремим прийнятим source contract і не змінюється Expenses draft.

- Garage `routine` є source для `maintenance`;
- Garage `repair` є source для `repair`;
- Expenses history посилається на Garage row як на окреме source identity;
- Garage row не копіюється у manual expenses; Garage-derived expense створюється або виправляється лише у Garage;
- один Garage source record рахується не більше одного разу.

## 8.7. Агрегація витрат

`E` є source-aware сумою п'яти категорій за selected date range:

`E = fuel + rental + maintenance + repair + food_on_shift`

Manual, rental-period і Garage records зберігають різні source identities. Невідомі або недоступні sources не перетворюються на zero без completeness state.

## 8.8. Відображення

Future UI може містити короткий dashboard summary та окрему `/expenses` page, але точний UX має статус `REQUIRES DESIGN`. У межах contract draft UI та route не створюються.

## 8.9. Витрати на кілометр

Напрям майбутніх формул:

`fuelPerKm = fuel / mileage`

`allExpensesPerKm = E / mileage`

При нульовому, відсутньому або неповному mileage не показувати хибний zero; результат має бути unavailable/partial згідно з майбутньою availability matrix. Точне відображення не погоджене.

## 8.10. Financial calculation modes

`G = base income + app tips + cash tips + bonuses` і не залежить від presentation toggles.

Підтверджені режими:

- `gross = G`;
- `after_tax_and_fees = G - T`;
- `after_recorded_expenses = G - E`;
- `after_all_deductions = G - T - E`.

Результат може бути від'ємним, не обмежується нулем і не зберігається як authoritative total. OWNER APPROVED: результат має nullable value, completeness status і missing components; `partial` завжди має непорожній missing-component list і не є фінальним. Чинний Work tax runtime не змінюється; режими, залежні від `T`, не можуть бути `available`, поки `T` не визначається надійно в межах окремого tax audit.

# PHASE 9 — персоналізація dashboard і onboarding

Статус: `PLANNED`, частина UX має статус `REQUIRES DESIGN`.

## 9.1. Приватні user settings

Рекомендована окрема таблиця `user_settings`.

Не зберігати приватні dashboard settings у `profiles`.

Потрібно підтримати:

- standard dashboard;
- custom dashboard;
- input fields;
- active platforms;
- visible metrics;
- expense settings;
- onboarding state;
- dismissed legacy prompt;
- schema version;
- sync між пристроями;
- runtime validation;
- backward compatibility.

## 9.2. Стандартний і власний dashboard

Погоджено два режими:

### Standard

- рекомендований набір;
- можна почати роботу без детальних налаштувань.

### Custom

- користувач сам вибирає поля, платформи, показники й функції.

Окремі presets «мінімальний» і «повний» не потрібні.

## 9.3. First-login onboarding

Новий користувач:

- вибирає Standard або Custom;
- при Standard може одразу перейти до роботи;
- при Custom переходить до детальніших settings;
- бачить повідомлення, що вибір можна змінити пізніше.

## 9.4. Старі користувачі

Погоджено:

- не змушувати проходити onboarding;
- не змінювати старі дані;
- не ламати поточні поля;
- застосувати backward-compatible fallback;
- добровільно дати доступ до нових settings;
- за потреби один раз показати ненав’язливу пропозицію налаштувати dashboard.

## 9.5. Input fields і visible metrics

Погоджений напрям:

- це окремі налаштування;
- система не вмикає input field мовчки;
- якщо метриці бракує джерела, система пояснює залежність;
- пропонує ввімкнути необхідне поле;
- не показує хибні дані.

Точна UX-поведінка має статус `REQUIRES DESIGN`.

# PHASE 10 — Annual Report 2.0

Статус: `REQUIRES DESIGN`.

Це не просто refactor, а повне продуктове й функціональне оновлення.

## 10.1. Головна роль

Попередньо погоджено:

- короткий красивий річний підсумок зверху;
- детальна аналітика нижче.

Остаточна структура має бути погоджена окремо.

## 10.2. Візуальні концепції

До реалізації потрібно створити кілька концепцій:

- desktop;
- mobile;
- summary;
- cards;
- charts;
- tables;
- records;
- monthly breakdown;
- поведінка при неповних даних;
- conditional sections.

## 10.3. Єдина статистична основа

Annual Report 2.0 повинен використовувати:

- актуальні generated types;
- shared analytics;
- усі підтримані платформи;
- app tips;
- cash tips;
- bonuses;
- єдині формули для dashboard, periods і Annual Report.

Не повинно бути окремої несинхронізованої копії формул.

## 10.4. Структура

Погоджений напрям:

- фіксований основний річний підсумок;
- додаткові детальні секції;
- секції залежать від активних і фактично доступних даних.

Приклади:

- немає mileage — немає per-km metrics;
- немає hours — немає orders per hour;
- expenses не використовуються — немає expense sections;
- даних недостатньо — показується unavailable, а не хибний 0.

## 10.5. Витрати

Annual Report повинен підтримувати:

- fuel;
- rental;
- total expenses;
- income;
- income after expenses.

Потрібне представлення:

- дохід без віднімання витрат;
- дохід після витрат.

Точний UI-перемикач має статус `REQUIRES DESIGN`. Цей показник не змішується з податками.

## 10.6. Динамічні роки

Потрібно прибрати hardcoded список років і визначати доступні роки на основі даних або безпечної динамічної логіки.

## 10.7. Порівняння років

Статус: `DEFERRED`.

Порівняння поточного року з попереднім не повинно блокувати базовий Annual Report 2.0.

# PHASE 11 — exports Annual Report

Статус: `PLANNED` після стабільного Annual Report 2.0.

Реалізовувати окремими задачами:

1. CSV.
2. Excel.
3. PDF.
4. Зображення для поширення.

Не об’єднувати все в одну велику задачу.

Потрібно окремо погодити:

- raw data чи presentation report;
- які активні settings впливають на export;
- локалізацію;
- формати чисел;
- формати дат;
- mobile behavior;
- client-side або server-side реалізацію;
- необхідність зовнішніх бібліотек.

# PHASE 12 — податки, Brutto і Netto

Статус: `REQUIRES DISCUSSION`.

Податки залишаються окремим великим етапом.

До змін у коді потрібно:

- окремо описати реальну модель платформ і партнерів;
- перевірити актуальні правила;
- визначити, що CourierDash рахує точно;
- визначити, що може лише оцінювати;
- погодити терміни;
- погодити формули;
- погодити застереження.

Потрібно чітко розділити:

- дохід;
- витрати;
- дохід після витрат;
- податкову базу;
- податки;
- ZUS;
- Netto;
- прогнозоване Netto;
- фактичне Netto.

До завершення окремого предметного обговорення:

- не змінювати tax formulas;
- не виправляти їх навмання;
- не змішувати податки з модулем витрат;
- не блокувати через податки fuel, rental або базовий Annual Report 2.0.

# PHASE 13 — майбутня платна підписка

Статус: `DEFERRED`.

Зараз не реалізовувати:

- Stripe;
- billing;
- payment flow;
- webhooks;
- subscription tables;
- premium UI;
- entitlement code «про запас».

Коли продукт буде готовий до монетизації, окремо визначити:

- безкоштовні й платні функції;
- тарифи;
- provider;
- billing schema;
- subscription state;
- server-side access control;
- RLS/API enforcement;
- billing UI.

Поточний висновок:

- платіжний код зараз не потрібен;
- архітектурну готовність потрібно повторно перевірити перед окремою subscription phase.

# PHASE 14 — лідерборд

Статус: `OPTIONAL / DEFERRED`.

До технічної реалізації потрібно:

1. Провести опитування користувачів.
2. Підтвердити реальний попит.
3. Визначити добровільний opt-in.
4. Визначити nickname або інше публічне ім’я.
5. Врахувати міста, платформи й різні умови роботи.
6. Визначити privacy rules.
7. Не показувати доходи без прямої згоди.
8. Визначити захист від очевидно некоректних даних.
9. Створити візуальну концепцію.
10. Лише потім прийняти рішення про реалізацію або відмову.

# PHASE 15 — майбутні покращення на основі відгуків

Статус: `DEFERRED`.

Після основного плану:

- нові пропозиції користувачів;
- UX improvements;
- нові метрики;
- нові платформи;
- нові категорії витрат;
- порівняння періодів;
- порівняння років;
- додаткові exports;
- цілі;
- прогнози;
- інші підтверджені ідеї.

Не реалізовувати гіпотетичні функції без продуктового підтвердження.

# Що не потрібно робити зараз

- Не переписувати весь Work dashboard.
- Не робити широкий refactor без конкретної причини.
- Не створювати універсальний recurring billing engine.
- Не додавати charging.
- Не включати Garage в загальні витрати.
- Не додавати repair/service.
- Не створювати multi-currency.
- Не створювати comparison of periods.
- Не створювати year comparison.
- Не будувати exports на старому Annual Report.
- Не додавати payment code.
- Не створювати leaderboard schema.
- Не змінювати taxes без окремого дослідження.
- Не додавати складні abstractions «на майбутнє».
- Не змінювати localStorage behavior без backward compatibility plan.
- Не починати нові migrations без remote schema audit.

# Відкриті дизайнерські й продуктові рішення

Ці питання не вирішуються в межах roadmap. Вони мають бути погоджені перед відповідними фазами:

- точна інформаційна архітектура dashboard;
- точний спосіб показу двох показників expenses per km;
- UX залежностей input fields і visible metrics;
- UI сторінки `/expenses`;
- UI зміни rental rate;
- UI «Виправити історію»;
- структура Annual Report 2.0;
- UI перемикача income / income after expenses;
- формат кожного export;
- точні branded email settings;
- податкова модель;
- майбутня subscription model;
- доцільність leaderboard.

# Найближча задача

## NEXT

**Підтвердження email для нових користувачів.**
