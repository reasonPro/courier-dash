import Link from "next/link";

import type {
  WorkLanguage,
  WorkTranslations,
} from "../work-page.types";

type WorkFiltersProps = {
  hasTaxesConfigured: boolean;
  includeBonuses: boolean;
  includeTips: boolean;
  isNetto: boolean;
  lang: WorkLanguage;
  onBruttoSelect: () => void;
  onIncludeBonusesChange: (value: boolean) => void;
  onIncludeTipsChange: (value: boolean) => void;
  onNettoSelect: () => void;
  onOpenTaxSettings: () => void;
  onSelectedMonthChange: (value: string) => void;
  selectedMonth: string;
  translations: WorkTranslations;
};

export function WorkFilters({
  hasTaxesConfigured,
  includeBonuses,
  includeTips,
  isNetto,
  lang,
  onBruttoSelect,
  onIncludeBonusesChange,
  onIncludeTipsChange,
  onNettoSelect,
  onOpenTaxSettings,
  onSelectedMonthChange,
  selectedMonth,
  translations: t,
}: WorkFiltersProps) {
  return (
    <div className="mb-6 bg-[#1e1e24] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
        <h2 className="text-xl md:text-2xl font-bold text-white">{t.work.statsTitle}</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/work/year" className="flex-1 sm:flex-none text-center bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm">
            {t.work.yearReportBtn}
          </Link>
          <input type="month" value={selectedMonth} onChange={(e) => onSelectedMonthChange(e.target.value)} className="flex-1 sm:flex-none bg-[#2a2a35] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 font-medium text-center appearance-none" />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto bg-[#17171d] p-3 rounded-lg border border-gray-800">
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
            {lang === "pl" ? "Uwzględnij w dochodach:" : lang === "en" ? "Include in income:" : lang === "ru" ? "Учитывать в доходах:" : "Враховувати у доходах:"}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onIncludeTipsChange(!includeTips)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition border shadow-sm ${includeTips ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
              {includeTips ? "✓ " : "+ "}{t.work.toggleTips}
            </button>
            <button onClick={() => onIncludeBonusesChange(!includeBonuses)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition border shadow-sm ${includeBonuses ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-[#1e1e24] text-gray-500 border-gray-800 hover:text-gray-300'}`}>
              {includeBonuses ? "✓ " : "+ "}{t.work.toggleBonuses}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <button onClick={onOpenTaxSettings} className="flex items-center justify-center gap-1.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-900/30 text-blue-400 text-sm font-bold px-4 py-2 rounded-lg transition h-[40px]">
            ⚙️ {t.work.taxesBtn}
          </button>

          <div className="flex bg-[#17171d] p-1 rounded-lg border border-gray-800 font-bold text-[11px] uppercase tracking-wider w-full sm:w-auto h-[40px]">
            <button onClick={onBruttoSelect} className={`flex-1 sm:flex-none px-5 rounded-md transition ${!isNetto ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
              {t.work.brutto}
            </button>
            <button onClick={onNettoSelect} className={`flex-1 sm:flex-none px-5 rounded-md transition flex items-center justify-center gap-1.5 ${isNetto ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
              {!hasTaxesConfigured && <span className="text-[10px]">🔒</span>}
              {t.work.netto}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
