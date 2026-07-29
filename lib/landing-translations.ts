import type { LangType } from "./translations";

const en = {
  skipToContent: "Skip to main content",
  nav: {
    ariaLabel: "Landing navigation",
    features: "Features",
    product: "Product",
    howItWorks: "How it works",
    faq: "FAQ",
    signIn: "Sign in",
    language: "Language",
  },
  hero: {
    badge: "Built for delivery couriers",
    title: "Know what you earn.",
    titleAccent: "Improve every shift.",
    description:
      "Track earnings, hours, orders, distance and performance across every delivery platform in one focused workspace.",
    primary: "Get started",
    secondary: "See how it works",
    platformsNote:
      "Record shifts from Glovo, Uber Eats, Wolt, Bolt Food, Stuart and other platforms — manually, on your terms.",
  },
  demo: {
    label: "Demo dashboard",
    ariaLabel: "CourierDash demo dashboard with sample courier performance data",
    period: "This month",
    income: "Total income",
    hours: "Hours",
    orders: "Orders",
    hourlyRate: "Per hour",
    distance: "Distance",
    trend: "Shift performance",
    currency: "PLN",
    hourUnit: "h",
    kmUnit: "km",
  },
  features: {
    eyebrow: "Everything in view",
    title: "The numbers behind every shift",
    description:
      "A clear workflow for couriers who work across one or several delivery platforms.",
    cards: [
      {
        title: "Track every earning",
        description:
          "Keep platform income, in-app tips, cash tips and bonuses together without losing the platform breakdown.",
      },
      {
        title: "Measure performance",
        description:
          "See working hours, orders, distance and earnings per hour so each shift has useful context.",
      },
      {
        title: "See the bigger picture",
        description:
          "Review monthly statistics, Annual Report summaries, platform breakdowns and personal records.",
      },
    ],
  },
  product: {
    eyebrow: "Inside CourierDash",
    title: "One command center for your courier work",
    description:
      "Move from daily entries to long-term context without switching between separate spreadsheets.",
    stories: [
      {
        title: "Work Dashboard",
        description:
          "Add shifts manually and review income, hours, orders, distance, tips and bonuses in one monthly view.",
        tag: "Daily control",
      },
      {
        title: "Platform breakdown",
        description:
          "Keep Glovo, Uber Eats, Wolt, Bolt Food, Stuart and your own platform entries clearly separated.",
        tag: "Multiple platforms",
      },
      {
        title: "Annual Report",
        description:
          "Understand yearly totals, month-by-month performance, platform shares and your strongest results.",
        tag: "Yearly context",
      },
      {
        title: "Garage",
        description:
          "Track odometer readings, service intervals, repairs and maintenance history for your vehicle.",
        tag: "Vehicle care",
      },
    ],
    previewLabels: {
      work: "Monthly overview",
      platforms: "Platform mix",
      annual: "Annual trend",
      garage: "Vehicle status",
      active: "Active view",
      odometer: "Odometer",
      serviceInterval: "Service interval",
      driveBelt: "Drive belt",
      brakePads: "Brake pads",
      engineOil: "Engine oil",
    },
  },
  how: {
    eyebrow: "How it works",
    title: "From a completed shift to a useful insight",
    steps: [
      {
        title: "Create your account",
        description: "Set up your courier workspace and choose the language you prefer.",
      },
      {
        title: "Add shifts manually",
        description:
          "Enter the platforms, income, hours, orders, distance, tips and bonuses that apply.",
      },
      {
        title: "Understand your statistics",
        description:
          "Compare results over time and see which shifts and platforms work best for you.",
      },
    ],
  },
  platforms: {
    eyebrow: "Flexible by design",
    title: "Your platforms, together",
    description:
      "CourierDash keeps your manually entered results organized without implying a connection to platform accounts.",
    other: "Other",
  },
  benefits: {
    eyebrow: "Built for clarity",
    title: "Less guessing after the shift",
    items: [
      "Income from every active platform in one place",
      "A clear way to compare platform results",
      "Working time and earnings per hour in context",
      "Monthly and yearly statistics without fragmented files",
      "A continuous history instead of a new spreadsheet every period",
      "A responsive workspace available in your mobile browser",
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions before your first shift entry",
    items: [
      {
        question: "What is CourierDash?",
        answer:
          "CourierDash is a web dashboard for delivery couriers who want to record work and understand earnings, time, orders, distance and performance.",
      },
      {
        question: "Which platforms can I track?",
        answer:
          "You can record Glovo, Uber Eats, Wolt, Bolt Food, Stuart and an additional platform with your own name.",
      },
      {
        question: "Do I need to connect my platform accounts?",
        answer:
          "No. You add shift information manually, so CourierDash does not need access to your delivery-platform accounts.",
      },
      {
        question: "What data do I add?",
        answer:
          "A shift can include date, working hours, distance, platform income, orders, in-app and cash tips, and bonuses.",
      },
      {
        question: "Can I work with several platforms?",
        answer:
          "Yes. You choose the active platforms for your workflow and can update that selection when your work changes.",
      },
      {
        question: "Does CourierDash work on a phone?",
        answer:
          "Yes. CourierDash is a responsive web app that works in a mobile browser. A native mobile app is not being claimed here.",
      },
    ],
  },
  cta: {
    title: "Stop guessing. Start understanding your work.",
    description:
      "Build a reliable picture of every shift, every platform and every month.",
    primary: "Create account",
    secondary: "Sign in",
  },
  footer: {
    ariaLabel: "Footer navigation",
    description:
      "A focused dashboard for delivery couriers who want clearer work statistics.",
    product: "Product",
    features: "Features",
    howItWorks: "How it works",
    faq: "FAQ",
    rights: "Built for delivery couriers.",
  },
} as const;

type WidenCopy<Value> = Value extends string
  ? string
  : Value extends readonly (infer Item)[]
    ? readonly WidenCopy<Item>[]
    : Value extends object
      ? { [Key in keyof Value]: WidenCopy<Value[Key]> }
      : Value;

export type LandingV1Copy = WidenCopy<typeof en>;

export const landingTranslations = {
  en,
  pl: {
    skipToContent: "Przejdź do głównej treści",
    nav: { ariaLabel: "Nawigacja strony głównej", features: "Funkcje", product: "Produkt", howItWorks: "Jak to działa", faq: "FAQ", signIn: "Zaloguj się", language: "Język" },
    hero: {
      badge: "Stworzone dla kurierów dostawczych",
      title: "Wiedz, ile zarabiasz.",
      titleAccent: "Ulepszaj każdą zmianę.",
      description: "Śledź zarobki, godziny, zamówienia, dystans i efektywność ze wszystkich platform dostawczych w jednym przejrzystym miejscu.",
      primary: "Rozpocznij",
      secondary: "Zobacz, jak to działa",
      platformsNote: "Zapisuj zmiany z Glovo, Uber Eats, Wolt, Bolt Food, Stuart i innych platform — ręcznie i na własnych zasadach.",
    },
    demo: { label: "Dashboard demonstracyjny", ariaLabel: "Demonstracyjny dashboard CourierDash z przykładowymi wynikami kuriera", period: "Ten miesiąc", income: "Łączny przychód", hours: "Godziny", orders: "Zamówienia", hourlyRate: "Na godzinę", distance: "Dystans", trend: "Efektywność zmian", currency: "PLN", hourUnit: "godz.", kmUnit: "km" },
    features: {
      eyebrow: "Wszystko w zasięgu wzroku", title: "Liczby stojące za każdą zmianą", description: "Przejrzysty sposób pracy dla kurierów korzystających z jednej lub wielu platform.",
      cards: [
        { title: "Zapisuj każdy zarobek", description: "Trzymaj przychód z platform, napiwki online i gotówkowe oraz bonusy razem, zachowując podział na platformy." },
        { title: "Mierz efektywność", description: "Sprawdzaj czas pracy, zamówienia, dystans i zarobek na godzinę, aby każda zmiana miała właściwy kontekst." },
        { title: "Zobacz szerszy obraz", description: "Analizuj statystyki miesięczne, podsumowania Annual Report, podział platform i własne rekordy." },
      ],
    },
    product: {
      eyebrow: "Wewnątrz CourierDash", title: "Jedno centrum dowodzenia dla pracy kuriera", description: "Przechodź od codziennych wpisów do długoterminowego obrazu bez oddzielnych arkuszy.",
      stories: [
        { title: "Dashboard pracy", description: "Dodawaj zmiany ręcznie i przeglądaj przychód, godziny, zamówienia, dystans, napiwki i bonusy w widoku miesiąca.", tag: "Codzienna kontrola" },
        { title: "Podział na platformy", description: "Zachowaj osobne wyniki Glovo, Uber Eats, Wolt, Bolt Food, Stuart i własnych platform.", tag: "Wiele platform" },
        { title: "Annual Report", description: "Poznaj roczne sumy, wyniki miesiąc po miesiącu, udział platform i najmocniejsze rezultaty.", tag: "Kontekst roczny" },
        { title: "Garaż", description: "Śledź licznik, interwały serwisowe, naprawy i historię obsługi swojego pojazdu.", tag: "Dbanie o pojazd" },
      ],
      previewLabels: { work: "Podsumowanie miesiąca", platforms: "Udział platform", annual: "Trend roczny", garage: "Stan pojazdu", active: "Aktywny widok", odometer: "Licznik", serviceInterval: "Interwał serwisowy", driveBelt: "Pasek napędowy", brakePads: "Klocki hamulcowe", engineOil: "Olej silnikowy" },
    },
    how: {
      eyebrow: "Jak to działa", title: "Od zakończonej zmiany do użytecznej informacji",
      steps: [
        { title: "Utwórz konto", description: "Skonfiguruj przestrzeń kuriera i wybierz preferowany język." },
        { title: "Dodawaj zmiany ręcznie", description: "Wpisuj właściwe platformy, przychód, godziny, zamówienia, dystans, napiwki i bonusy." },
        { title: "Rozumiej statystyki", description: "Porównuj wyniki w czasie i sprawdzaj, które zmiany oraz platformy działają dla Ciebie najlepiej." },
      ],
    },
    platforms: { eyebrow: "Elastyczność w standardzie", title: "Twoje platformy razem", description: "CourierDash porządkuje wyniki wpisywane ręcznie i nie sugeruje połączenia z kontami platform.", other: "Inna" },
    benefits: { eyebrow: "Stworzone dla przejrzystości", title: "Mniej zgadywania po zmianie", items: ["Przychód z każdej aktywnej platformy w jednym miejscu", "Przejrzyste porównanie wyników platform", "Czas pracy i zarobek na godzinę w kontekście", "Statystyki miesięczne i roczne bez rozproszonych plików", "Ciągła historia zamiast nowego arkusza na każdy okres", "Responsywne środowisko dostępne w przeglądarce telefonu"] },
    faq: {
      eyebrow: "FAQ", title: "Pytania przed pierwszym wpisem zmiany",
      items: [
        { question: "Czym jest CourierDash?", answer: "CourierDash to webowy dashboard dla kurierów dostawczych, którzy chcą zapisywać pracę i rozumieć zarobki, czas, zamówienia, dystans oraz efektywność." },
        { question: "Które platformy mogę śledzić?", answer: "Możesz zapisywać Glovo, Uber Eats, Wolt, Bolt Food, Stuart oraz dodatkową platformę z własną nazwą." },
        { question: "Czy muszę łączyć konta platform?", answer: "Nie. Informacje o zmianach dodajesz ręcznie, więc CourierDash nie potrzebuje dostępu do Twoich kont na platformach dostawczych." },
        { question: "Jakie dane dodaję?", answer: "Zmiana może zawierać datę, czas pracy, dystans, przychód z platform, zamówienia, napiwki online i gotówkowe oraz bonusy." },
        { question: "Czy mogę pracować z kilkoma platformami?", answer: "Tak. Wybierasz aktywne platformy i możesz zmieniać ten wybór wraz ze zmianą sposobu pracy." },
        { question: "Czy CourierDash działa na telefonie?", answer: "Tak. CourierDash to responsywna aplikacja webowa działająca w przeglądarce telefonu. Nie deklarujemy tu natywnej aplikacji mobilnej." },
      ],
    },
    cta: { title: "Przestań zgadywać. Zacznij rozumieć swoją pracę.", description: "Zbuduj wiarygodny obraz każdej zmiany, każdej platformy i każdego miesiąca.", primary: "Utwórz konto", secondary: "Zaloguj się" },
    footer: { ariaLabel: "Nawigacja w stopce", description: "Przejrzysty dashboard dla kurierów, którzy chcą lepiej rozumieć swoje wyniki.", product: "Produkt", features: "Funkcje", howItWorks: "Jak to działa", faq: "FAQ", rights: "Stworzone dla kurierów dostawczych." },
  },
  uk: {
    skipToContent: "Перейти до основного вмісту",
    nav: { ariaLabel: "Навігація головної сторінки", features: "Можливості", product: "Продукт", howItWorks: "Як це працює", faq: "FAQ", signIn: "Увійти", language: "Мова" },
    hero: {
      badge: "Створено для кур'єрів доставки", title: "Знай, скільки заробляєш.", titleAccent: "Покращуй кожну зміну.",
      description: "Відстежуй дохід, години, замовлення, відстань та ефективність з усіх платформ доставки в одному зосередженому просторі.",
      primary: "Почати", secondary: "Подивитися, як це працює", platformsNote: "Записуй зміни з Glovo, Uber Eats, Wolt, Bolt Food, Stuart та інших платформ — вручну й на власних умовах.",
    },
    demo: { label: "Демонстраційний дашборд", ariaLabel: "Демонстраційний дашборд CourierDash із прикладом показників кур'єра", period: "Цей місяць", income: "Загальний дохід", hours: "Години", orders: "Замовлення", hourlyRate: "За годину", distance: "Відстань", trend: "Ефективність змін", currency: "PLN", hourUnit: "год", kmUnit: "км" },
    features: {
      eyebrow: "Усе перед очима", title: "Цифри за кожною зміною", description: "Зрозумілий робочий процес для кур'єрів однієї або кількох платформ.",
      cards: [
        { title: "Фіксуй кожен заробіток", description: "Тримай дохід з платформ, онлайн- і готівкові чайові та бонуси разом, не втрачаючи розбивку за платформами." },
        { title: "Вимірюй ефективність", description: "Переглядай години роботи, замовлення, відстань і дохід за годину, щоб розуміти контекст кожної зміни." },
        { title: "Бач ширшу картину", description: "Аналізуй місячну статистику, підсумки Annual Report, розбивку за платформами й особисті рекорди." },
      ],
    },
    product: {
      eyebrow: "Усередині CourierDash", title: "Єдиний командний центр роботи кур'єра", description: "Переходь від щоденних записів до довгострокового контексту без окремих таблиць.",
      stories: [
        { title: "Робочий дашборд", description: "Додавай зміни вручну й переглядай дохід, години, замовлення, відстань, чайові та бонуси в місячному огляді.", tag: "Щоденний контроль" },
        { title: "Розбивка за платформами", description: "Зберігай результати Glovo, Uber Eats, Wolt, Bolt Food, Stuart та власних платформ окремо.", tag: "Кілька платформ" },
        { title: "Annual Report", description: "Розумій річні підсумки, динаміку за місяцями, частки платформ і найсильніші результати.", tag: "Річний контекст" },
        { title: "Гараж", description: "Відстежуй одометр, сервісні інтервали, ремонти й історію обслуговування транспорту.", tag: "Догляд за транспортом" },
      ],
      previewLabels: { work: "Огляд місяця", platforms: "Частки платформ", annual: "Річна динаміка", garage: "Стан транспорту", active: "Активний вигляд", odometer: "Одометр", serviceInterval: "Сервісний інтервал", driveBelt: "Привідний ремінь", brakePads: "Гальмівні колодки", engineOil: "Моторна олива" },
    },
    how: {
      eyebrow: "Як це працює", title: "Від завершеної зміни до корисного висновку",
      steps: [
        { title: "Створи акаунт", description: "Налаштуй робочий простір кур'єра та вибери зручну мову." },
        { title: "Додавай зміни вручну", description: "Внось платформи, дохід, години, замовлення, відстань, чайові та бонуси." },
        { title: "Розумій статистику", description: "Порівнюй результати в часі й бач, які зміни та платформи працюють для тебе найкраще." },
      ],
    },
    platforms: { eyebrow: "Гнучкість за задумом", title: "Твої платформи разом", description: "CourierDash упорядковує внесені вручну результати й не передбачає підключення до акаунтів платформ.", other: "Інша" },
    benefits: { eyebrow: "Створено для ясності", title: "Менше здогадок після зміни", items: ["Дохід з усіх активних платформ в одному місці", "Зрозуміле порівняння результатів платформ", "Робочий час і дохід за годину в контексті", "Місячна й річна статистика без розрізнених файлів", "Безперервна історія замість нової таблиці на кожен період", "Адаптивний простір у мобільному браузері"] },
    faq: {
      eyebrow: "FAQ", title: "Запитання перед першим записом зміни",
      items: [
        { question: "Що таке CourierDash?", answer: "CourierDash — це вебдашборд для кур'єрів доставки, які хочуть фіксувати роботу й розуміти дохід, час, замовлення, відстань та ефективність." },
        { question: "Які платформи можна відстежувати?", answer: "Можна записувати Glovo, Uber Eats, Wolt, Bolt Food, Stuart і додаткову платформу з власною назвою." },
        { question: "Чи потрібно підключати акаунти платформ?", answer: "Ні. Дані про зміни додаються вручну, тому CourierDash не потребує доступу до твоїх акаунтів на платформах доставки." },
        { question: "Які дані я додаю?", answer: "Зміна може містити дату, години роботи, відстань, дохід з платформ, замовлення, онлайн- і готівкові чайові та бонуси." },
        { question: "Чи можна працювати з кількома платформами?", answer: "Так. Ти вибираєш активні платформи й можеш змінювати вибір разом зі своїм способом роботи." },
        { question: "Чи працює CourierDash на телефоні?", answer: "Так. CourierDash — адаптивний вебзастосунок, що працює в мобільному браузері. Тут не заявляється про нативний мобільний застосунок." },
      ],
    },
    cta: { title: "Досить здогадуватися. Почни розуміти свою роботу.", description: "Склади надійну картину кожної зміни, кожної платформи й кожного місяця.", primary: "Створити акаунт", secondary: "Увійти" },
    footer: { ariaLabel: "Навігація у футері", description: "Зосереджений дашборд для кур'єрів, які хочуть краще розуміти свої показники.", product: "Продукт", features: "Можливості", howItWorks: "Як це працює", faq: "FAQ", rights: "Створено для кур'єрів доставки." },
  },
  ru: {
    skipToContent: "Перейти к основному содержанию",
    nav: { ariaLabel: "Навигация главной страницы", features: "Возможности", product: "Продукт", howItWorks: "Как это работает", faq: "FAQ", signIn: "Войти", language: "Язык" },
    hero: {
      badge: "Создано для курьеров доставки", title: "Знай, сколько зарабатываешь.", titleAccent: "Улучшай каждую смену.",
      description: "Отслеживай доход, часы, заказы, расстояние и эффективность со всех платформ доставки в одном удобном пространстве.",
      primary: "Начать", secondary: "Посмотреть, как это работает", platformsNote: "Записывай смены из Glovo, Uber Eats, Wolt, Bolt Food, Stuart и других платформ — вручную и на своих условиях.",
    },
    demo: { label: "Демонстрационный дашборд", ariaLabel: "Демонстрационный дашборд CourierDash с примером показателей курьера", period: "Этот месяц", income: "Общий доход", hours: "Часы", orders: "Заказы", hourlyRate: "В час", distance: "Расстояние", trend: "Эффективность смен", currency: "PLN", hourUnit: "ч", kmUnit: "км" },
    features: {
      eyebrow: "Всё перед глазами", title: "Цифры за каждой сменой", description: "Понятный рабочий процесс для курьеров одной или нескольких платформ.",
      cards: [
        { title: "Учитывай каждый заработок", description: "Храни доход с платформ, онлайн- и наличные чаевые, а также бонусы вместе, сохраняя разбивку по платформам." },
        { title: "Измеряй эффективность", description: "Смотри часы работы, заказы, расстояние и доход в час, чтобы понимать контекст каждой смены." },
        { title: "Видь общую картину", description: "Анализируй месячную статистику, итоги Annual Report, разбивку по платформам и личные рекорды." },
      ],
    },
    product: {
      eyebrow: "Внутри CourierDash", title: "Единый командный центр работы курьера", description: "Переходи от ежедневных записей к долгосрочному контексту без отдельных таблиц.",
      stories: [
        { title: "Рабочий дашборд", description: "Добавляй смены вручную и смотри доход, часы, заказы, расстояние, чаевые и бонусы в месячном обзоре.", tag: "Ежедневный контроль" },
        { title: "Разбивка по платформам", description: "Храни результаты Glovo, Uber Eats, Wolt, Bolt Food, Stuart и собственных платформ отдельно.", tag: "Несколько платформ" },
        { title: "Annual Report", description: "Понимай годовые итоги, динамику по месяцам, доли платформ и лучшие результаты.", tag: "Годовой контекст" },
        { title: "Гараж", description: "Отслеживай одометр, сервисные интервалы, ремонты и историю обслуживания транспорта.", tag: "Уход за транспортом" },
      ],
      previewLabels: { work: "Обзор месяца", platforms: "Доли платформ", annual: "Годовая динамика", garage: "Состояние транспорта", active: "Активный вид", odometer: "Одометр", serviceInterval: "Сервисный интервал", driveBelt: "Приводной ремень", brakePads: "Тормозные колодки", engineOil: "Моторное масло" },
    },
    how: {
      eyebrow: "Как это работает", title: "От завершённой смены к полезному выводу",
      steps: [
        { title: "Создай аккаунт", description: "Настрой пространство курьера и выбери удобный язык." },
        { title: "Добавляй смены вручную", description: "Вноси платформы, доход, часы, заказы, расстояние, чаевые и бонусы." },
        { title: "Понимай статистику", description: "Сравнивай результаты со временем и смотри, какие смены и платформы работают для тебя лучше." },
      ],
    },
    platforms: { eyebrow: "Гибкость по замыслу", title: "Твои платформы вместе", description: "CourierDash упорядочивает введённые вручную результаты и не подразумевает подключения к аккаунтам платформ.", other: "Другая" },
    benefits: { eyebrow: "Создано для ясности", title: "Меньше догадок после смены", items: ["Доход со всех активных платформ в одном месте", "Понятное сравнение результатов платформ", "Рабочее время и доход в час в контексте", "Месячная и годовая статистика без разрозненных файлов", "Непрерывная история вместо новой таблицы на каждый период", "Адаптивное рабочее пространство в мобильном браузере"] },
    faq: {
      eyebrow: "FAQ", title: "Вопросы перед первой записью смены",
      items: [
        { question: "Что такое CourierDash?", answer: "CourierDash — это веб-дашборд для курьеров доставки, которые хотят учитывать работу и понимать доход, время, заказы, расстояние и эффективность." },
        { question: "Какие платформы можно отслеживать?", answer: "Можно записывать Glovo, Uber Eats, Wolt, Bolt Food, Stuart и дополнительную платформу со своим названием." },
        { question: "Нужно ли подключать аккаунты платформ?", answer: "Нет. Данные о сменах добавляются вручную, поэтому CourierDash не нужен доступ к твоим аккаунтам на платформах доставки." },
        { question: "Какие данные я добавляю?", answer: "Смена может включать дату, часы работы, расстояние, доход с платформ, заказы, онлайн- и наличные чаевые, а также бонусы." },
        { question: "Можно ли работать с несколькими платформами?", answer: "Да. Ты выбираешь активные платформы и можешь менять этот выбор вместе со своим способом работы." },
        { question: "Работает ли CourierDash на телефоне?", answer: "Да. CourierDash — адаптивное веб-приложение для мобильного браузера. Здесь не заявляется о нативном мобильном приложении." },
      ],
    },
    cta: { title: "Хватит гадать. Начни понимать свою работу.", description: "Составь надёжную картину каждой смены, каждой платформы и каждого месяца.", primary: "Создать аккаунт", secondary: "Войти" },
    footer: { ariaLabel: "Навигация в подвале", description: "Понятный дашборд для курьеров, которые хотят лучше понимать свои показатели.", product: "Продукт", features: "Возможности", howItWorks: "Как это работает", faq: "FAQ", rights: "Создано для курьеров доставки." },
  },
} satisfies Record<LangType, LandingV1Copy>;
