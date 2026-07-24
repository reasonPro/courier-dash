export type LangType = "pl" | "uk" | "en" | "ru";

export const translations = {
  pl: {
    common: { loading: "Ładowanie...", logout: "Wyloguj się 🚪", cancel: "Anuluj", save: "Zapisz", edit: "Edytuj", delete: "Usuń", currency: "zł", km: "km", hrs: "godz" },
    landing: { 
      navLogo: "Courier", 
      navBtn: "Zaloguj się", 
      badge: "Wersja 1.0 jest już dostępna", 
      heroTitle1: "Zarządzaj swoimi zarobkami", 
      heroTitle2: "jak prawdziwy profesjonalista", 
      heroDesc: "Pierwszy pulpit nawigacyjny stworzony specjalnie dla kurierów. Śledź dochody, analizuj statystyki i zarządzaj swoim czasem.", 
      startBtn: "🚀 Rozpocznij za darmo", 
      feat1Title: "Inteligentna analityka", 
      feat1Desc: "System automatycznie oblicza Twoją realną stawkę godzinową oraz stawkę za kilometr z uwzględnieniem napiwków.", 
      feat2Title: "Wirtualny Garaż", 
      feat2Desc: "Dodaj swój skuter, rower lub samochód, aby śledzić przebieg i koszty amortyzacji dla dokładniejszych statystyk.", 
      feat3Title: "Multiplatformowość", 
      feat3Desc: "Połącz zarobki ze wszystkich aplikacji w jednym miejscu. Analizuj, gdzie zarabiasz najwięcej.", 
      footer: "Opracowano dla kurierów." 
    },
    auth: { loginTab: "Zaloguj się", registerTab: "Rejestracja", emailLabel: "Adres E-mail", passwordLabel: "Hasło", nicknameLabel: "Pseudonim", confirmPasswordLabel: "Potwierdź hasło", loginBtn: "Zaloguj się 🚀", registerBtn: "Zarejestruj się ✨", successRegister: "Rejestracja pomyślna!", passwordsNotMatch: "Hasła nie są identyczne!", nicknameTaken: "Ten pseudonim jest już zajęty!" },
    work: {
      title: "📊 Dzień roboczy", editTitle: "✏️ Edycja zmiany", garageBtn: "🏍️ Garaż", taxesBtn: "💸 Podatki",
      brutto: "BRUTTO", netto: "NETTO",
      taxModalTitle: "Ustawienia podatków i prowizji", taxModalDesc: "Wybierz, w jaki sposób rozliczasz się z partnerem. Kwoty będą odliczane automatycznie tylko w te tygodnie/miesiące, w których pracowałeś.",
      taxTypeNone: "Bez podatku", taxTypePercent: "Procent (%)", taxTypeFixedWeek: "Stała kwota / tydzień", taxTypeFixedMonth: "Stała kwota / miesiąc",
      addShiftBtn: "+ Dodaj zmianę roboczą", date: "Data", mileage: "Przebieg (km)", hours: "Godziny",
      calcHoursBtn: "Kalkulator godzin", calcTooltip: "Wpisz czas rozpoczęcia i zakończenia zmiany oraz opcjonalnie przerwy, aby system dokładnie obliczył Twój czas pracy.", shiftStart: "Początek zmiany", shiftEnd: "Koniec zmiany", addBreakBtn: "+ Dodaj przerwę", breakStart: "Początek", breakEnd: "Koniec", calcActionBtn: "Oblicz i wstaw",
      incomePlatforms: "Przychód", platformsLabel: "Platformy", platformSelectionRequired: "Wybierz co najmniej jedną platformę.", otherPlatform: "Inna", otherPlatformName: "Nazwa platformy", otherPlatformPlaceholder: "np. Free Now", otherPlatformNameRequired: "Wpisz nazwę innej platformy.", ordersLabel: "Zamówienia", tipsLabel: "Napiwki", bonusesLabel: "Bonusy", addExtrasBtn: "+ Dodaj napiwki i bonusy", hideExtrasBtn: "- Ukryj napiwki i bonusy", saveShift: "Zapisz zmianę", updateShift: "Aktualizuj zmianę", saving: "Zapisywanie...", statsTitle: "Statystyki", yearReportBtn: "📊 Raport roczny", showBestDay: "🏆 Pokaż najlepszy dzień", hideBestDay: "👇 Ukryj rekord", clickToView: "Kliknij, aby zobaczyć", bestDayTitle: "🔥 Najlepszy dzień", totalMonthTitle: "Całkowite wartości za miesiąc", totalIncome: "Przychód", totalHours: "Suma godzin", totalKm: "Przebieg", totalOrders: "Zamówienia", tipsPercent: "% Napiwków", avgStatsTitle: "Średnie wskaźniki", incomePerDay: "Przychód/Dzień", ratePerHour: "Stawka", rateUnit: "zł/godz", effPerKm: "Efektywność", effUnit: "zł/km", ratePerOrder: "Stawka/Zam", orderUnit: "zł/zam", kmPerDay: "Km/Dzień", hrsPerDay: "Godz/Dzień", ordersPerDay: "Zam/Dzień", toggleTips: "Napiwki", toggleBonuses: "Bonusy", chartTitle: "Wykres aktywności", historyTitle: "Historia zmian", workDays: "Dni robocze:", noRecords: "Brak wpisów", tableDate: "Data", tableIncome: "Przychód", tableBase: "Podstawa", tableHours: "Godz", tableRate: "Zł/Godz", tableKm: "Km", tableEff: "Zł/Km", tableOrders: "Zam", tableTips: "Nap", tableBonuses: "Bon", tableActions: "Akcje", confirmDelete: "Na pewno usunąć?", duplicateError: "⚠️ Masz już zapisaną zmianę na tę datę!", errorPrefix: "Błąd: ", updateError: "Błąd: "
    }
  },
  uk: {
    common: { loading: "Завантаження...", logout: "Вийти 🚪", cancel: "Скасувати", save: "Зберегти", edit: "Редагувати", delete: "Видалити", currency: "зл", km: "км", hrs: "год" },
    landing: { 
      navLogo: "Courier", 
      navBtn: "Увійти", 
      badge: "Версія 1.0 вже доступна", 
      heroTitle1: "Керуй своїм доходом", 
      heroTitle2: "як справжній профі", 
      heroDesc: "Перший дашборд, створений спеціально для кур'єрів. Відстежуй доходи, аналізуй статистику та керуй своїм часом.", 
      startBtn: "🚀 Почати безкоштовно", 
      feat1Title: "Розумна аналітика", 
      feat1Desc: "Система автоматично розраховує твою реальну погодинну ставку та ставку за кілометр з урахуванням чайових.", 
      feat2Title: "Віртуальний Гараж", 
      feat2Desc: "Додай свій скутер, велосипед або авто, щоб відстежувати пробіг та витрати на амортизацію.", 
      feat3Title: "Мультиплатформенність", 
      feat3Desc: "Зводь доходи з усіх додатків в одному місці. Аналізуй, де ти заробляєш найбільше.", 
      footer: "Розроблено для кур'єрів." 
    },
    auth: { loginTab: "Увійти", registerTab: "Реєстрація", emailLabel: "Електронна пошта", passwordLabel: "Пароль", nicknameLabel: "Нікнейм", confirmPasswordLabel: "Підтвердіть пароль", loginBtn: "Увійти 🚀", registerBtn: "Зареєструватися ✨", successRegister: "Реєстрація успішна!", passwordsNotMatch: "Паролі не співпадають!", nicknameTaken: "Нікнейм вже зайнятий!" },
    work: {
      title: "📊 Робоча зміна", editTitle: "✏️ Редагування", garageBtn: "🏍️ Гараж", taxesBtn: "💸 Податки",
      brutto: "БРУТТО", netto: "НЕТТО",
      taxModalTitle: "Управління податками та комісіями", taxModalDesc: "Обери, як саме з тебе списує партнер. Фіксовані суми розбиваються і віднімаються ТІЛЬКИ в ті тижні/місяці, коли ти реально виходив на лінію.",
      taxTypeNone: "Без податку", taxTypePercent: "Відсоток (%)", taxTypeFixedWeek: "Фіксовано / тиждень", taxTypeFixedMonth: "Фіксовано / місяць",
      addShiftBtn: "+ Додати зміну", date: "Дата", mileage: "Пробіг (км)", hours: "Години",
      calcHoursBtn: "Калькулятор годин", calcTooltip: "Вкажіть час початку та кінця зміни, а також перерви (якщо були), щоб система точно вирахувала ваш чистий робочий час.", shiftStart: "Початок зміни", shiftEnd: "Кінець зміни", addBreakBtn: "+ Додати перерву", breakStart: "Початок", breakEnd: "Кінець", calcActionBtn: "Розрахувати",
      incomePlatforms: "Дохід", platformsLabel: "Платформи", platformSelectionRequired: "Виберіть щонайменше одну платформу.", otherPlatform: "Інша", otherPlatformName: "Назва платформи", otherPlatformPlaceholder: "наприклад, Free Now", otherPlatformNameRequired: "Введіть назву іншої платформи.", ordersLabel: "Замовлення", tipsLabel: "Чайові", bonusesLabel: "Бонуси", addExtrasBtn: "+ Додати чайові та бонуси", hideExtrasBtn: "- Сховати чайові та бонуси", saveShift: "Зберегти зміну", updateShift: "Оновити зміну", saving: "Зберігаємо...", statsTitle: "Статистика", yearReportBtn: "📊 Звіт за рік", showBestDay: "🏆 Кращий день", hideBestDay: "👇 Сховати рекорд", clickToView: "Натисни", bestDayTitle: "🔥 Найкращий день", totalMonthTitle: "Загальні значення за місяць", totalIncome: "Дохід", totalHours: "Всього годин", totalKm: "Пробіг", totalOrders: "Замовлення", tipsPercent: "% Чайових", avgStatsTitle: "Середні показники", incomePerDay: "Дохід/День", ratePerHour: "Ставка", rateUnit: "зл/год", effPerKm: "Ефективність", effUnit: "зл/км", ratePerOrder: "Ставка/Зам", orderUnit: "зл/зам", kmPerDay: "Км/День", hrsPerDay: "Годин/День", ordersPerDay: "Зам/День", toggleTips: "Чайові", toggleBonuses: "Бонуси", chartTitle: "Графік активності", historyTitle: "Історія змін", workDays: "Днів:", noRecords: "Записів немає", tableDate: "Дата", tableIncome: "Дохід", tableBase: "Суха ставка", tableHours: "Год", tableRate: "Зл/Год", tableKm: "Км", tableEff: "Зл/Км", tableOrders: "Зам", tableTips: "Чай", tableBonuses: "Бон", tableActions: "Дії", confirmDelete: "Точно видалити?", duplicateError: "⚠️ Зміна на цю дату вже є!", errorPrefix: "Помилка: ", updateError: "Помилка: "
    }
  },
  en: {
    common: { loading: "Loading...", logout: "Logout 🚪", cancel: "Cancel", save: "Save", edit: "Edit", delete: "Delete", currency: "pln", km: "km", hrs: "hrs" },
    landing: { 
      navLogo: "Courier", 
      navBtn: "Sign In", 
      badge: "Version 1.0 is available", 
      heroTitle1: "Manage earnings", 
      heroTitle2: "like a pro", 
      heroDesc: "The first dashboard created specifically for couriers. Track earnings, analyze statistics, and manage your time.", 
      startBtn: "🚀 Get Started", 
      feat1Title: "Smart Analytics", 
      feat1Desc: "The system automatically calculates your real hourly rate and per-kilometer rate including tips.", 
      feat2Title: "Virtual Garage", 
      feat2Desc: "Add your scooter, bike, or car to track mileage and depreciation costs for more accurate statistics.", 
      feat3Title: "Multi-platform", 
      feat3Desc: "Combine earnings from all apps in one place. Analyze where you earn the most.", 
      footer: "Developed for couriers." 
    },
    auth: { loginTab: "Sign In", registerTab: "Sign Up", emailLabel: "Email", passwordLabel: "Password", nicknameLabel: "Nickname", confirmPasswordLabel: "Confirm Password", loginBtn: "Sign In 🚀", registerBtn: "Sign Up ✨", successRegister: "Success!", passwordsNotMatch: "No match!", nicknameTaken: "Taken!" },
    work: {
      title: "📊 Shift", editTitle: "✏️ Edit Shift", garageBtn: "🏍️ Garage", taxesBtn: "💸 Taxes",
      brutto: "GROSS", netto: "NET",
      taxModalTitle: "Tax & Partner Fees", taxModalDesc: "Choose how your partner deducts fees. Fixed amounts are only deducted for weeks/months you actually worked.",
      taxTypeNone: "No tax", taxTypePercent: "Percent (%)", taxTypeFixedWeek: "Fixed / week", taxTypeFixedMonth: "Fixed / month",
      addShiftBtn: "+ Add shift", date: "Date", mileage: "Mileage (km)", hours: "Hours",
      calcHoursBtn: "Hours Calc", calcTooltip: "Enter the start and end times of your shift, plus any breaks, so the system can accurately calculate your net working time.", shiftStart: "Start", shiftEnd: "End", addBreakBtn: "+ Add break", breakStart: "Start", breakEnd: "End", calcActionBtn: "Calculate",
      incomePlatforms: "Income", platformsLabel: "Platforms", platformSelectionRequired: "Select at least one platform.", otherPlatform: "Other", otherPlatformName: "Platform name", otherPlatformPlaceholder: "e.g. Free Now", otherPlatformNameRequired: "Enter the other platform name.", ordersLabel: "Orders", tipsLabel: "Tips", bonusesLabel: "Bonuses", addExtrasBtn: "+ Add tips/bonuses", hideExtrasBtn: "- Hide extras", saveShift: "Save", updateShift: "Update", saving: "Saving...", statsTitle: "Stats", yearReportBtn: "📊 Year Report", showBestDay: "🏆 Show best day", hideBestDay: "👇 Hide best day", clickToView: "View", bestDayTitle: "🔥 Best day", totalMonthTitle: "Total month values", totalIncome: "Total income", totalHours: "Total hours", totalKm: "Total km", totalOrders: "Total orders", tipsPercent: "Tips %", avgStatsTitle: "Averages", incomePerDay: "Inc/Day", ratePerHour: "Rate", rateUnit: "pln/hr", effPerKm: "Efficiency", effUnit: "pln/km", ratePerOrder: "Rate/Ord", orderUnit: "pln/ord", kmPerDay: "Km/Day", hrsPerDay: "Hrs/Day", ordersPerDay: "Ord/Day", toggleTips: "Tips", toggleBonuses: "Bonuses", chartTitle: "Activity", historyTitle: "History", workDays: "Days:", noRecords: "No records", tableDate: "Date", tableIncome: "Income", tableBase: "Base", tableHours: "Hrs", tableRate: "Pln/Hr", tableKm: "Km", tableEff: "Pln/Km", tableOrders: "Ord", tableTips: "Tips", tableBonuses: "Bon", tableActions: "Actions", confirmDelete: "Sure?", duplicateError: "⚠️ Already saved!", errorPrefix: "Error: ", updateError: "Error: "
    }
  },
  ru: {
    common: { loading: "Загрузка...", logout: "Выйти 🚪", cancel: "Отмена", save: "Сохранить", edit: "Ред", delete: "Удалить", currency: "зл", km: "км", hrs: "ч" },
    landing: { 
      navLogo: "Courier", 
      navBtn: "Войти", 
      badge: "Версия 1.0", 
      heroTitle1: "Управляй доходом", 
      heroTitle2: "как профи", 
      heroDesc: "Первый дашборд, созданный специально для курьеров. Отслеживай доходы, анализируй статистику и управляй своим временем.", 
      startBtn: "🚀 Начать", 
      feat1Title: "Умная Аналитика", 
      feat1Desc: "Система автоматически рассчитывает твою реальную почасовую ставку и ставку за километр с учетом чаевых.", 
      feat2Title: "Виртуальный Гараж", 
      feat2Desc: "Добавь свой скутер, велосипед или авто, чтобы отслеживать пробег и затраты на амортизацию для точной статистики.", 
      feat3Title: "Мультиплатформенность", 
      feat3Desc: "Своди доходы со всех приложений в одном месте. Анализируй, где ты зарабатываешь больше всего.", 
      footer: "Создано для курьеров." 
    },
    auth: { loginTab: "Войти", registerTab: "Регистрация", emailLabel: "Email", passwordLabel: "Пароль", nicknameLabel: "Никнейм", confirmPasswordLabel: "Повтор пароля", loginBtn: "Войти 🚀", registerBtn: "Регистрация ✨", successRegister: "Успех!", passwordsNotMatch: "Не совпадают!", nicknameTaken: "Занят!" },
    work: {
      title: "📊 Смена", editTitle: "✏️ Ред. смену", garageBtn: "🏍️ Гараж", taxesBtn: "💸 Налоги",
      brutto: "БРУТТО", netto: "НЕТТО",
      taxModalTitle: "Управление налогами", taxModalDesc: "Выбери способ списания партнера. Фиксированные суммы вычитаются ТОЛЬКО за те недели/месяцы, когда ты выходил на работу.",
      taxTypeNone: "Без налога", taxTypePercent: "Процент (%)", taxTypeFixedWeek: "Фикс / неделя", taxTypeFixedMonth: "Фикс / месяц",
      addShiftBtn: "+ Добавить", date: "Дата", mileage: "Пробег (км)", hours: "Часы",
      calcHoursBtn: "Калькулятор", calcTooltip: "Укажите время начала и конца смены, а также перерывы (если были), чтобы система точно высчитала ваше чистое рабочее время.", shiftStart: "Начало", shiftEnd: "Конец", addBreakBtn: "+ Перерыв", breakStart: "Начало", breakEnd: "Конец", calcActionBtn: "Рассчитать",
      incomePlatforms: "Доход", platformsLabel: "Платформы", platformSelectionRequired: "Выберите хотя бы одну платформу.", otherPlatform: "Другая", otherPlatformName: "Название платформы", otherPlatformPlaceholder: "например, Free Now", otherPlatformNameRequired: "Введите название другой платформы.", ordersLabel: "Заказы", tipsLabel: "Чаевые", bonusesLabel: "Бонусы", addExtrasBtn: "+ Чаевые/Бонусы", hideExtrasBtn: "- Скрыть", saveShift: "Сохранить", updateShift: "Обновить", saving: "Сохранение...", statsTitle: "Статистика", yearReportBtn: "📊 Отчет за год", showBestDay: "🏆 Лучший день", hideBestDay: "👇 Скрыть", clickToView: "Нажми", bestDayTitle: "🔥 Лучший день", totalMonthTitle: "Общие значения", totalIncome: "Доход", totalHours: "Часы", totalKm: "Пробег", totalOrders: "Заказы", tipsPercent: "% Чаевых", avgStatsTitle: "Средние", incomePerDay: "Доход/День", ratePerHour: "Ставка", rateUnit: "зл/час", effPerKm: "Эффект-ть", effUnit: "зл/км", ratePerOrder: "Ставка/Зак", orderUnit: "зл/зак", kmPerDay: "Км/День", hrsPerDay: "Час/День", ordersPerDay: "Зак/День", toggleTips: "Чаевые", toggleBonuses: "Бонусы", chartTitle: "График", historyTitle: "История", workDays: "Дней:", noRecords: "Нет записей", tableDate: "Дата", tableIncome: "Доход", tableBase: "База", tableHours: "Час", tableRate: "Зл/Час", tableKm: "Км", tableEff: "Зл/Км", tableOrders: "Зак", tableTips: "Чае", tableBonuses: "Бон", tableActions: "Действия", confirmDelete: "Удалить?", duplicateError: "⚠️ Смена уже есть!", errorPrefix: "Ошибка: ", updateError: "Ошибка: "
    }
  }
};
