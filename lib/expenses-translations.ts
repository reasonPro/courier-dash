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
  addExpenseAria: string
  addShiftAria: string
  settings: string
  selectedMonth: string
  filters: string
  filterTitle: string
  resetFilters: string
  applyFilters: string
  allCategories: string
  allSources: string
  source: string
  sourceManual: string
  sourceGarage: string
  sourceRental: string
  fromDate: string
  toDate: string
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
  rentalTitle: string
  currentWeeklyRate: string
  activePeriod: string
  selectedMonthRental: string
  rentalForMonth: string
  rentalForSelectedPeriod: string
  rentalCalculationPeriod: string
  manageRental: string
  noRentalPeriod: string
  createRental: string
  weeklyRate: string
  startDate: string
  endDate: string
  endInclusive: string
  currentPeriod: string
  rateHistory: string
  changeRate: string
  newRateStart: string
  correctHistory: string
  correctionWarning: string
  continueCorrection: string
  saveCorrection: string
  rentalSaved: string
  rentalCorrected: string
  rentalOverlap: string
  invalidRentalRange: string
  afterExpensesTitle: string
  afterExpensesDescription: string
  openExpenses: string
  incompleteResult: string
  incompleteIncome: string
}

const pl: ExpensesCopy = {
  navLabel: "Wydatki",
  pageTitle: "Wydatki",
  backToWork: "Praca",
  prototypeBadge: "Prototyp lokalny",
  localOnly: "Dane są zapisane tylko w tej przeglądarce.",
  activationTitle: "Zobacz realny zarobek po kosztach pracy",
  activationDescription: "Włącz tylko te kategorie, które chcesz prowadzić. Ustawienia możesz później zmienić.",
  setupExpenses: "Skonfiguruj wydatki",
  settingsTitle: "Kategorie wydatków",
  settingsDescription: "Wybierz koszty, które chcesz śledzić.",
  selectAtLeastOne: "Wybierz co najmniej jedną kategorię.",
  saveSettings: "Włącz wydatki",
  updateSettings: "Zapisz ustawienia",
  categories: {
    fuel: { name: "Paliwo", description: "Tankowanie podczas pracy kurierskiej" },
    rental: { name: "Wynajem", description: "Koszt pojazdu liczony z tygodniowej stawki" },
    food_on_shift: { name: "Przekąski w pracy", description: "Jedzenie kupione podczas zmiany" },
    repair: { name: "Naprawy", description: "Usuwanie awarii pojazdu" },
    maintenance: { name: "Serwis", description: "Planowy serwis i obsługa pojazdu" },
  },
  addExpense: "Dodaj wydatek",
  addExpenseAria: "Dodaj wydatek",
  addShiftAria: "Dodaj zmianę roboczą",
  settings: "Kategorie wydatków",
  selectedMonth: "Miesiąc",
  filters: "Filtry",
  filterTitle: "Filtry wydatków",
  resetFilters: "Wyczyść filtry",
  applyFilters: "Zastosuj",
  allCategories: "Wszystkie kategorie",
  allSources: "Wszystkie źródła",
  source: "Źródło",
  sourceManual: "Ręczne",
  sourceGarage: "Garaż",
  sourceRental: "Wynajem",
  fromDate: "Od",
  toDate: "Do",
  summaryTitle: "Podsumowanie miesiąca",
  totalExpenses: "Łączne wydatki",
  categoryBreakdown: "Według kategorii",
  partialStatus: "Niektóre wydatki nie są jeszcze uwzględnione",
  partialGarage: "Koszty Garażu nie są jeszcze połączone z lokalnym prototypem.",
  historyTitle: "Historia wydatków",
  noEntries: "Brak wydatków w tym miesiącu.",
  noFilterResults: "Brak wyników dla wybranych filtrów.",
  readError: "Nie udało się odczytać lokalnych danych prototypu.",
  category: "Kategoria",
  expenseDate: "Data wydatku",
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
  rentalTitle: "Wynajem pojazdu",
  currentWeeklyRate: "Aktualna stawka tygodniowa",
  activePeriod: "Aktywny okres",
  selectedMonthRental: "Za wybrany miesiąc",
  rentalForMonth: "Wynajem za {month}",
  rentalForSelectedPeriod: "Wynajem za wybrany okres",
  rentalCalculationPeriod: "Okres rozliczenia",
  manageRental: "Zarządzaj wynajmem",
  noRentalPeriod: "Nie ustawiono jeszcze okresu wynajmu.",
  createRental: "Utwórz okres wynajmu",
  weeklyRate: "Stawka tygodniowa (PLN)",
  startDate: "Data rozpoczęcia",
  endDate: "Data zakończenia",
  endInclusive: "Ostatni opłacony dzień, włącznie. Pozostaw puste dla aktywnego okresu.",
  currentPeriod: "Aktualny okres",
  rateHistory: "Historia stawek",
  changeRate: "Zmień stawkę",
  newRateStart: "Nowa stawka od",
  correctHistory: "Popraw historię",
  correctionWarning: "Zmiana historii może przeliczyć wcześniejsze miesięczne podsumowania.",
  continueCorrection: "Rozumiem, popraw historię",
  saveCorrection: "Zapisz poprawkę",
  rentalSaved: "Okres wynajmu zapisany.",
  rentalCorrected: "Historia wynajmu poprawiona.",
  rentalOverlap: "Okresy wynajmu nie mogą się nakładać.",
  invalidRentalRange: "Data zakończenia nie może być wcześniejsza od rozpoczęcia.",
  afterExpensesTitle: "Dochód po wydatkach",
  afterExpensesDescription: "Przychód z napiwkami i bonusami minus zapisane wydatki. To nie jest netto.",
  openExpenses: "Przejdź do wydatków",
  incompleteResult: "Niektóre wydatki nie są jeszcze uwzględnione — część źródeł jest niedostępna.",
  incompleteIncome: "Nie można teraz wiarygodnie obliczyć dochodu po wydatkach.",
}

