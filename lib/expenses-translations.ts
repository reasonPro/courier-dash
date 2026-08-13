import type { ExpenseCategory } from "../docs/shared/types/expenses"
import type { LangType } from "./translations"

type CategoryCopy = Record<ExpenseCategory, { name: string; description: string }>

export type ExpensesCopy = {
  navLabel: string
  pageTitle: string
  backToWork: string
  prototypeBadge: string
  localOnly: string
  activationTitle: string
  activationDescription: string
  setupExpenses: string
  settingsTitle: string
  settingsDescription: string
  selectAtLeastOne: string
  saveSettings: string
  updateSettings: string
  categories: CategoryCopy
  addExpense: string
  addExpenseButton: string
  addExpenseAria: string
  addShiftAria: string
  settings: string
  selectedMonth: string
  filters: string
  filterTitle: string
  resetFilters: string
  applyFilters: string
  allCategories: string
  summaryTitle: string
  totalExpenses: string
  categoryBreakdown: string
  partialStatus: string
  partialGarage: string
  historyTitle: string
  noEntries: string
  noFilterResults: string
  readError: string
  category: string
  expenseDate: string
  paymentDate: string
  paidPeriod: string
  paidPeriodStart: string
  paidPeriodEnd: string
  paidPeriodHint: string
  amountPln: string
  addExpenseTitle: string
  editExpenseTitle: string
  saveExpense: string
  updateExpense: string
  amountInvalid: string
  dateInvalid: string
  expenseAdded: string
  expenseUpdated: string
  expenseDeleted: string
  edit: string
  delete: string
  cancel: string
  close: string
  deleteTitle: string
  deleteQuestion: string
  invalidRentalRange: string
  brutto: string
  netto: string
  afterExpensesBruttoTitle: string
  afterExpensesBruttoDescription: string
  afterExpensesNettoTitle: string
  afterExpensesNettoDescription: string
  nettoUnavailable: string
  openExpenses: string
  incompleteResult: string
  incompleteIncome: string
}

const pl: ExpensesCopy = {
  navLabel: "Wydatki",
  pageTitle: "Wydatki",
  backToWork: "Praca",
  prototypeBadge: "Staging Preview",
  localOnly: "Dane są zapisane na bezpiecznym koncie testowym Staging.",
  activationTitle: "Śledź realny zarobek po kosztach pracy",
  activationDescription: "Włącz tylko te kategorie, które chcesz prowadzić. Ustawienia możesz później zmienić.",
  setupExpenses: "Skonfiguruj wydatki",
  settingsTitle: "Kategorie wydatków",
  settingsDescription: "Wybierz koszty, które chcesz śledzić.",
  selectAtLeastOne: "Wybierz co najmniej jedną kategorię.",
  saveSettings: "Włącz wydatki",
  updateSettings: "Zapisz ustawienia",
  categories: {
    fuel: { name: "Paliwo", description: "Tankowanie podczas pracy kurierskiej" },
    rental: { name: "Wynajem", description: "Rzeczywista płatność za opłacony okres" },
    food_on_shift: { name: "Przekąski w pracy", description: "Jedzenie kupione podczas zmiany" },
    repair: { name: "Naprawy", description: "Usuwanie awarii pojazdu" },
    maintenance: { name: "Serwis", description: "Planowy serwis i obsługa pojazdu" },
  },
  addExpense: "Dodaj wydatek",
  addExpenseButton: "− Dodaj wydatek",
  addExpenseAria: "Dodaj wydatek",
  addShiftAria: "Dodaj zmianę roboczą",
  settings: "Kategorie wydatków",
  selectedMonth: "Miesiąc",
  filters: "Filtry",
  filterTitle: "Filtry wydatków",
  resetFilters: "Wyczyść filtry",
  applyFilters: "Zastosuj",
  allCategories: "Wszystkie kategorie",
  summaryTitle: "Podsumowanie miesiąca",
  totalExpenses: "Łączne wydatki",
  categoryBreakdown: "Według kategorii",
  partialStatus: "Niektóre wydatki nie są jeszcze uwzględnione",
  partialGarage: "Koszty Garażu nie są jeszcze połączone z lokalnym prototypem.",
  historyTitle: "Historia wydatków",
  noEntries: "Brak wydatków w tym miesiącu.",
  noFilterResults: "Brak wyników dla wybranych filtrów.",
  readError: "Nie udało się wczytać lub zapisać danych wydatków.",
  category: "Kategoria",
  expenseDate: "Data wydatku",
  paymentDate: "Data płatności",
  paidPeriod: "Opłacony okres",
  paidPeriodStart: "Początek opłaconego okresu",
  paidPeriodEnd: "Koniec opłaconego okresu",
  paidPeriodHint: "Podaj faktyczny okres opłacony tą płatnością. Data końcowa jest wliczona.",
  amountPln: "Kwota (PLN)",
  addExpenseTitle: "Nowy wydatek",
  editExpenseTitle: "Edytuj wydatek",
  saveExpense: "Zapisz wydatek",
  updateExpense: "Zapisz zmiany",
  amountInvalid: "Wpisz nieujemną kwotę z maksymalnie dwoma miejscami po przecinku.",
  dateInvalid: "Wybierz prawidłową datę.",
  expenseAdded: "Wydatek zapisany.",
  expenseUpdated: "Wydatek zaktualizowany.",
  expenseDeleted: "Wydatek usunięty.",
  edit: "Edytuj",
  delete: "Usuń",
  cancel: "Anuluj",
  close: "Zamknij",
  deleteTitle: "Usunąć wydatek?",
  deleteQuestion: "Usunąć {category} w kwocie {amount} PLN?",
  invalidRentalRange: "Data zakończenia nie może być wcześniejsza od rozpoczęcia.",
  brutto: "BRUTTO",
  netto: "NETTO",
  afterExpensesBruttoTitle: "Dochód po wydatkach — BRUTTO",
  afterExpensesBruttoDescription: "Cały zapisany przychód minus zapisane wydatki.",
  afterExpensesNettoTitle: "Dochód po wydatkach — NETTO",
  afterExpensesNettoDescription: "Cały zapisany przychód minus podatki i zapisane wydatki.",
  nettoUnavailable: "Skonfiguruj podatki na stronie Praca, aby zobaczyć wynik NETTO.",
  openExpenses: "Przejdź do wydatków",
  incompleteResult: "Niektóre wydatki nie są jeszcze uwzględnione — część danych jest niedostępna.",
  incompleteIncome: "Nie można teraz wiarygodnie obliczyć dochodu po wydatkach.",
}

