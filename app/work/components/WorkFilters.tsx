import Link from "next/link";
import type { ReactNode } from "react";
import { workViewTranslations } from "../../../lib/work-view-translations";
import { WorkStatisticsHelp } from "./WorkStatisticsHelp";

import type {
  WorkLanguage,
  WorkTranslations,
} from "../work-page.types";

type WorkFiltersProps = {
  platformFilter: ReactNode;
  hasTaxesConfigured: boolean;
  includeBonuses: boolean;
  includeAppTips: boolean;
  includeCashTips: boolean;
  isNetto: boolean;
  lang: WorkLanguage;
  onBruttoSelect: () => void;
  onIncludeBonusesChange: (value: boolean) => void;
  onIncludeAppTipsChange: (value: boolean) => void;
  onIncludeCashTipsChange: (value: boolean) => void;
  onNettoSelect: () => void;
  onOpenTaxSettings: () => void;
  onSelectedMonthChange: (value: string) => void;
  selectedMonth: string;
  translations: WorkTranslations;
};

export function WorkFilters({
  platformFilter,
  hasTaxesConfigured,
  includeBonuses,
  includeAppTips,
  includeCashTips,
  isNetto,
  lang,
  onBruttoSelect,
  onIncludeBonusesChange,
  onIncludeAppTipsChange,
  onIncludeCashTipsChange,
  onNettoSelect,
  onOpenTaxSettings,
  onSelectedMonthChange,
  selectedMonth,
  translations: t,
}: WorkFiltersProps) {
  const copy = workViewTranslations[lang];
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";
  return (
    <>
      <div className="mb-4 bg-[#1e1e24] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{t.work.statsTitle}</h2>
        <div className="flex min-w-0 items-center gap-2 w-full sm:w-auto">
          <Link href="/work/year" className={`min-w-0 flex-1 sm:flex-none text-center bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm ${focus}`}>
            {t.work.yearReportBtn}
          </Link>
          <input type="month" aria-label={copy.month} value={selectedMonth} onChange={(e) => onSelectedMonthChange(e.target.value)} className={`w-[12.5rem] max-w-full min-w-0 shrink sm:w-auto bg-[#2a2a35] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-green-500 font-medium text-center appearance-none ${focus}`} />
        </div>
      </div>

      <section aria-labelledby="work-statistics-settings" className="mb-6 min-w-0 bg-[#1e1e24] border border-gray-800 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-1">
          <h3 id="work-statistics-settings" className="text-lg md:text-xl font-bold text-white">{copy.statisticsSettings}</h3>
          <WorkStatisticsHelp lang={lang} />
        </div>
        <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[1.1fr_0.8fr_1.1fr] gap-5 xl:gap-6">
          <div className="min-w-0">{platformFilter}</div>
          <div className="min-w-0 border-t border-gray-700/50 pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium text-gray-400">{copy.includeInIncome}</legend>
              <div className="flex flex-wrap gap-2">
                {([
                  [copy.includeAppTips, includeAppTips, onIncludeAppTipsChange],
                  [copy.includeCashTips, includeCashTips, onIncludeCashTipsChange],
                ] as const).map(([label, included, onChange]) => (
                  <button key={label} type="button" aria-pressed={included} onClick={() => onChange(!included)} className={`inline-flex min-h-11 md:min-h-10 items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${focus} ${included ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-[#17171d] text-gray-400 border-gray-700 hover:text-white'}`}>
                    <span aria-hidden="true">{included ? "✓" : "+"}</span>{label}
                  </button>
                ))}
                <button type="button" aria-pressed={includeBonuses} onClick={() => onIncludeBonusesChange(!includeBonuses)} className={`inline-flex min-h-11 md:min-h-10 items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${focus} ${includeBonuses ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-[#17171d] text-gray-400 border-gray-700 hover:text-white'}`}>
                  <span aria-hidden="true">{includeBonuses ? "✓" : "+"}</span>{t.work.toggleBonuses}
                </button>
              </div>
            </fieldset>
          </div>
          <div className="min-w-0 border-t border-gray-700/50 pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium text-gray-400">{copy.metricsAndChart}</legend>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex min-w-0 flex-1 bg-[#17171d] p-1 rounded-lg border border-gray-700 font-bold text-[11px] uppercase tracking-wider">
                  <button type="button" aria-pressed={!isNetto} onClick={onBruttoSelect} className={`min-h-9 md:min-h-8 flex-1 px-2 rounded-md transition inline-flex items-center justify-center gap-1 ${focus} ${!isNetto ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                    {!isNetto && <span aria-hidden="true">✓</span>}{t.work.brutto}
                  </button>
                  <button type="button" aria-pressed={isNetto} onClick={onNettoSelect} className={`min-h-9 md:min-h-8 flex-1 px-2 rounded-md transition inline-flex items-center justify-center gap-1 ${focus} ${isNetto ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                    {isNetto && <span aria-hidden="true">✓</span>}
                    {!hasTaxesConfigured && <span aria-hidden="true">🔒</span>}
                    {t.work.netto}
                  </button>
                </div>
                <button type="button" aria-haspopup="dialog" onClick={onOpenTaxSettings} className={`min-h-11 md:min-h-10 flex items-center justify-center gap-2 border border-blue-400/50 hover:bg-blue-900/20 text-blue-400 text-sm font-medium px-3 py-2 rounded-lg transition ${focus}`}>
                  <span aria-hidden="true">⚙</span>{copy.taxSettingsAction}<span aria-hidden="true">↗</span>
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </section>
    </>
  );
}