const uk: ExpensesCopy = {
  navLabel: "Витрати",
  pageTitle: "Витрати",
  backToWork: "Робота",
  prototypeBadge: "Локальний прототип",
  localOnly: "Дані зберігаються лише в цьому браузері.",
  activationTitle: "Побачте реальний заробіток після робочих витрат",
  activationDescription: "Увімкніть лише потрібні категорії. Набір можна змінити пізніше.",
  setupExpenses: "Налаштувати витрати",
  settingsTitle: "Категорії витрат",
  settingsDescription: "Оберіть витрати, які хочете вести.",
  selectAtLeastOne: "Оберіть щонайменше одну категорію.",
  saveSettings: "Увімкнути витрати",
  updateSettings: "Зберегти налаштування",
  categories: {
    fuel: { name: "Бензин", description: "Заправки під час кур’єрської роботи" },
    rental: { name: "Оренда", description: "Вартість транспорту за тижневою ставкою" },
    food_on_shift: { name: "Перекуси під час зміни", description: "Їжа, придбана під час роботи" },
    repair: { name: "Ремонт транспорту", description: "Усунення поломок транспортного засобу" },
    maintenance: { name: "Сервіс транспорту", description: "Планове обслуговування та сервіс" },
  },
  addExpense: "Додати витрату",
  addExpenseAria: "Додати витрату",
  addShiftAria: "Додати робочу зміну",
  settings: "Категорії витрат",
  selectedMonth: "Місяць",
  filters: "Фільтри",
  filterTitle: "Фільтри витрат",
  resetFilters: "Скинути фільтри",
  applyFilters: "Застосувати",
  allCategories: "Усі категорії",
  allSources: "Усі джерела",
  source: "Джерело",
  sourceManual: "Ручні",
  sourceGarage: "Garage",
  sourceRental: "Оренда",
  fromDate: "Від",
  toDate: "До",
  summaryTitle: "Підсумок за місяць",
  totalExpenses: "Загальна сума витрат",
  categoryBreakdown: "За категоріями",
  partialStatus: "Деякі витрати ще не враховані",
  partialGarage: "Витрати Garage ще не підключені до локального прототипу.",
  historyTitle: "Історія витрат",
  noEntries: "За цей місяць витрат ще немає.",
  noFilterResults: "За вибраними фільтрами нічого не знайдено.",
  readError: "Не вдалося прочитати локальні дані прототипу.",
  category: "Категорія",
  expenseDate: "Фактична дата витрати",
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
  rentalTitle: "Оренда транспорту",
  currentWeeklyRate: "Поточна тижнева ставка",
  activePeriod: "Активний період",
  selectedMonthRental: "За вибраний місяць",
  rentalForMonth: "Оренда за {month}",
  rentalForSelectedPeriod: "Оренда за вибраний період",
  rentalCalculationPeriod: "Період розрахунку",
  manageRental: "Керувати орендою",
  noRentalPeriod: "Період оренди ще не налаштовано.",
  createRental: "Створити період оренди",
  weeklyRate: "Тижнева ставка (PLN)",
  startDate: "Дата початку",
  endDate: "Дата завершення",
  endInclusive: "Останній оплачений день включно. Залиште порожнім для активного періоду.",
  currentPeriod: "Поточний період",
  rateHistory: "Історія ставок",
  changeRate: "Змінити ставку",
  newRateStart: "Нова ставка з",
  correctHistory: "Виправити історію",
  correctionWarning: "Зміна історії може перерахувати попередні місячні підсумки.",
  continueCorrection: "Розумію, виправити історію",
  saveCorrection: "Зберегти виправлення",
  rentalSaved: "Період оренди збережено.",
  rentalCorrected: "Історію оренди виправлено.",
  rentalOverlap: "Періоди оренди не можуть перетинатися.",
  invalidRentalRange: "Дата завершення не може бути раніше дати початку.",
  afterExpensesTitle: "Дохід після витрат",
  afterExpensesDescription: "Увесь дохід із чайовими й бонусами мінус записані витрати. Це не Netto.",
  openExpenses: "Перейти до витрат",
  incompleteResult: "Деякі витрати ще не враховані — частина джерел недоступна.",
  incompleteIncome: "Зараз неможливо надійно розрахувати дохід після витрат.",
}

