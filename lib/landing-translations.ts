import type { LangType } from "./translations";

type FeatureCard = {
  title: string;
  description: string;
};

type ProductTab = FeatureCard & {
  label: string;
};

export type LandingV2Copy = {
  skipToContent: string;
  nav: {
    ariaLabel: string;
    features: string;
    product: string;
    howItWorks: string;
    faq: string;
    signIn: string;
    language: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    description: string;
    primary: string;
    secondary: string;
    note: string;
    floatingIncome: string;
    floatingEfficiency: string;
  };
  demo: {
    label: string;
    ariaLabel: string;
    period: string;
    income: string;
    hours: string;
    orders: string;
    hourlyRate: string;
    distance: string;
    currency: string;
    hourUnit: string;
    kmUnit: string;
    shiftTrend: string;
    platformMix: string;
    onlineTips: string;
    cashTips: string;
    bonuses: string;
    active: string;
  };
  valueItems: string[];
  features: {
    eyebrow: string;
    title: string;
    description: string;
    cards: FeatureCard[];
  };
  product: {
    eyebrow: string;
    title: string;
    description: string;
    tabListLabel: string;
    tabs: ProductTab[];
    previewLabels: {
      work: string;
      platforms: string;
      annual: string;
      garage: string;
      annualTrend: string;
      odometer: string;
      serviceInterval: string;
      driveBelt: string;
      brakePads: string;
      engineOil: string;
    };
  };
  how: {
    eyebrow: string;
    title: string;
    description: string;
    steps: FeatureCard[];
  };
  platforms: {
    title: string;
    description: string;
    manualNote: string;
    other: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: Array<{ question: string; answer: string }>;
  };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
  footer: {
    ariaLabel: string;
    description: string;
    product: string;
    features: string;
    howItWorks: string;
    faq: string;
    rights: string;
  };
};