const uk: ExpensesCopy = {
  navLabel: "Витрати",
  pageTitle: "Витрати",
  backToWork: "Робота",
  prototypeBadge: "Staging Preview",
  localOnly: "Дані зберігаються в безпечному тестовому Staging-акаунті.",
  activationTitle: "Відстежуйте реальний заробіток після робочих витрат",
  activationDescription: "Увімкніть лише потрібні категорії. Набір можна змінити пізніше.",
  setupExpenses: "Налаштувати витрати",
  settingsTitle: "Категорії витрат",
  settingsDescription: "Оберіть витрати, які хочете вести.",
  selectAtLeastOne: "Оберіть щонайменше одну категорію.",
  saveSettings: "Увімкнути витрати",
  updateSettings: "Зберегти налаштування",
  categories: {
    fuel: { name: "Бензин", description: "Заправки під час кур’єрської роботи" },
    rental: { name: "Оренда", description: "Фактична оплата за оплачений період" },
    food_on_shift: { name: "Перекуси під час зміни", description: "Їжа, придбана під час роботи" },
    repair: { name: "Ремонт транспорту", description: "Усунення поломок транспортного засобу" },
    maintenance: { name: "Сервіс транспорту", description: "Планове обслуговування та сервіс" },
  },
  addExpense: "Додати витрату",
  addExpenseButton: "− Додати витрату",
  addExpenseAria: "Додати витрату",
  addShiftAria: "Додати робочу зміну",
  settings: "Категорії витрат",
  selectedMonth: "Місяць",
  filters: "Фільтри",
  filterTitle: "Фільтри витрат",
  resetFilters: "Скинути фільтри",
  applyFilters: "Застосувати",
  allCategories: "Усі категорії",
  summaryTitle: "Підсумок за місяць",
  totalExpenses: "Загальна сума витрат",
  categoryBreakdown: "За категоріями",
  partialStatus: "Деякі витрати ще не враховані",
  partialGarage: "Витрати Garage ще не підключені до локального прототипу.",
  historyTitle: "Історія витрат",
  noEntries: "За цей місяць витрат ще немає.",
  noFilterResults: "За вибраними фільтрами нічого не знайдено.",
  readError: "Не вдалося завантажити або зберегти дані витрат.",
  category: "Категорія",
  expenseDate: "Фактична дата витрати",
  paymentDate: "Дата оплати",
  paidPeriod: "Оплачений період",
  paidPeriodStart: "Початок оплаченого періоду",
  paidPeriodEnd: "Кінець оплаченого періоду",
  paidPeriodHint: "Вкажіть фактичний період, оплачений цим платежем. Дата завершення входить у період.",
  amountPln: "Сума (PLN)",
  addExpenseTitle: "Нова витрата",
  editExpenseTitle: "Редагування витрати",
  saveExpense: "Зберегти витрату",
  updateExpense: "Зберегти зміни",
  amountInvalid: "Введіть невід’ємну суму, максимум два знаки після коми.",
  dateInvalid: "Оберіть коректну дату.",
  expenseAdded: "Витрату збережено.",
  expenseUpdated: "Витрату оновлено.",
  expenseDeleted: "Витрату видалено.",
  edit: "Редагувати",
  delete: "Видалити",
  cancel: "Скасувати",
  close: "Закрити",
  deleteTitle: "Видалити витрату?",
  deleteQuestion: "Видалити {category} на суму {amount} PLN?",
  invalidRentalRange: "Дата завершення не може бути раніше дати початку.",
  brutto: "BRUTTO",
  netto: "NETTO",
  afterExpensesBruttoTitle: "Дохід після витрат — BRUTTO",
  afterExpensesBruttoDescription: "Увесь записаний дохід мінус записані витрати.",
  afterExpensesNettoTitle: "Дохід після витрат — NETTO",
  afterExpensesNettoDescription: "Увесь записаний дохід мінус податки та записані витрати.",
  nettoUnavailable: "Налаштуйте податки на сторінці «Робота», щоб побачити результат NETTO.",
  openExpenses: "Перейти до витрат",
  incompleteResult: "Деякі витрати ще не враховані — частина даних недоступна.",
  incompleteIncome: "Зараз неможливо надійно розрахувати дохід після витрат.",
}