const en: ExpensesCopy = {
  navLabel: "Expenses",
  pageTitle: "Expenses",
  backToWork: "Work",
  prototypeBadge: "Local prototype",
  localOnly: "Data is stored only in this browser.",
  activationTitle: "See what you really earn after work expenses",
  activationDescription: "Enable only the categories you want to track. You can change them later.",
  setupExpenses: "Set up expenses",
  settingsTitle: "Expense categories",
  settingsDescription: "Choose the costs you want to track.",
  selectAtLeastOne: "Choose at least one category.",
  saveSettings: "Enable expenses",
  updateSettings: "Save settings",
  categories: {
    fuel: { name: "Fuel", description: "Fuel bought for courier work" },
    rental: { name: "Vehicle rental", description: "Vehicle cost based on a weekly rate" },
    food_on_shift: { name: "Snacks on shift", description: "Food bought while working" },
    repair: { name: "Vehicle repair", description: "Fixing vehicle faults" },
    maintenance: { name: "Vehicle service", description: "Routine service and maintenance" },
  },
  addExpense: "Add expense",
  addExpenseAria: "Add an expense",
  addShiftAria: "Add a work shift",
  settings: "Expense categories",
  selectedMonth: "Month",
  filters: "Filters",
  filterTitle: "Expense filters",
  resetFilters: "Reset filters",
  applyFilters: "Apply",
  allCategories: "All categories",
  allSources: "All sources",
  source: "Source",
  sourceManual: "Manual",
  sourceGarage: "Garage",
  sourceRental: "Rental",
  fromDate: "From",
  toDate: "To",
  summaryTitle: "Monthly summary",
  totalExpenses: "Total expenses",
  categoryBreakdown: "By category",
  partialStatus: "Some expenses are not included yet",
  partialGarage: "Garage costs are not connected to the local prototype yet.",
  historyTitle: "Expense history",
  noEntries: "No expenses in this month yet.",
  noFilterResults: "No expenses match the selected filters.",
  readError: "The local prototype data could not be read.",
  category: "Category",
  expenseDate: "Actual expense date",
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
  rentalTitle: "Vehicle rental",
  currentWeeklyRate: "Current weekly rate",
  activePeriod: "Active period",
  selectedMonthRental: "For selected month",
  rentalForMonth: "Rental for {month}",
  rentalForSelectedPeriod: "Rental for the selected period",
  rentalCalculationPeriod: "Calculation period",
  manageRental: "Manage rental",
  noRentalPeriod: "No rental period has been set up yet.",
  createRental: "Create rental period",
  weeklyRate: "Weekly rate (PLN)",
  startDate: "Start date",
  endDate: "End date",
  endInclusive: "Last paid day, inclusive. Leave blank for an active period.",
  currentPeriod: "Current period",
  rateHistory: "Rate history",
  changeRate: "Change rate",
  newRateStart: "New rate from",
  correctHistory: "Correct history",
  correctionWarning: "Changing history may recalculate earlier monthly totals.",
  continueCorrection: "I understand, correct history",
  saveCorrection: "Save correction",
  rentalSaved: "Rental period saved.",
  rentalCorrected: "Rental history corrected.",
  rentalOverlap: "Rental periods cannot overlap.",
  invalidRentalRange: "The end date cannot be before the start date.",
  afterExpensesTitle: "Income after expenses",
  afterExpensesDescription: "All income including tips and bonuses, minus recorded expenses. This is not net income.",
  openExpenses: "Open expenses",
  incompleteResult: "Some expenses are not included yet — some sources are unavailable.",
  incompleteIncome: "Income after expenses cannot be calculated reliably right now.",
}

