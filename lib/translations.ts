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
    passwordRecovery: {
      forgotLink: "Nie pamiętasz hasła?", forgotTitle: "Odzyskaj hasło", forgotDescription: "Podaj adres e-mail konta CourierDash.", emailLabel: "Adres e-mail", sendButton: "Wyślij link do odzyskiwania", sending: "Wysyłanie...", requestSent: "Jeśli konto z tym adresem istnieje, wysłaliśmy wiadomość z dalszymi instrukcjami.", requestError: "Nie udało się wysłać wiadomości. Spróbuj ponownie później.", rateLimit: "Zbyt wiele próśb. Spróbuj ponownie później.", backToLogin: "Wróć do logowania",
      resetTitle: "Ustaw nowe hasło", resetDescription: "Wprowadź i potwierdź nowe hasło.", passwordRequirement: "Hasło musi mieć co najmniej 6 znaków.", newPasswordLabel: "Nowe hasło", confirmPasswordLabel: "Potwierdź nowe hasło", saveButton: "Zapisz nowe hasło", saving: "Zapisywanie...", checkingLink: "Sprawdzanie linku odzyskiwania...", invalidTitle: "Link jest nieważny lub wygasł", invalidDescription: "Poproś o nowy link do odzyskiwania hasła.", requestNewLink: "Poproś o nowy link", required: "Wypełnij oba pola hasła.", tooShort: "Hasło musi mieć co najmniej 6 znaków.", mismatch: "Hasła nie są identyczne.", resetError: "Nie udało się zmienić hasła. Poproś o nowy link i spróbuj ponownie.", resetSuccess: "Hasło zostało zmienione. Zaloguj się przy użyciu nowego hasła."
    },
    work: {
      title: "📊 Dzień roboczy", editTitle: "✏️ Edycja zmiany", garageBtn: "🏍️ Garaż", taxesBtn: "💸 Podatki",
      brutto: "BRUTTO", netto: "NETTO",
      taxModalTitle: "Ustawienia podatków i prowizji", taxModalDesc: "Wybierz, w jaki sposób rozliczasz się z partnerem. Kwoty będą odliczane automatycznie tylko w te tygodnie/miesiące, w których pracowałeś.",
      taxTypeNone: "Bez podatku", taxTypePercent: "Procent (%)", taxTypeFixedWeek: "Stała kwota / tydzień", taxTypeFixedMonth: "Stała kwota / miesiąc",
      addShiftBtn: "+ Dodaj zmianę roboczą", date: "Data", mileage: "Przebieg (km)", hours: "Godziny",
      calcHoursBtn: "Kalkulator godzin", calcTooltip: "Wpisz czas rozpoczęcia i zakończenia zmiany oraz opcjonalnie przerwy, aby system dokładnie obliczył Twój czas pracy.", shiftStart: "Początek zmiany", shiftEnd: "Koniec zmiany", addBreakBtn: "+ Dodaj przerwę", breakStart: "Początek", breakEnd: "Koniec", calcActionBtn: "Oblicz i wstaw",
      incomePlatforms: "Przychód", platformsLabel: "Platformy", platformSelectionRequired: "Wybierz co najmniej jedną platformę.", otherPlatform: "Inna", otherPlatformName: "Nazwa platformy", otherPlatformPlaceholder: "np. Free Now", otherPlatformNameRequired: "Wpisz nazwę innej platformy.", ordersLabel: "Zamówienia", tipsLabel: "Napiwki", appTipsLabel: "Online", cashTipsLabel: "Gotówką", cashTipsNonNegative: "Napiwki gotówką nie mogą być ujemne.", bonusesLabel: "Bonusy", addExtrasBtn: "+ Dodaj napiwki i bonusy", hideExtrasBtn: "- Ukryj napiwki i bonusy", saveShift: "Zapisz zmianę", updateShift: "Aktualizuj zmianę", saving: "Zapisywanie...", statsTitle: "Statystyki", yearReportBtn: "📊 Raport roczny", showBestDay: "🏆 Pokaż najlepszy dzień", hideBestDay: "👇 Ukryj rekord", clickToView: "Kliknij, aby zobaczyć", bestDayTitle: "🔥 Najlepszy dzień", totalMonthTitle: "Całkowite wartości za miesiąc", totalIncome: "Przychód", totalHours: "Suma godzin", totalKm: "Przebieg", totalOrders: "Zamówienia", tipsPercent: "% Napiwków", avgStatsTitle: "Średnie wskaźniki", incomePerDay: "Przychód/Dzień", ratePerHour: "Stawka", rateUnit: "zł/godz", effPerKm: "Efektywność", effUnit: "zł/km", ratePerOrder: "Stawka/Zam", orderUnit: "zł/zam", kmPerDay: "Km/Dzień", hrsPerDay: "Godz/Dzień", ordersPerDay: "Zam/Dzień", toggleTips: "Napiwki", toggleBonuses: "Bonusy", chartTitle: "Wykres aktywności", historyTitle: "Historia zmian", workDays: "Dni robocze:", noRecords: "Brak wpisów", tableDate: "Data", tableIncome: "Przychód", tableBase: "Podstawa", tableHours: "Godz", tableRate: "Zł/Godz", tableKm: "Km", tableEff: "Zł/Km", tableOrders: "Zam", tableTips: "Nap", tableBonuses: "Bon", tableActions: "Akcje", confirmDelete: "Na pewno usunąć?", duplicateError: "⚠️ Masz już zapisaną zmianę na tę datę!", errorPrefix: "Błąd: ", updateError: "Błąd: "
    },
    yearReport: {
      subtitle: "Analiza platform, napiwków i bonusów", back: "Wróć", yearLabel: "Rok:", recordsTitle: "👑 Najlepsze wyniki i rekordy — {year}", hideRecords: "Ukryj ▲", showRecords: "Pokaż ▼",
      bestMonth: "Najlepszy miesiąc roku", bestDay: "Najlepszy dzień roku", maxDailyTips: "Najwięcej napiwków w ciągu dnia", maxDailyRate: "Najwyższa stawka dzienna", maxMonthlyRate: "Najwyższa stawka miesięczna", maxDailyOrders: "Rekord zamówień w ciągu dnia",
      hourlyRateUnit: "zł/godz", ordersShort: "zam.", annualIncome: "Roczny przychód", avgHourlyRate: "Zł/godz (śr.)", avgPerKm: "Zł/km (śr.)", avgPerOrder: "Zł/zam. (śr.)",
      incomeTrend: "Dynamika przychodu według miesięcy", platformShare: "Udział platform", month: "Miesiąc", totalIncome: "Łączny przychód", orders: "Zamówienia", hours: "Godziny", distance: "Przebieg (km)", ratePerHour: "Zł/godz", ratePerKm: "Zł/km", ratePerOrder: "Zł/zam.",
      workingDays: "Dni pracy: {count}", platformBreakdown: "Podział według platform", platformDetails: "Podstawa: {base} | Napiwki: {tips} | Bonusy: {bonuses}", platformSummary: "Roczne podsumowanie według platform", tipsShare: "{percent}% napiwków", baseRate: "Podstawa:", totalTips: "Łączne napiwki:", totalBonuses: "Łączne bonusy:"
    },
    garage: {
      errorPrefix: "Błąd: ", deleteConfirmation: "Usunąć część? Historia jej wymian pozostanie w statystykach.", checkingAccess: "Sprawdzanie dostępu...", backToWork: "Praca", title: "🏍️ Garaż",
      odometerTitle: "Przebieg pojazdu", odometerHint: "Aktualizuj tę wartość na podstawie licznika pojazdu.", addPart: "+ Dodaj część", addRepair: "🛠 Dodaj naprawę",
      hasReplacementInterval: "Ma określony przebieg ({unit}) do wymiany", name: "Nazwa", resourceLabel: "Interwał wymiany ({unit})", lastReplacementMileage: "Przebieg przy ostatniej wymianie", saveToGarage: "Zapisz w garażu",
      repairName: "Co zostało naprawione?", date: "Data", mileage: "Przebieg", mileageLabel: "Przebieg ({unit})", costLabel: "Koszt ({currency})", addToExpenses: "Dodaj do statystyk wydatków",
      partsStatus: "🛠 Stan części", emptyGarage: "Garaż jest pusty.", statusOk: "W porządku", statusTracking: "Monitorowanie", statusReplace: "WYMIANA!", statusPrepare: "Przygotuj się",
      unlimited: "Bez limitu", resourceValue: "Interwał: {value} {unit}", covered: "Przejechano", remaining: "Pozostało", untilWear: "Do zużycia", drivenValue: "Przejechano: {value}", lastReplacementValue: "Ostatnia: {value}", actualIntervals: "Rzeczywiste interwały:", recordReplacement: "Zarejestruj wymianę",
      statsHistory: "💰 Statystyki i historia", totalSpent: "Łączne wydatki", monthlyAverage: "Średnio", perMonth: "{currency}/mies.", serviceHistory: "Historia serwisowa", allRecords: "Wszystkie wpisy",
      type: "Typ", workPerformed: "Wykonana praca", distanceCoveredLabel: "Przejechano ({unit})", cost: "Koszt", emptyHistory: "Brak wpisów.", routineType: "Serwis", repairType: "Naprawa", selectedTotal: "Suma dla wybranych:",
      replacementTitle: "Wymiana: {name}", replacementDescription: "Wprowadź dane bieżącej wymiany.", replacementDate: "Data wymiany"
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
    passwordRecovery: {
      forgotLink: "Забули пароль?", forgotTitle: "Відновлення пароля", forgotDescription: "Введіть електронну пошту акаунта CourierDash.", emailLabel: "Електронна пошта", sendButton: "Надіслати посилання", sending: "Надсилання...", requestSent: "Якщо акаунт із такою адресою існує, ми надіслали лист із подальшими інструкціями.", requestError: "Не вдалося надіслати лист. Спробуйте пізніше.", rateLimit: "Забагато запитів. Спробуйте пізніше.", backToLogin: "Повернутися до входу",
      resetTitle: "Новий пароль", resetDescription: "Введіть і підтвердьте новий пароль.", passwordRequirement: "Пароль має містити щонайменше 6 символів.", newPasswordLabel: "Новий пароль", confirmPasswordLabel: "Підтвердіть новий пароль", saveButton: "Зберегти новий пароль", saving: "Збереження...", checkingLink: "Перевіряємо посилання для відновлення...", invalidTitle: "Посилання недійсне або застаріле", invalidDescription: "Запросіть нове посилання для відновлення пароля.", requestNewLink: "Запросити нове посилання", required: "Заповніть обидва поля пароля.", tooShort: "Пароль має містити щонайменше 6 символів.", mismatch: "Паролі не збігаються.", resetError: "Не вдалося змінити пароль. Запросіть нове посилання та спробуйте ще раз.", resetSuccess: "Пароль змінено. Увійдіть із новим паролем."
    },
    work: {
      title: "📊 Робоча зміна", editTitle: "✏️ Редагування", garageBtn: "🏍️ Гараж", taxesBtn: "💸 Податки",
      brutto: "БРУТТО", netto: "НЕТТО",
      taxModalTitle: "Управління податками та комісіями", taxModalDesc: "Обери, як саме з тебе списує партнер. Фіксовані суми розбиваються і віднімаються ТІЛЬКИ в ті тижні/місяці, коли ти реально виходив на лінію.",
      taxTypeNone: "Без податку", taxTypePercent: "Відсоток (%)", taxTypeFixedWeek: "Фіксовано / тиждень", taxTypeFixedMonth: "Фіксовано / місяць",
      addShiftBtn: "+ Додати зміну", date: "Дата", mileage: "Пробіг (км)", hours: "Години",
      calcHoursBtn: "Калькулятор годин", calcTooltip: "Вкажіть час початку та кінця зміни, а також перерви (якщо були), щоб система точно вирахувала ваш чистий робочий час.", shiftStart: "Початок зміни", shiftEnd: "Кінець зміни", addBreakBtn: "+ Додати перерву", breakStart: "Початок", breakEnd: "Кінець", calcActionBtn: "Розрахувати",
      incomePlatforms: "Дохід", platformsLabel: "Платформи", platformSelectionRequired: "Виберіть щонайменше одну платформу.", otherPlatform: "Інша", otherPlatformName: "Назва платформи", otherPlatformPlaceholder: "наприклад, Free Now", otherPlatformNameRequired: "Введіть назву іншої платформи.", ordersLabel: "Замовлення", tipsLabel: "Чайові", appTipsLabel: "Онлайн", cashTipsLabel: "Готівкою", cashTipsNonNegative: "Чайові готівкою не можуть бути від’ємними.", bonusesLabel: "Бонуси", addExtrasBtn: "+ Додати чайові та бонуси", hideExtrasBtn: "- Сховати чайові та бонуси", saveShift: "Зберегти зміну", updateShift: "Оновити зміну", saving: "Зберігаємо...", statsTitle: "Статистика", yearReportBtn: "📊 Звіт за рік", showBestDay: "🏆 Кращий день", hideBestDay: "👇 Сховати рекорд", clickToView: "Натисни", bestDayTitle: "🔥 Найкращий день", totalMonthTitle: "Загальні значення за місяць", totalIncome: "Дохід", totalHours: "Всього годин", totalKm: "Пробіг", totalOrders: "Замовлення", tipsPercent: "% Чайових", avgStatsTitle: "Середні показники", incomePerDay: "Дохід/День", ratePerHour: "Ставка", rateUnit: "зл/год", effPerKm: "Ефективність", effUnit: "зл/км", ratePerOrder: "Ставка/Зам", orderUnit: "зл/зам", kmPerDay: "Км/День", hrsPerDay: "Годин/День", ordersPerDay: "Зам/День", toggleTips: "Чайові", toggleBonuses: "Бонуси", chartTitle: "Графік активності", historyTitle: "Історія змін", workDays: "Днів:", noRecords: "Записів немає", tableDate: "Дата", tableIncome: "Дохід", tableBase: "Суха ставка", tableHours: "Год", tableRate: "Зл/Год", tableKm: "Км", tableEff: "Зл/Км", tableOrders: "Зам", tableTips: "Чай", tableBonuses: "Бон", tableActions: "Дії", confirmDelete: "Точно видалити?", duplicateError: "⚠️ Зміна на цю дату вже є!", errorPrefix: "Помилка: ", updateError: "Помилка: "
    },
    yearReport: {
      subtitle: "Аналітика за платформами, чайовими та бонусами", back: "Назад", yearLabel: "Рік:", recordsTitle: "👑 Кращі показники та рекорди за {year} рік", hideRecords: "Сховати ▲", showRecords: "Показати ▼",
      bestMonth: "Кращий місяць року", bestDay: "Кращий день року", maxDailyTips: "Макс. чайових за день", maxDailyRate: "Макс. ставка за день", maxMonthlyRate: "Макс. ставка за місяць", maxDailyOrders: "Рекорд замовлень за день",
      hourlyRateUnit: "зл/год", ordersShort: "зам.", annualIncome: "Річний дохід", avgHourlyRate: "Зл/год (сер.)", avgPerKm: "Зл/км (сер.)", avgPerOrder: "Зл/зам. (сер.)",
      incomeTrend: "Динаміка доходу за місяцями", platformShare: "Частка платформ", month: "Місяць", totalIncome: "Загальний дохід", orders: "Замовлення", hours: "Години", distance: "Пробіг (км)", ratePerHour: "Зл/год", ratePerKm: "Зл/км", ratePerOrder: "Зл/зам.",
      workingDays: "Робочих днів: {count}", platformBreakdown: "Розбивка за платформами", platformDetails: "Ставка: {base} | Чайові: {tips} | Бонуси: {bonuses}", platformSummary: "Річні підсумки за кожною платформою", tipsShare: "{percent}% чайових", baseRate: "Суха ставка:", totalTips: "Усього чайових:", totalBonuses: "Усього бонусів:"
    },
    garage: {
      errorPrefix: "Помилка: ", deleteConfirmation: "Видалити деталь? Історія її замін залишиться у статистиці.", checkingAccess: "Перевірка доступу...", backToWork: "Робота", title: "🏍️ Гараж",
      odometerTitle: "Одометр ТЗ", odometerHint: "Оновлюй цю цифру з приладової панелі.", addPart: "+ Додати деталь", addRepair: "🛠 Внести ремонт",
      hasReplacementInterval: "Має чіткий ресурс ({unit}) до заміни", name: "Назва", resourceLabel: "Ресурс ({unit})", lastReplacementMileage: "Пробіг останньої заміни", saveToGarage: "Зберегти в гараж",
      repairName: "Що ремонтувалося?", date: "Дата", mileage: "Пробіг", mileageLabel: "Пробіг ({unit})", costLabel: "Вартість ({currency})", addToExpenses: "Додати до статистики витрат",
      partsStatus: "🛠 Стан деталей", emptyGarage: "Гараж порожній.", statusOk: "У нормі", statusTracking: "Спостереження", statusReplace: "ЗАМІНА!", statusPrepare: "Готуйся",
      unlimited: "Безлімітна", resourceValue: "Ресурс: {value} {unit}", covered: "Пройдено", remaining: "Залишилось", untilWear: "Працює до зносу", drivenValue: "Пройшло: {value}", lastReplacementValue: "Минула: {value}", actualIntervals: "Фактичні інтервали:", recordReplacement: "Внести заміну",
      statsHistory: "💰 Статистика та історія", totalSpent: "Усього витрачено", monthlyAverage: "У середньому", perMonth: "{currency}/міс", serviceHistory: "Історія обслуговування", allRecords: "Усі записи",
      type: "Тип", workPerformed: "Що робилось", distanceCoveredLabel: "Пройшло ({unit})", cost: "Вартість", emptyHistory: "Записів немає.", routineType: "ТО", repairType: "Ремонт", selectedTotal: "Підсумок за вибраним:",
      replacementTitle: "Заміна: {name}", replacementDescription: "Внеси дані про поточну заміну.", replacementDate: "Дата заміни"
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
    passwordRecovery: {
      forgotLink: "Forgot password?", forgotTitle: "Reset your password", forgotDescription: "Enter the email address for your CourierDash account.", emailLabel: "Email", sendButton: "Send recovery link", sending: "Sending...", requestSent: "If an account with that address exists, we sent an email with the next steps.", requestError: "We could not send the email. Please try again later.", rateLimit: "Too many requests. Please try again later.", backToLogin: "Back to sign in",
      resetTitle: "Set a new password", resetDescription: "Enter and confirm your new password.", passwordRequirement: "Password must be at least 6 characters.", newPasswordLabel: "New password", confirmPasswordLabel: "Confirm new password", saveButton: "Save new password", saving: "Saving...", checkingLink: "Checking the recovery link...", invalidTitle: "This link is invalid or expired", invalidDescription: "Request a new password recovery link.", requestNewLink: "Request a new link", required: "Complete both password fields.", tooShort: "Password must be at least 6 characters.", mismatch: "Passwords do not match.", resetError: "We could not change your password. Request a new link and try again.", resetSuccess: "Your password has been changed. Sign in with your new password."
    },
    work: {
      title: "📊 Shift", editTitle: "✏️ Edit Shift", garageBtn: "🏍️ Garage", taxesBtn: "💸 Taxes",
      brutto: "GROSS", netto: "NET",
      taxModalTitle: "Tax & Partner Fees", taxModalDesc: "Choose how your partner deducts fees. Fixed amounts are only deducted for weeks/months you actually worked.",
      taxTypeNone: "No tax", taxTypePercent: "Percent (%)", taxTypeFixedWeek: "Fixed / week", taxTypeFixedMonth: "Fixed / month",
      addShiftBtn: "+ Add shift", date: "Date", mileage: "Mileage (km)", hours: "Hours",
      calcHoursBtn: "Hours Calc", calcTooltip: "Enter the start and end times of your shift, plus any breaks, so the system can accurately calculate your net working time.", shiftStart: "Start", shiftEnd: "End", addBreakBtn: "+ Add break", breakStart: "Start", breakEnd: "End", calcActionBtn: "Calculate",
      incomePlatforms: "Income", platformsLabel: "Platforms", platformSelectionRequired: "Select at least one platform.", otherPlatform: "Other", otherPlatformName: "Platform name", otherPlatformPlaceholder: "e.g. Free Now", otherPlatformNameRequired: "Enter the other platform name.", ordersLabel: "Orders", tipsLabel: "Tips", appTipsLabel: "In-app", cashTipsLabel: "Cash", cashTipsNonNegative: "Cash tips cannot be negative.", bonusesLabel: "Bonuses", addExtrasBtn: "+ Add tips/bonuses", hideExtrasBtn: "- Hide extras", saveShift: "Save", updateShift: "Update", saving: "Saving...", statsTitle: "Stats", yearReportBtn: "📊 Year Report", showBestDay: "🏆 Show best day", hideBestDay: "👇 Hide best day", clickToView: "View", bestDayTitle: "🔥 Best day", totalMonthTitle: "Total month values", totalIncome: "Total income", totalHours: "Total hours", totalKm: "Total km", totalOrders: "Total orders", tipsPercent: "Tips %", avgStatsTitle: "Averages", incomePerDay: "Inc/Day", ratePerHour: "Rate", rateUnit: "pln/hr", effPerKm: "Efficiency", effUnit: "pln/km", ratePerOrder: "Rate/Ord", orderUnit: "pln/ord", kmPerDay: "Km/Day", hrsPerDay: "Hrs/Day", ordersPerDay: "Ord/Day", toggleTips: "Tips", toggleBonuses: "Bonuses", chartTitle: "Activity", historyTitle: "History", workDays: "Days:", noRecords: "No records", tableDate: "Date", tableIncome: "Income", tableBase: "Base", tableHours: "Hrs", tableRate: "Pln/Hr", tableKm: "Km", tableEff: "Pln/Km", tableOrders: "Ord", tableTips: "Tips", tableBonuses: "Bon", tableActions: "Actions", confirmDelete: "Sure?", duplicateError: "⚠️ Already saved!", errorPrefix: "Error: ", updateError: "Error: "
    },
    yearReport: {
      subtitle: "Analytics by platform, tips, and bonuses", back: "Back", yearLabel: "Year:", recordsTitle: "👑 Best results and records for {year}", hideRecords: "Hide ▲", showRecords: "Show ▼",
      bestMonth: "Best month of the year", bestDay: "Best day of the year", maxDailyTips: "Highest tips in a day", maxDailyRate: "Highest daily rate", maxMonthlyRate: "Highest monthly rate", maxDailyOrders: "Most orders in a day",
      hourlyRateUnit: "PLN/hr", ordersShort: "orders", annualIncome: "Annual income", avgHourlyRate: "PLN/hr (avg.)", avgPerKm: "PLN/km (avg.)", avgPerOrder: "PLN/order (avg.)",
      incomeTrend: "Monthly income trend", platformShare: "Platform share", month: "Month", totalIncome: "Total income", orders: "Orders", hours: "Hours", distance: "Distance (km)", ratePerHour: "PLN/hr", ratePerKm: "PLN/km", ratePerOrder: "PLN/order",
      workingDays: "Working days: {count}", platformBreakdown: "Breakdown by platform", platformDetails: "Base: {base} | Tips: {tips} | Bonuses: {bonuses}", platformSummary: "Annual totals by platform", tipsShare: "{percent}% tips", baseRate: "Base:", totalTips: "Total tips:", totalBonuses: "Total bonuses:"
    },
    garage: {
      errorPrefix: "Error: ", deleteConfirmation: "Delete this part? Its replacement history will remain in the statistics.", checkingAccess: "Checking access...", backToWork: "Work", title: "🏍️ Garage",
      odometerTitle: "Vehicle odometer", odometerHint: "Update this value from the vehicle dashboard.", addPart: "+ Add part", addRepair: "🛠 Add repair",
      hasReplacementInterval: "Has a defined replacement interval ({unit})", name: "Name", resourceLabel: "Replacement interval ({unit})", lastReplacementMileage: "Mileage at last replacement", saveToGarage: "Save to garage",
      repairName: "What was repaired?", date: "Date", mileage: "Mileage", mileageLabel: "Mileage ({unit})", costLabel: "Cost ({currency})", addToExpenses: "Add to expense statistics",
      partsStatus: "🛠 Parts status", emptyGarage: "The garage is empty.", statusOk: "OK", statusTracking: "Monitoring", statusReplace: "REPLACE!", statusPrepare: "Prepare",
      unlimited: "Unlimited", resourceValue: "Interval: {value} {unit}", covered: "Covered", remaining: "Remaining", untilWear: "Runs until worn", drivenValue: "Covered: {value}", lastReplacementValue: "Last: {value}", actualIntervals: "Actual intervals:", recordReplacement: "Record replacement",
      statsHistory: "💰 Statistics and history", totalSpent: "Total spent", monthlyAverage: "Monthly average", perMonth: "{currency}/mo", serviceHistory: "Service history", allRecords: "All records",
      type: "Type", workPerformed: "Work performed", distanceCoveredLabel: "Distance covered ({unit})", cost: "Cost", emptyHistory: "No records.", routineType: "Service", repairType: "Repair", selectedTotal: "Selected total:",
      replacementTitle: "Replacement: {name}", replacementDescription: "Enter the details of this replacement.", replacementDate: "Replacement date"
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
    passwordRecovery: {
      forgotLink: "Забыли пароль?", forgotTitle: "Восстановление пароля", forgotDescription: "Введите электронную почту аккаунта CourierDash.", emailLabel: "Электронная почта", sendButton: "Отправить ссылку", sending: "Отправка...", requestSent: "Если аккаунт с таким адресом существует, мы отправили письмо с дальнейшими инструкциями.", requestError: "Не удалось отправить письмо. Попробуйте позже.", rateLimit: "Слишком много запросов. Попробуйте позже.", backToLogin: "Вернуться ко входу",
      resetTitle: "Новый пароль", resetDescription: "Введите и подтвердите новый пароль.", passwordRequirement: "Пароль должен содержать не менее 6 символов.", newPasswordLabel: "Новый пароль", confirmPasswordLabel: "Подтвердите новый пароль", saveButton: "Сохранить новый пароль", saving: "Сохранение...", checkingLink: "Проверяем ссылку для восстановления...", invalidTitle: "Ссылка недействительна или устарела", invalidDescription: "Запросите новую ссылку для восстановления пароля.", requestNewLink: "Запросить новую ссылку", required: "Заполните оба поля пароля.", tooShort: "Пароль должен содержать не менее 6 символов.", mismatch: "Пароли не совпадают.", resetError: "Не удалось изменить пароль. Запросите новую ссылку и попробуйте снова.", resetSuccess: "Пароль изменён. Войдите с новым паролем."
    },
    work: {
      title: "📊 Смена", editTitle: "✏️ Ред. смену", garageBtn: "🏍️ Гараж", taxesBtn: "💸 Налоги",
      brutto: "БРУТТО", netto: "НЕТТО",
      taxModalTitle: "Управление налогами", taxModalDesc: "Выбери способ списания партнера. Фиксированные суммы вычитаются ТОЛЬКО за те недели/месяцы, когда ты выходил на работу.",
      taxTypeNone: "Без налога", taxTypePercent: "Процент (%)", taxTypeFixedWeek: "Фикс / неделя", taxTypeFixedMonth: "Фикс / месяц",
      addShiftBtn: "+ Добавить", date: "Дата", mileage: "Пробег (км)", hours: "Часы",
      calcHoursBtn: "Калькулятор", calcTooltip: "Укажите время начала и конца смены, а также перерывы (если были), чтобы система точно высчитала ваше чистое рабочее время.", shiftStart: "Начало", shiftEnd: "Конец", addBreakBtn: "+ Перерыв", breakStart: "Начало", breakEnd: "Конец", calcActionBtn: "Рассчитать",
      incomePlatforms: "Доход", platformsLabel: "Платформы", platformSelectionRequired: "Выберите хотя бы одну платформу.", otherPlatform: "Другая", otherPlatformName: "Название платформы", otherPlatformPlaceholder: "например, Free Now", otherPlatformNameRequired: "Введите название другой платформы.", ordersLabel: "Заказы", tipsLabel: "Чаевые", appTipsLabel: "Онлайн", cashTipsLabel: "Наличными", cashTipsNonNegative: "Чаевые наличными не могут быть отрицательными.", bonusesLabel: "Бонусы", addExtrasBtn: "+ Чаевые/Бонусы", hideExtrasBtn: "- Скрыть", saveShift: "Сохранить", updateShift: "Обновить", saving: "Сохранение...", statsTitle: "Статистика", yearReportBtn: "📊 Отчет за год", showBestDay: "🏆 Лучший день", hideBestDay: "👇 Скрыть", clickToView: "Нажми", bestDayTitle: "🔥 Лучший день", totalMonthTitle: "Общие значения", totalIncome: "Доход", totalHours: "Часы", totalKm: "Пробег", totalOrders: "Заказы", tipsPercent: "% Чаевых", avgStatsTitle: "Средние", incomePerDay: "Доход/День", ratePerHour: "Ставка", rateUnit: "зл/час", effPerKm: "Эффект-ть", effUnit: "зл/км", ratePerOrder: "Ставка/Зак", orderUnit: "зл/зак", kmPerDay: "Км/День", hrsPerDay: "Час/День", ordersPerDay: "Зак/День", toggleTips: "Чаевые", toggleBonuses: "Бонусы", chartTitle: "График", historyTitle: "История", workDays: "Дней:", noRecords: "Нет записей", tableDate: "Дата", tableIncome: "Доход", tableBase: "База", tableHours: "Час", tableRate: "Зл/Час", tableKm: "Км", tableEff: "Зл/Км", tableOrders: "Зак", tableTips: "Чае", tableBonuses: "Бон", tableActions: "Действия", confirmDelete: "Удалить?", duplicateError: "⚠️ Смена уже есть!", errorPrefix: "Ошибка: ", updateError: "Ошибка: "
    },
    yearReport: {
      subtitle: "Аналитика по платформам, чаевым и бонусам", back: "Назад", yearLabel: "Год:", recordsTitle: "👑 Лучшие показатели и рекорды за {year} год", hideRecords: "Скрыть ▲", showRecords: "Показать ▼",
      bestMonth: "Лучший месяц года", bestDay: "Лучший день года", maxDailyTips: "Макс. чаевых за день", maxDailyRate: "Макс. ставка за день", maxMonthlyRate: "Макс. ставка за месяц", maxDailyOrders: "Рекорд заказов за день",
      hourlyRateUnit: "зл/час", ordersShort: "зак.", annualIncome: "Годовой доход", avgHourlyRate: "Зл/час (ср.)", avgPerKm: "Зл/км (ср.)", avgPerOrder: "Зл/зак. (ср.)",
      incomeTrend: "Динамика дохода по месяцам", platformShare: "Доля платформ", month: "Месяц", totalIncome: "Общий доход", orders: "Заказы", hours: "Часы", distance: "Пробег (км)", ratePerHour: "Зл/час", ratePerKm: "Зл/км", ratePerOrder: "Зл/зак.",
      workingDays: "Рабочих дней: {count}", platformBreakdown: "Разбивка по платформам", platformDetails: "Ставка: {base} | Чаевые: {tips} | Бонусы: {bonuses}", platformSummary: "Годовые итоги по каждой платформе", tipsShare: "{percent}% чаевых", baseRate: "Ставка:", totalTips: "Всего чаевых:", totalBonuses: "Всего бонусов:"
    },
    garage: {
      errorPrefix: "Ошибка: ", deleteConfirmation: "Удалить деталь? История её замен останется в статистике.", checkingAccess: "Проверка доступа...", backToWork: "Работа", title: "🏍️ Гараж",
      odometerTitle: "Одометр ТС", odometerHint: "Обновляй это значение с приборной панели.", addPart: "+ Добавить деталь", addRepair: "🛠 Внести ремонт",
      hasReplacementInterval: "Имеет точный ресурс ({unit}) до замены", name: "Название", resourceLabel: "Ресурс ({unit})", lastReplacementMileage: "Пробег последней замены", saveToGarage: "Сохранить в гараж",
      repairName: "Что ремонтировалось?", date: "Дата", mileage: "Пробег", mileageLabel: "Пробег ({unit})", costLabel: "Стоимость ({currency})", addToExpenses: "Добавить в статистику расходов",
      partsStatus: "🛠 Состояние деталей", emptyGarage: "Гараж пуст.", statusOk: "В норме", statusTracking: "Наблюдение", statusReplace: "ЗАМЕНА!", statusPrepare: "Готовься",
      unlimited: "Без лимита", resourceValue: "Ресурс: {value} {unit}", covered: "Пройдено", remaining: "Осталось", untilWear: "Работает до износа", drivenValue: "Пройдено: {value}", lastReplacementValue: "Последняя: {value}", actualIntervals: "Фактические интервалы:", recordReplacement: "Внести замену",
      statsHistory: "💰 Статистика и история", totalSpent: "Всего потрачено", monthlyAverage: "В среднем", perMonth: "{currency}/мес", serviceHistory: "История обслуживания", allRecords: "Все записи",
      type: "Тип", workPerformed: "Что сделано", distanceCoveredLabel: "Пройдено ({unit})", cost: "Стоимость", emptyHistory: "Записей нет.", routineType: "ТО", repairType: "Ремонт", selectedTotal: "Итого по выбранному:",
      replacementTitle: "Замена: {name}", replacementDescription: "Внеси данные о текущей замене.", replacementDate: "Дата замены"
    }
  }
};