const en: ExpensesCopy = {
  navLabel: "Expenses",
  pageTitle: "Expenses",
  backToWork: "Work",
  prototypeBadge: "Staging Preview",
  localOnly: "Data is saved to the secure Staging test account.",
  activationTitle: "Track your real earnings after work expenses",
  activationDescription: "Enable only the categories you want to track. You can change them later.",
  setupExpenses: "Set up expenses",
  settingsTitle: "Expense categories",
  settingsDescription: "Choose the costs you want to track.",
  selectAtLeastOne: "Choose at least one category.",
  saveSettings: "Enable expenses",
  updateSettings: "Save settings",
  categories: {
    fuel: { name: "Fuel", description: "Fuel bought for courier work" },
    rental: { name: "Vehicle rental", description: "Actual payment for a paid period" },
    food_on_shift: { name: "Snacks on shift", description: "Food bought while working" },
    repair: { name: "Vehicle repair", description: "Fixing vehicle faults" },
    maintenance: { name: "Vehicle service", description: "Routine service and maintenance" },
  },
  addExpense: "Add expense",
  addExpenseButton: "− Add expense",
  addExpenseAria: "Add an expense",
  addShiftAria: "Add a work shift",
  settings: "Expense categories",
  selectedMonth: "Month",
  filters: "Filters",
  filterTitle: "Expense filters",
  resetFilters: "Reset filters",
  applyFilters: "Apply",
  allCategories: "All categories",
  summaryTitle: "Monthly summary",
  totalExpenses: "Total expenses",
  categoryBreakdown: "By category",
  partialStatus: "Some expenses are not included yet",
  partialGarage: "Garage costs are not connected to the local prototype yet.",
  historyTitle: "Expense history",
  noEntries: "No expenses in this month yet.",
  noFilterResults: "No expenses match the selected filters.",
  readError: "Expense data could not be loaded or saved.",
  category: "Category",
  expenseDate: "Actual expense date",
  paymentDate: "Payment date",
  paidPeriod: "Paid period",
  paidPeriodStart: "Paid period start",
  paidPeriodEnd: "Paid period end",
  paidPeriodHint: "Enter the actual period covered by this payment. The end date is inclusive.",
  amountPln: "Amount (PLN)",
  addExpenseTitle: "New expense",
  editExpenseTitle: "Edit expense",
  saveExpense: "Save expense",
  updateExpense: "Save changes",
  amountInvalid: "Enter a non-negative amount with no more than two decimal places.",
  dateInvalid: "Choose a valid date.",
  expenseAdded: "Expense saved.",
  expenseUpdated: "Expense updated.",
  expenseDeleted: "Expense deleted.",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  close: "Close",
  deleteTitle: "Delete expense?",
  deleteQuestion: "Delete {category} for {amount} PLN?",
  invalidRentalRange: "The end date cannot be before the start date.",
  brutto: "GROSS",
  netto: "NET",
  afterExpensesBruttoTitle: "Income after expenses — GROSS",
  afterExpensesBruttoDescription: "All recorded income minus recorded expenses.",
  afterExpensesNettoTitle: "Income after expenses — NET",
  afterExpensesNettoDescription: "All recorded income minus taxes and recorded expenses.",
  nettoUnavailable: "Set up taxes on the Work page to see the NET result.",
  openExpenses: "Open expenses",
  incompleteResult: "Some expenses are not included yet — some data is unavailable.",
  incompleteIncome: "Income after expenses cannot be calculated reliably right now.",
}