const ru: ExpensesCopy = {
  navLabel: "Расходы",
  pageTitle: "Расходы",
  backToWork: "Работа",
  prototypeBadge: "Локальный прототип",
  localOnly: "Данные сохраняются только в этом браузере.",
  activationTitle: "Узнайте реальный доход после рабочих расходов",
  activationDescription: "Включите только нужные категории. Их можно изменить позже.",
  setupExpenses: "Настроить расходы",
  settingsTitle: "Категории расходов",
  settingsDescription: "Выберите расходы, которые хотите учитывать.",
  selectAtLeastOne: "Выберите хотя бы одну категорию.",
  saveSettings: "Включить расходы",
  updateSettings: "Сохранить настройки",
  categories: {
    fuel: { name: "Бензин", description: "Заправки во время курьерской работы" },
    rental: { name: "Аренда", description: "Стоимость транспорта по недельной ставке" },
    food_on_shift: { name: "Перекусы на смене", description: "Еда, купленная во время работы" },
    repair: { name: "Ремонт транспорта", description: "Устранение поломок транспорта" },
    maintenance: { name: "Сервис транспорта", description: "Плановый сервис и обслуживание" },
  },
  addExpense: "Добавить расход",
  addExpenseAria: "Добавить расход",
  addShiftAria: "Добавить рабочую смену",
  settings: "Категории расходов",
  selectedMonth: "Месяц",
  filters: "Фильтры",
  filterTitle: "Фильтры расходов",
  resetFilters: "Сбросить фильтры",
  applyFilters: "Применить",
  allCategories: "Все категории",
  allSources: "Все источники",
  source: "Источник",
  sourceManual: "Ручные",
  sourceGarage: "Garage",
  sourceRental: "Аренда",
  fromDate: "От",
  toDate: "До",
  summaryTitle: "Итоги за месяц",
  totalExpenses: "Общая сумма расходов",
  categoryBreakdown: "По категориям",
  partialStatus: "Некоторые расходы пока не учтены",
  partialGarage: "Расходы Garage пока не подключены к локальному прототипу.",
  historyTitle: "История расходов",
  noEntries: "За этот месяц расходов пока нет.",
  noFilterResults: "По выбранным фильтрам ничего не найдено.",
  readError: "Не удалось прочитать локальные данные прототипа.",
  category: "Категория",
  expenseDate: "Фактическая дата расхода",
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
  rentalTitle: "Аренда транспорта",
  currentWeeklyRate: "Текущая недельная ставка",
  activePeriod: "Активный период",
  selectedMonthRental: "За выбранный месяц",
  rentalForMonth: "Аренда за {month}",
  rentalForSelectedPeriod: "Аренда за выбранный период",
  rentalCalculationPeriod: "Период расчёта",
  manageRental: "Управлять арендой",
  noRentalPeriod: "Период аренды ещё не настроен.",
  createRental: "Создать период аренды",
  weeklyRate: "Недельная ставка (PLN)",
  startDate: "Дата начала",
  endDate: "Дата завершения",
  endInclusive: "Последний оплаченный день включительно. Оставьте пустым для активного периода.",
  currentPeriod: "Текущий период",
  rateHistory: "История ставок",
  changeRate: "Изменить ставку",
  newRateStart: "Новая ставка с",
  correctHistory: "Исправить историю",
  correctionWarning: "Изменение истории может пересчитать прошлые месячные итоги.",
  continueCorrection: "Понимаю, исправить историю",
  saveCorrection: "Сохранить исправление",
  rentalSaved: "Период аренды сохранён.",
  rentalCorrected: "История аренды исправлена.",
  rentalOverlap: "Периоды аренды не могут пересекаться.",
  invalidRentalRange: "Дата завершения не может быть раньше даты начала.",
  afterExpensesTitle: "Доход после расходов",
  afterExpensesDescription: "Весь доход с чаевыми и бонусами минус записанные расходы. Это не Netto.",
  openExpenses: "Перейти к расходам",
  incompleteResult: "Некоторые расходы пока не учтены — часть источников недоступна.",
  incompleteIncome: "Сейчас невозможно надёжно рассчитать доход после расходов.",
}

export const expensesTranslations: Record<LangType, ExpensesCopy> = {
  pl,
  uk,
  en,
  ru,
}
