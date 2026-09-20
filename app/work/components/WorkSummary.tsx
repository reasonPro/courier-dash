import type { CSSProperties, ReactNode } from "react";
import type { WorkLanguage, WorkTranslations } from "../work-page.types";
import { workViewTranslations } from "../../../lib/work-view-translations";
import { comparisonTranslations } from "../../../lib/work-comparison-translations";
import type { WorkComparison } from "../../../lib/work-comparison";
import { WorkComparisonBadge } from "./WorkComparisonBadge";

type WorkSummaryProps = {
  comparison?: WorkComparison;
  lang: WorkLanguage;
  includeAppTips: boolean;
  includeCashTips: boolean;
  includeBonuses: boolean;
  appTips: number;
  cashTips: number;
  bonuses: number;
  notices?: ReactNode;
  moneyUnavailable?: boolean;
  avgEarnedPerDay: string;
  avgHoursPerDay: string;
  avgOrdersPerDay: string;
  avgPerHour: string;
  avgPerKm: string;
  avgPerOrder: string;
  bestShiftDate: string;
  isNetto: boolean;
  maxEarned: number;
  onShowBestMonthDayChange: (value: boolean) => void;
  showBestMonthDay: boolean;
  tipsPercent: string;
  totalHours: number;
  totalKm: number;
  totalOrders: number;
  totalVisualEarned: number;
  translations: WorkTranslations;
};