const ru: ExpensesCopy = {
  navLabel: "Расходы",
  pageTitle: "Расходы",
  backToWork: "Работа",
  prototypeBadge: "Staging Preview",
  localOnly: "Данные сохраняются в безопасном тестовом Staging-аккаунте.",
  activationTitle: "Отслеживайте реальный заработок после рабочих расходов",
  activationDescription: "Включите только нужные категории. Их можно изменить позже.",
  setupExpenses: "Настроить расходы",
  settingsTitle: "Категории расходов",
  settingsDescription: "Выберите расходы, которые хотите учитывать.",
  selectAtLeastOne: "Выберите хотя бы одну категорию.",
  saveSettings: "Включить расходы",
  updateSettings: "Сохранить настройки",
  categories: {
    fuel: { name: "Бензин", description: "Заправки во время курьерской работы" },
    rental: { name: "Аренда", description: "Фактическая оплата за оплаченный период" },
    food_on_shift: { name: "Перекусы на смене", description: "Еда, купленная во время работы" },
    repair: { name: "Ремонт транспорта", description: "Устранение поломок транспорта" },
    maintenance: { name: "Сервис транспорта", description: "Плановый сервис и обслуживание" },
  },
  addExpense: "Добавить расход",
  addExpenseButton: "− Добавить расход",
  addExpenseAria: "Добавить расход",
  addShiftAria: "Добавить рабочую смену",
  settings: "Категории расходов",
  selectedMonth: "Месяц",
  filters: "Фильтры",
  filterTitle: "Фильтры расходов",
  resetFilters: "Сбросить фильтры",
  applyFilters: "Применить",
  allCategories: "Все категории",
  summaryTitle: "Итоги за месяц",
  totalExpenses: "Общая сумма расходов",
  categoryBreakdown: "По категориям",
  partialStatus: "Некоторые расходы пока не учтены",
  partialGarage: "Расходы Garage пока не подключены к локальному прототипу.",
  historyTitle: "История расходов",
  noEntries: "За этот месяц расходов пока нет.",
  noFilterResults: "По выбранным фильтрам ничего не найдено.",
  readError: "Не удалось загрузить или сохранить данные расходов.",
  category: "Категория",
  expenseDate: "Фактическая дата расхода",
  paymentDate: "Дата оплаты",
  paidPeriod: "Оплаченный период",
  paidPeriodStart: "Начало оплаченного периода",
  paidPeriodEnd: "Конец оплаченного периода",
  paidPeriodHint: "Укажите фактический период, оплаченный этим платежом. Дата окончания входит в период.",
  amountPln: "Сумма (PLN)",
  addExpenseTitle: "Новый расход",
  editExpenseTitle: "Редактирование расхода",
  saveExpense: "Сохранить расход",
  updateExpense: "Сохранить изменения",
  amountInvalid: "Введите неотрицательную сумму, максимум два знака после запятой.",
  dateInvalid: "Выберите корректную дату.",
  expenseAdded: "Расход сохранён.",
  expenseUpdated: "Расход обновлён.",
  expenseDeleted: "Расход удалён.",
  edit: "Изменить",
  delete: "Удалить",
  cancel: "Отмена",
  close: "Закрыть",
  deleteTitle: "Удалить расход?",
  deleteQuestion: "Удалить {category} на сумму {amount} PLN?",
  invalidRentalRange: "Дата завершения не может быть раньше даты начала.",
  brutto: "БРУТТО",
  netto: "НЕТТО",
  afterExpensesBruttoTitle: "Доход после расходов — БРУТТО",
  afterExpensesBruttoDescription: "Весь записанный доход минус записанные расходы.",
  afterExpensesNettoTitle: "Доход после расходов — НЕТТО",
  afterExpensesNettoDescription: "Весь записанный доход минус налоги и записанные расходы.",
  nettoUnavailable: "Настройте налоги на странице «Работа», чтобы увидеть результат НЕТТО.",
  openExpenses: "Перейти к расходам",
  incompleteResult: "Некоторые расходы пока не учтены — часть данных недоступна.",
  incompleteIncome: "Сейчас невозможно надёжно рассчитать доход после расходов.",
}

export const expensesTranslations: Record<LangType, ExpensesCopy> = {
  pl,
  uk,
  en,
  ru,
}