export const landingTranslations: Record<LangType, LandingV2Copy> = {
  pl: {
    skipToContent: "Przejdź do treści",
    nav: { ariaLabel: "Nawigacja główna", features: "Możliwości", product: "Produkt", howItWorks: "Jak to działa", faq: "FAQ", signIn: "Zaloguj się", language: "Język" },
    hero: {
      badge: "Twoja zmiana. Twoje liczby. Twoja przewaga.",
      title: "Zamień każdą dostawę w",
      titleAccent: "wyraźny postęp.",
      description: "CourierDash porządkuje przychody, czas, zamówienia i kilometry z każdej platformy — w jednym czytelnym pulpicie dla kuriera.",
      primary: "Zacznij teraz",
      secondary: "Zobacz pulpit",
      note: "Ręczne wprowadzanie danych. Bez łączenia kont platform kurierskich.",
      floatingIncome: "+12,4% w tym miesiącu",
      floatingEfficiency: "63,79 PLN / godz.",
    },
    demo: { label: "Dane demonstracyjne", ariaLabel: "Podgląd pulpitu CourierDash", period: "Lipiec 2026", income: "Przychód", hours: "Godziny", orders: "Zamówienia", hourlyRate: "Na godzinę", distance: "Dystans", currency: "PLN", hourUnit: "godz.", kmUnit: "km", shiftTrend: "Rytm zmian", platformMix: "Podział platform", onlineTips: "Napiwki online", cashTips: "Napiwki gotówką", bonuses: "Bonusy", active: "Aktywny widok" },
    valueItems: ["Wszystkie platformy", "Przychód na godzinę", "Napiwki i bonusy", "Miesiąc i cały rok"],
    features: {
      eyebrow: "Jedna trasa do lepszych decyzji",
      title: "Wszystko, czego potrzebujesz po zmianie",
      description: "Pięć prostych widoków łączy codzienne liczby z długoterminowym obrazem pracy.",
      cards: [
        { title: "Pełny przychód", description: "Platformy, napiwki online i gotówką oraz bonusy pozostają osobno widoczne, ale sumują się w jednym miejscu." },
        { title: "Realna efektywność", description: "Porównuj przychód na godzinę, liczbę zamówień i dystans — nie tylko końcową kwotę." },
        { title: "Elastyczne platformy", description: "Wybieraj aktywne aplikacje, dodawaj własną platformę i zachowuj swój układ pracy." },
        { title: "Raport roczny", description: "Zobacz miesiące, udziały platform i najlepsze wyniki bez przenoszenia danych do osobnych arkuszy." },
        { title: "Garage", description: "Kontroluj przebieg, interwały serwisowe i historię napraw pojazdu używanego do pracy." },
      ],
    },
    product: {
      eyebrow: "Pulpit w ruchu", title: "Jeden produkt, cztery perspektywy", description: "Przełącz widok i zobacz, jak CourierDash prowadzi od pojedynczej zmiany do pełnego obrazu roku.", tabListLabel: "Widoki produktu",
      tabs: [
        { label: "Praca", title: "Miesiąc pod kontrolą", description: "Zmiany, przychody, czas, zamówienia, dystans, napiwki i bonusy w jednym rytmie." },
        { label: "Platformy", title: "Wynik każdej platformy", description: "Porównuj udział Glovo, Uber Eats, Wolt, Bolt Food, Stuart i własnych platform." },
        { label: "Raport roczny", title: "Szerszy kontekst", description: "Obserwuj dynamikę miesięcy, rekordy i udział platform w całym roku." },
        { label: "Garage", title: "Pojazd też pracuje", description: "Śledź przebieg, zużycie zasobów i historię obsługi bez dodatkowych notatek." },
      ],
      previewLabels: { work: "Przegląd miesiąca", platforms: "Udział platform", annual: "Raport roczny", garage: "Stan pojazdu", annualTrend: "Dynamika roku", odometer: "Przebieg", serviceInterval: "Interwał serwisowy", driveBelt: "Pasek napędowy", brakePads: "Klocki hamulcowe", engineOil: "Olej silnikowy" },
    },
    how: {
      eyebrow: "Prosty proces", title: "Od zakończonej zmiany do jasnego wniosku", description: "CourierDash nie pobiera danych z platform. To Ty zapisujesz wynik, a pulpit porządkuje go w czytelny kontekst.",
      steps: [
        { title: "Utwórz konto", description: "Wybierz język i przygotuj własną przestrzeń do śledzenia pracy." },
        { title: "Dodaj zmianę", description: "Wpisz ręcznie platformy, przychód, czas, zamówienia, dystans, napiwki i bonusy." },
        { title: "Porównuj wyniki", description: "Analizuj miesiące, platformy i wydajność, zachowując ciągłość historii." },
      ],
    },
    platforms: { title: "Pracuj po swojemu", description: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart oraz platforma z własną nazwą mogą działać obok siebie.", manualNote: "CourierDash nie jest połączony ani stowarzyszony z platformami dostawczymi. Dane dodajesz ręcznie.", other: "Inna" },
    faq: { eyebrow: "FAQ", title: "Najczęstsze pytania przed pierwszą zmianą", items: [
      { question: "Czym jest CourierDash?", answer: "To responsywny pulpit internetowy dla kurierów dostawczych, którzy chcą zapisywać pracę i rozumieć przychód, czas, zamówienia, dystans oraz efektywność." },
      { question: "Jakie platformy mogę śledzić?", answer: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart oraz dodatkową platformę z własną nazwą." },
      { question: "Czy muszę łączyć konta platform?", answer: "Nie. Dane o zmianie wprowadzasz ręcznie, więc CourierDash nie potrzebuje dostępu do Twoich kont platform kurierskich." },
      { question: "Jakie dane zapisuję?", answer: "Data, czas pracy, dystans, przychody z platform, zamówienia, napiwki online i gotówką oraz bonusy." },
      { question: "Czy mogę pracować na wielu platformach?", answer: "Tak. Wybierasz aktywne platformy i możesz zmieniać ten zestaw razem ze swoim sposobem pracy." },
      { question: "Czy CourierDash działa na telefonie?", answer: "Tak. To responsywna aplikacja internetowa przygotowana do mobilnej przeglądarki; nie deklarujemy tu natywnej aplikacji mobilnej." },
    ] },
    cta: { title: "Twoja praca już tworzy dane. Zacznij z nich korzystać.", description: "Zbuduj czytelny obraz każdej zmiany, platformy i miesiąca.", primary: "Utwórz konto", secondary: "Zaloguj się" },
    footer: { ariaLabel: "Nawigacja w stopce", description: "Czytelny pulpit dla kurierów, którzy chcą lepiej rozumieć własne wyniki.", product: "Produkt", features: "Możliwości", howItWorks: "Jak to działa", faq: "FAQ", rights: "Stworzone dla kurierów dostawczych." },
  },
  uk: {
    skipToContent: "Перейти до вмісту",
    nav: { ariaLabel: "Головна навігація", features: "Можливості", product: "Продукт", howItWorks: "Як це працює", faq: "FAQ", signIn: "Увійти", language: "Мова" },
    hero: { badge: "Твоя зміна. Твої цифри. Твоя перевага.", title: "Перетвори кожну доставку на", titleAccent: "зрозумілий прогрес.", description: "CourierDash упорядковує дохід, час, замовлення й кілометри з кожної платформи — в одному зрозумілому дашборді для кур’єра.", primary: "Почати зараз", secondary: "Переглянути дашборд", note: "Ручне введення даних. Без підключення акаунтів платформ доставки.", floatingIncome: "+12,4% цього місяця", floatingEfficiency: "63,79 PLN / год" },
    demo: { label: "Демонстраційні дані", ariaLabel: "Попередній перегляд дашборда CourierDash", period: "Липень 2026", income: "Дохід", hours: "Години", orders: "Замовлення", hourlyRate: "За годину", distance: "Відстань", currency: "PLN", hourUnit: "год", kmUnit: "км", shiftTrend: "Ритм змін", platformMix: "Розподіл платформ", onlineTips: "Чайові онлайн", cashTips: "Чайові готівкою", bonuses: "Бонуси", active: "Активний вигляд" },
    valueItems: ["Усі платформи", "Дохід за годину", "Чайові й бонуси", "Місяць і весь рік"],
    features: { eyebrow: "Один маршрут до кращих рішень", title: "Усе потрібне після зміни", description: "П’ять простих виглядів поєднують щоденні цифри з довгостроковою картиною роботи.", cards: [
      { title: "Повний дохід", description: "Платформи, онлайн- і готівкові чайові та бонуси видно окремо, але вони складаються в одному місці." },
      { title: "Реальна ефективність", description: "Порівнюй дохід за годину, кількість замовлень і відстань, а не лише підсумкову суму." },
      { title: "Гнучкі платформи", description: "Обирай активні застосунки, додавай власну платформу та зберігай свій робочий набір." },
      { title: "Річний звіт", description: "Переглядай місяці, частки платформ і найкращі результати без перенесення даних в окремі таблиці." },
      { title: "Гараж", description: "Контролюй пробіг, сервісні інтервали та історію ремонтів робочого транспорту." },
    ] },
    product: { eyebrow: "Дашборд у русі", title: "Один продукт, чотири перспективи", description: "Перемикай вигляд і дивись, як CourierDash веде від окремої зміни до повної картини року.", tabListLabel: "Вигляди продукту", tabs: [
      { label: "Робота", title: "Місяць під контролем", description: "Зміни, дохід, час, замовлення, відстань, чайові й бонуси в одному ритмі." },
      { label: "Платформи", title: "Результат кожної платформи", description: "Порівнюй частку Glovo, Uber Eats, Wolt, Bolt Food, Stuart і власних платформ." },
      { label: "Річний звіт", title: "Ширший контекст", description: "Спостерігай динаміку місяців, рекорди та частки платформ за весь рік." },
      { label: "Гараж", title: "Транспорт теж працює", description: "Відстежуй пробіг, використання ресурсів та історію обслуговування без додаткових нотаток." },
    ], previewLabels: { work: "Огляд місяця", platforms: "Частки платформ", annual: "Річний звіт", garage: "Стан транспорту", annualTrend: "Динаміка року", odometer: "Одометр", serviceInterval: "Сервісний інтервал", driveBelt: "Приводний ремінь", brakePads: "Гальмівні колодки", engineOil: "Моторна олива" } },
    how: { eyebrow: "Простий процес", title: "Від завершеної зміни до чіткого висновку", description: "CourierDash не отримує дані з платформ. Ти записуєш результат, а дашборд перетворює його на зрозумілий контекст.", steps: [
      { title: "Створи акаунт", description: "Обери мову та підготуй власний простір для обліку роботи." },
      { title: "Додай зміну", description: "Внеси вручну платформи, дохід, час, замовлення, відстань, чайові й бонуси." },
      { title: "Порівнюй результати", description: "Аналізуй місяці, платформи й ефективність, зберігаючи безперервну історію." },
    ] },
    platforms: { title: "Працюй по-своєму", description: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart і платформа з власною назвою можуть працювати поруч.", manualNote: "CourierDash не підключений і не пов’язаний із платформами доставки. Дані вводяться вручну.", other: "Інша" },
    faq: { eyebrow: "FAQ", title: "Поширені запитання перед першою зміною", items: [
      { question: "Що таке CourierDash?", answer: "Це адаптивний вебдашборд для кур’єрів доставки, які хочуть записувати роботу й розуміти дохід, час, замовлення, відстань та ефективність." },
      { question: "Які платформи можна відстежувати?", answer: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart і додаткову платформу з власною назвою." },
      { question: "Чи треба підключати акаунти платформ?", answer: "Ні. Дані про зміну вводяться вручну, тому CourierDash не потрібен доступ до твоїх акаунтів на платформах доставки." },
      { question: "Які дані я додаю?", answer: "Дату, робочий час, відстань, дохід із платформ, замовлення, онлайн- і готівкові чайові та бонуси." },
      { question: "Чи можна працювати з кількома платформами?", answer: "Так. Ти обираєш активні платформи й можеш змінювати цей набір разом зі своїм способом роботи." },
      { question: "Чи працює CourierDash на телефоні?", answer: "Так. Це адаптивний вебзастосунок для мобільного браузера; тут не заявляється нативний мобільний застосунок." },
    ] },
    cta: { title: "Твоя робота вже створює дані. Почни їх використовувати.", description: "Побудуй зрозумілу картину кожної зміни, платформи й місяця.", primary: "Створити акаунт", secondary: "Увійти" },
    footer: { ariaLabel: "Навігація в підвалі", description: "Зрозумілий дашборд для кур’єрів, які хочуть краще бачити власні показники.", product: "Продукт", features: "Можливості", howItWorks: "Як це працює", faq: "FAQ", rights: "Створено для кур’єрів доставки." },
  },
  en: {
    skipToContent: "Skip to content",
    nav: { ariaLabel: "Main navigation", features: "Features", product: "Product", howItWorks: "How it works", faq: "FAQ", signIn: "Sign in", language: "Language" },
    hero: { badge: "Your shift. Your numbers. Your advantage.", title: "Turn every delivery into", titleAccent: "clear progress.", description: "CourierDash brings earnings, hours, orders, and distance from every platform into one clear workspace built for couriers.", primary: "Get started", secondary: "Explore dashboard", note: "Manual data entry. No delivery-platform account connections.", floatingIncome: "+12.4% this month", floatingEfficiency: "63.79 PLN / hour" },
    demo: { label: "Demo data", ariaLabel: "CourierDash dashboard preview", period: "July 2026", income: "Earnings", hours: "Hours", orders: "Orders", hourlyRate: "Per hour", distance: "Distance", currency: "PLN", hourUnit: "h", kmUnit: "km", shiftTrend: "Shift rhythm", platformMix: "Platform breakdown", onlineTips: "In-app tips", cashTips: "Cash tips", bonuses: "Bonuses", active: "Active view" },
    valueItems: ["Every platform", "Hourly earnings", "Tips and bonuses", "Month and year"],
    features: { eyebrow: "One route to better decisions", title: "Everything you need after a shift", description: "Five focused views connect your daily numbers with the long-term picture of your work.", cards: [
      { title: "Complete earnings", description: "Platform income, in-app and cash tips, and bonuses stay visible separately while adding up in one place." },
      { title: "Real efficiency", description: "Compare hourly earnings, order volume, and distance instead of looking only at the final total." },
      { title: "Flexible platforms", description: "Choose active apps, add a custom platform, and keep a setup that matches the way you work." },
      { title: "Annual Report", description: "Review months, platform shares, and best results without moving data into separate spreadsheets." },
      { title: "Garage", description: "Track mileage, service intervals, and repair history for the vehicle that keeps you moving." },
    ] },
    product: { eyebrow: "A dashboard in motion", title: "One product, four perspectives", description: "Switch the view and see how CourierDash connects a single shift with the wider story of your year.", tabListLabel: "Product views", tabs: [
      { label: "Work", title: "Keep the month in view", description: "Shifts, earnings, time, orders, distance, tips, and bonuses in one working rhythm." },
      { label: "Platforms", title: "See every platform’s result", description: "Compare Glovo, Uber Eats, Wolt, Bolt Food, Stuart, and your own custom platforms." },
      { label: "Annual Report", title: "See the wider context", description: "Follow monthly momentum, records, and platform shares across the whole year." },
      { label: "Garage", title: "Your vehicle works too", description: "Track mileage, resource use, and maintenance history without a separate notebook." },
    ], previewLabels: { work: "Monthly overview", platforms: "Platform share", annual: "Annual Report", garage: "Vehicle status", annualTrend: "Yearly trend", odometer: "Odometer", serviceInterval: "Service interval", driveBelt: "Drive belt", brakePads: "Brake pads", engineOil: "Engine oil" } },
    how: { eyebrow: "A simple process", title: "From a finished shift to a useful decision", description: "CourierDash does not fetch data from delivery platforms. You record the result; the dashboard turns it into clear context.", steps: [
      { title: "Create an account", description: "Choose your language and set up a personal workspace for tracking your work." },
      { title: "Add a shift", description: "Enter platforms, earnings, time, orders, distance, tips, and bonuses manually." },
      { title: "Compare results", description: "Review months, platforms, and efficiency while keeping one continuous history." },
    ] },
    platforms: { title: "Work your way", description: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart, and a platform with your own name can all sit side by side.", manualNote: "CourierDash is not connected to or affiliated with delivery platforms. You enter your data manually.", other: "Other" },
    faq: { eyebrow: "FAQ", title: "Common questions before your first shift entry", items: [
      { question: "What is CourierDash?", answer: "It is a responsive web dashboard for delivery couriers who want to record work and understand earnings, time, orders, distance, and efficiency." },
      { question: "Which platforms can I track?", answer: "You can record Glovo, Uber Eats, Wolt, Bolt Food, Stuart, and an additional platform with your own name." },
      { question: "Do I need to connect platform accounts?", answer: "No. You enter shift data manually, so CourierDash does not need access to your delivery-platform accounts." },
      { question: "What data do I add?", answer: "A shift can include its date, working time, distance, platform earnings, orders, in-app and cash tips, and bonuses." },
      { question: "Can I work with several platforms?", answer: "Yes. You choose active platforms and can adjust that selection as the way you work changes." },
      { question: "Does CourierDash work on a phone?", answer: "Yes. CourierDash is a responsive web app designed for a mobile browser; this page does not claim a native mobile app." },
    ] },
    cta: { title: "Your work already creates data. Start using it.", description: "Build a clear picture of every shift, platform, and month.", primary: "Create account", secondary: "Sign in" },
    footer: { ariaLabel: "Footer navigation", description: "A clear dashboard for couriers who want to understand their own numbers.", product: "Product", features: "Features", howItWorks: "How it works", faq: "FAQ", rights: "Built for delivery couriers." },
  },
  ru: {
    skipToContent: "Перейти к содержимому",
    nav: { ariaLabel: "Главная навигация", features: "Возможности", product: "Продукт", howItWorks: "Как это работает", faq: "FAQ", signIn: "Войти", language: "Язык" },
    hero: { badge: "Твоя смена. Твои цифры. Твоё преимущество.", title: "Преврати каждую доставку в", titleAccent: "понятный прогресс.", description: "CourierDash собирает доход, время, заказы и километры с каждой платформы в одном понятном рабочем пространстве для курьера.", primary: "Начать", secondary: "Посмотреть дашборд", note: "Ручной ввод данных. Без подключения аккаунтов платформ доставки.", floatingIncome: "+12,4% в этом месяце", floatingEfficiency: "63,79 PLN / ч" },
    demo: { label: "Демонстрационные данные", ariaLabel: "Предпросмотр дашборда CourierDash", period: "Июль 2026", income: "Доход", hours: "Часы", orders: "Заказы", hourlyRate: "В час", distance: "Расстояние", currency: "PLN", hourUnit: "ч", kmUnit: "км", shiftTrend: "Ритм смен", platformMix: "Распределение платформ", onlineTips: "Чаевые онлайн", cashTips: "Чаевые наличными", bonuses: "Бонусы", active: "Активный вид" },
    valueItems: ["Все платформы", "Доход в час", "Чаевые и бонусы", "Месяц и весь год"],
    features: { eyebrow: "Один маршрут к лучшим решениям", title: "Всё необходимое после смены", description: "Пять понятных видов связывают ежедневные цифры с долгосрочной картиной работы.", cards: [
      { title: "Полный доход", description: "Доход с платформ, онлайн- и наличные чаевые и бонусы видны отдельно, но складываются в одном месте." },
      { title: "Реальная эффективность", description: "Сравнивай доход в час, количество заказов и расстояние, а не только итоговую сумму." },
      { title: "Гибкие платформы", description: "Выбирай активные приложения, добавляй свою платформу и сохраняй удобный рабочий набор." },
      { title: "Годовой отчёт", description: "Просматривай месяцы, доли платформ и лучшие результаты без переноса данных в отдельные таблицы." },
      { title: "Гараж", description: "Контролируй пробег, сервисные интервалы и историю ремонтов рабочего транспорта." },
    ] },
    product: { eyebrow: "Дашборд в движении", title: "Один продукт, четыре перспективы", description: "Переключай вид и смотри, как CourierDash связывает отдельную смену с полной картиной года.", tabListLabel: "Виды продукта", tabs: [
      { label: "Работа", title: "Месяц под контролем", description: "Смены, доход, время, заказы, расстояние, чаевые и бонусы в одном рабочем ритме." },
      { label: "Платформы", title: "Результат каждой платформы", description: "Сравнивай долю Glovo, Uber Eats, Wolt, Bolt Food, Stuart и собственных платформ." },
      { label: "Годовой отчёт", title: "Более широкий контекст", description: "Отслеживай динамику месяцев, рекорды и доли платформ за весь год." },
      { label: "Гараж", title: "Транспорт тоже работает", description: "Следи за пробегом, использованием ресурсов и историей обслуживания без отдельных записей." },
    ], previewLabels: { work: "Обзор месяца", platforms: "Доли платформ", annual: "Годовой отчёт", garage: "Состояние транспорта", annualTrend: "Динамика года", odometer: "Одометр", serviceInterval: "Сервисный интервал", driveBelt: "Приводной ремень", brakePads: "Тормозные колодки", engineOil: "Моторное масло" } },
    how: { eyebrow: "Простой процесс", title: "От завершённой смены к полезному выводу", description: "CourierDash не получает данные с платформ. Ты записываешь результат, а дашборд превращает его в понятный контекст.", steps: [
      { title: "Создай аккаунт", description: "Выбери язык и подготовь личное пространство для учёта работы." },
      { title: "Добавь смену", description: "Внеси вручную платформы, доход, время, заказы, расстояние, чаевые и бонусы." },
      { title: "Сравнивай результаты", description: "Анализируй месяцы, платформы и эффективность, сохраняя непрерывную историю." },
    ] },
    platforms: { title: "Работай по-своему", description: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart и платформа с собственным названием могут работать рядом.", manualNote: "CourierDash не подключён и не связан с платформами доставки. Данные вводятся вручную.", other: "Другая" },
    faq: { eyebrow: "FAQ", title: "Частые вопросы перед первой записью смены", items: [
      { question: "Что такое CourierDash?", answer: "Это адаптивный веб-дашборд для курьеров доставки, которые хотят записывать работу и понимать доход, время, заказы, расстояние и эффективность." },
      { question: "Какие платформы можно отслеживать?", answer: "Glovo, Uber Eats, Wolt, Bolt Food, Stuart и дополнительную платформу с собственным названием." },
      { question: "Нужно ли подключать аккаунты платформ?", answer: "Нет. Данные о смене вводятся вручную, поэтому CourierDash не нужен доступ к твоим аккаунтам на платформах доставки." },
      { question: "Какие данные я добавляю?", answer: "Дату, рабочее время, расстояние, доход с платформ, заказы, онлайн- и наличные чаевые и бонусы." },
      { question: "Можно работать с несколькими платформами?", answer: "Да. Ты выбираешь активные платформы и можешь менять этот набор вместе со своим способом работы." },
      { question: "CourierDash работает на телефоне?", answer: "Да. Это адаптивное веб-приложение для мобильного браузера; здесь не заявляется нативное мобильное приложение." },
    ] },
    cta: { title: "Твоя работа уже создаёт данные. Начни их использовать.", description: "Собери понятную картину каждой смены, платформы и месяца.", primary: "Создать аккаунт", secondary: "Войти" },
    footer: { ariaLabel: "Навигация в подвале", description: "Понятный дашборд для курьеров, которые хотят лучше видеть собственные показатели.", product: "Продукт", features: "Возможности", howItWorks: "Как это работает", faq: "FAQ", rights: "Создано для курьеров доставки." },
  },
};
