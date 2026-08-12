import Link from "next/link";

import type {
  WorkLanguage,
  WorkTranslations,
} from "../work-page.types";

type WorkHeaderProps = {
  editingId: number | null;
  expensesLabel: string;
  lang: WorkLanguage;
  onLanguageChange: (lang: WorkLanguage) => void;
  onLogout: () => void;
  telegramLabel: string;
  translations: WorkTranslations;
  userNickname: string | null;
};

export function WorkHeader({
  editingId,
  expensesLabel,
  lang,
  onLanguageChange,
  onLogout,
  telegramLabel,
  translations: t,
  userNickname,
}: WorkHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4">
      {/* TITLE & MOBILE LANG SWITCHER */}
      <div className="flex justify-between items-center w-full sm:w-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{editingId ? t.work.editTitle : t.work.title}</h1>
          {userNickname && <p className="text-xs text-gray-500 mt-1">@ {userNickname}</p>}
        </div>

        {/* Мобільний перемикач мов (справа від заголовка) */}
        <div className="sm:hidden relative">
          <select
            value={lang}
            onChange={(e) => onLanguageChange(e.target.value as WorkLanguage)}
            className="bg-[#1e1e24] border border-gray-700 text-white text-[11px] font-bold pl-2 pr-5 py-2 rounded-lg appearance-none uppercase h-[34px] w-[60px] outline-none focus:border-sky-500 transition-colors cursor-pointer text-center shadow-sm"
          >
            <option value="pl">PL</option>
            <option value="uk">UK</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      {/* ACTION BUTTONS & DESKTOP LANG SWITCHER */}
      <div className="grid grid-cols-4 sm:flex sm:flex-row items-center gap-2.5 w-full sm:w-auto mt-1 sm:mt-0">
        {/* ПК перемикач мов */}
        <div className="hidden sm:block relative">
          <select
            value={lang}
            onChange={(e) => onLanguageChange(e.target.value as WorkLanguage)}
            className="bg-[#1e1e24] border border-gray-700 text-white text-xs font-bold pl-3 pr-6 py-2 rounded-lg appearance-none uppercase h-[36px] w-[68px] outline-none focus:border-sky-500 transition-colors cursor-pointer text-center shadow-sm"
          >
            <option value="pl">PL</option>
            <option value="uk">UK</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
        </div>

        {/* Кнопка Telegram */}
        <a
          href="https://t.me/courier_dash"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-950/30 border border-sky-500/30 text-sky-400 text-[11px] sm:text-xs font-bold px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 h-[36px] w-full transition hover:bg-sky-950/50 hover:border-sky-400 shadow-sm"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.43-.74-.24-1.33-.37-1.28-.77.03-.21.32-.43.88-.65 3.44-1.5 5.74-2.49 6.88-2.97 3.28-1.36 3.96-1.59 4.41-1.6.1.01.32.03.46.15.12.1.15.24.17.34-.02.08-.01.2-.02.26z"/>
          </svg>
          <span className="truncate">{telegramLabel}</span>
        </a>

        {/* Кнопка Гараж */}
        <Link
          href="/garage"
          className="bg-gray-800 border border-gray-700 text-white text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 h-[36px] w-full transition hover:bg-gray-700 shadow-sm truncate"
        >
          {t.work.garageBtn}
        </Link>

        <Link
          href="/expenses"
          className="bg-red-950/25 border border-red-500/25 text-red-300 text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 h-[36px] w-full transition hover:bg-red-950/45 shadow-sm truncate"
        >
          {expensesLabel}
        </Link>

        {/* Кнопка Вихід */}
        <button
          onClick={onLogout}
          className="bg-red-900/20 border border-red-900/30 text-red-400 text-[11px] sm:text-xs font-medium px-1.5 sm:px-3 py-2 rounded-lg flex items-center justify-center h-[36px] w-full transition hover:bg-red-900/40 shadow-sm truncate"
        >
          {t.common.logout}
        </button>
      </div>
    </div>
  );
}