export function WorkSummary({
  comparison,
  lang, includeAppTips, includeCashTips, includeBonuses, appTips, cashTips, bonuses,
  notices,
  moneyUnavailable = false,
  avgEarnedPerDay,
  avgHoursPerDay,
  avgOrdersPerDay,
  avgPerHour,
  avgPerKm,
  avgPerOrder,
  bestShiftDate,
  isNetto,
  maxEarned,
  onShowBestMonthDayChange,
  showBestMonthDay,
  tipsPercent,
  totalHours,
  totalKm,
  totalOrders,
  totalVisualEarned,
  translations: t,
}: WorkSummaryProps) {
  const copy = workViewTranslations[lang];
  const money = (value: number) => moneyUnavailable ? "—" : value.toFixed(2);
  const showTips = includeAppTips || includeCashTips;
  const cardCount = 4 + (showTips ? 1 : 0) + (includeBonuses ? 1 : 0);
  const desktopColumns = cardCount === 6 ? 3 : cardCount <= 5 ? cardCount : 4;
  return (
    <>
      {bestShiftDate && (
        <div className="mb-6">
          <button onClick={() => onShowBestMonthDayChange(!showBestMonthDay)} className="w-full bg-[#24242d] hover:bg-[#2c2c38] border border-gray-800 p-4 rounded-xl font-medium text-yellow-500 transition flex justify-between items-center text-sm md:text-base">
            <span>{showBestMonthDay ? t.work.hideBestDay : t.work.showBestDay}</span>
            <span className="text-xs bg-gray-800 px-2 md:px-3 py-1 rounded text-gray-400 hidden sm:inline-block">{t.work.clickToView}</span>
          </button>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showBestMonthDay ? "max-h-40 opacity-100 mt-2 border-l-4 border-yellow-500 p-4 md:p-5 bg-gradient-to-r from-yellow-600/20 to-transparent rounded-r-xl" : "max-h-0 opacity-0"}`}>
            <div className="flex flex-wrap gap-3 justify-between items-center w-full">
              <div>
                <h4 className="font-bold text-yellow-500 text-sm md:text-base">{t.work.bestDayTitle}</h4>
                <p className="text-gray-400 text-xs md:text-sm mt-1">{t.work.date}: {new Date(bestShiftDate).toLocaleDateString("uk-UA")}</p>
              </div>
              <div className="min-w-0 [overflow-wrap:anywhere] text-2xl md:text-3xl font-black text-yellow-500">{maxEarned.toFixed(2)} {t.common.currency}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.totalMonthTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</span>
        {notices}
        <div data-testid="work-monthly-metrics" style={{ "--stat-basis": `calc(${100 / desktopColumns}% - 0.5rem)` } as CSSProperties} className="flex flex-wrap gap-2 [&>div]:min-w-0 [&>div]:[overflow-wrap:anywhere] [&>div]:p-3 [&>div]:flex-[1_1_calc(50%_-_0.5rem)] sm:[&>div]:flex-[1_1_10rem] xl:[&>div]:basis-[var(--stat-basis)] [&>div:first-child]:basis-full sm:[&>div:first-child]:basis-40 xl:[&>div:first-child]:basis-[var(--stat-basis)] [&>div[data-testid=work-tips-card]]:basis-full sm:[&>div[data-testid=work-tips-card]]:basis-64 xl:[&>div[data-testid=work-tips-card]]:basis-[var(--stat-basis)]">
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#252530] p-4 rounded-xl border border-gray-800 text-center shadow-md relative overflow-hidden flex flex-col justify-center">
            {isNetto && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>}
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalIncome}</h3>
            <p className={`text-xl sm:text-2xl font-black ${isNetto ? 'text-blue-400' : 'text-green-400'}`}>{moneyUnavailable ? "—" : totalVisualEarned.toFixed(2)} <span className="text-[10px] sm:text-sm font-normal">{t.common.currency}</span></p>
            {comparison && <WorkComparisonBadge comparison={comparison} metric="income" lang={lang} />}
          </div>
          {showTips && <div data-testid="work-tips-card" className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.tipsLabel}</h3>
            <p className="text-xl sm:text-2xl font-bold text-rose-400">{money(appTips + cashTips)} <span className="text-xs font-normal text-gray-400">PLN</span></p>
            <p className="text-xs text-gray-400">{tipsPercent === "—" ? "—" : `${new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(Number(tipsPercent))}%`} {comparisonTranslations[lang].share}</p>
            <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs leading-5 text-gray-400">
              {includeCashTips && <p>{copy.cashBreakdown}: {money(cashTips)} PLN</p>}
              {includeAppTips && <p>{copy.appBreakdown}: {money(appTips)} PLN</p>}
            </div>
          </div>}
          {includeBonuses && <div data-testid="work-bonuses-card" className="max-[359px]:!basis-full bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.bonusesLabel}</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-400">{money(bonuses)} <span className="text-xs font-normal text-gray-400">PLN</span></p>
          </div>}
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalOrders}</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">{totalOrders > 0 ? totalOrders : "—"} <span className="text-[10px] font-normal text-gray-500">{totalOrders > 0 && t.work.tableOrders}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalHours}</h3>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalHours > 0 ? totalHours.toFixed(1) : "—"} <span className="text-[10px] font-normal text-gray-500">{totalHours > 0 && t.common.hrs}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider mb-1">{t.work.totalKm}</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-400">{totalKm > 0 ? totalKm.toFixed(1) : "—"} <span className="text-[10px] font-normal text-gray-500">{totalKm > 0 && t.common.km}</span></p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2 block">{t.work.avgStatsTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 [&>div]:min-w-0 [&>div]:[overflow-wrap:anywhere]">
          <div className={`bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center border-b-2 shadow-sm ${isNetto ? 'border-blue-500/50' : 'border-green-500/50'}`}>
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.incomePerDay}</h3>
            <p className={`text-lg font-bold ${isNetto ? 'text-blue-400' : 'text-green-400'}`}>{avgEarnedPerDay} <span className="text-[10px] font-normal">{t.common.currency}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerHour}</h3>
            <p className="text-lg font-bold text-white">{avgPerHour} <span className="text-[10px] font-normal text-gray-500">{avgPerHour !== "—" && t.common.currency}</span></p>
            {comparison && <WorkComparisonBadge comparison={comparison} metric="rate" lang={lang} />}
          </div>
          <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ratePerOrder}</h3>
            <p className="text-lg font-bold text-blue-400">{avgPerOrder} <span className="text-[10px] font-normal text-gray-500">{avgPerOrder !== "—" && t.common.currency}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.effPerKm}</h3>
            <p className="text-lg font-bold text-purple-400">{avgPerKm} <span className="text-[10px] font-normal text-gray-500">{avgPerKm !== "—" && t.common.currency}</span></p>
          </div>
          <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.ordersPerDay}</h3>
            <p className="text-lg font-bold text-gray-300">{avgOrdersPerDay}</p>
          </div>
          <div className="bg-[#1e1e24] p-3 rounded-xl border border-gray-800 text-center flex flex-col justify-center">
            <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{t.work.hrsPerDay}</h3>
            <p className="text-lg font-bold text-gray-300">{avgHoursPerDay}</p>
          </div>
        </div>
      </div>
    </>
  );
}
