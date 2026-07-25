import {
  getActivePlatformNames,
  getShiftPlatformTotals,
  type PlatformMetrics,
} from "../../../lib/work-platforms";
import type {
  Shift,
  WorkLanguage,
  WorkTranslations,
} from "../work-page.types";

type WorkHistoryProps = {
  getMetricTooltip: (shift: Shift, metric: keyof PlatformMetrics) => string;
  isLoading: boolean;
  lang: WorkLanguage;
  onDelete: (id: number) => void;
  onEdit: (shift: Shift) => void;
  onShowMobileTableChange: (value: boolean) => void;
  shifts: Shift[];
  showMobileTable: boolean;
  translations: WorkTranslations;
};

export function WorkHistory({
  getMetricTooltip,
  isLoading,
  lang,
  onDelete,
  onEdit,
  onShowMobileTableChange,
  shifts,
  showMobileTable,
  translations: t,
}: WorkHistoryProps) {
  return (
    <>
      <div className="mb-2 flex justify-between items-end">
        <h2 className="text-lg font-medium text-white">
          {t.work.historyTitle}{" "}
          <span className="text-xs text-gray-500 block sm:inline mt-1 sm:mt-0">
            ({lang === "pl" ? "Zawsze pokazuje" : lang === "en" ? "Always shows" : lang === "ru" ? "Всегда показывает" : "Завжди показує"} {t.work.brutto})
          </span>
        </h2>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{t.work.workDays} {shifts.length}</span>
      </div>

      <div className="md:hidden mb-4">
        <button onClick={() => onShowMobileTableChange(!showMobileTable)} className="w-full bg-[#1e1e24] border border-gray-700 hover:bg-[#2a2a35] py-3 rounded-xl text-sm font-bold text-white transition">
          {showMobileTable ? (lang === "pl" ? "Ukryj tabelę" : lang === "en" ? "Hide Table" : lang === "ru" ? "Скрыть таблицу" : "Сховати таблицю") :
                             (lang === "pl" ? "Pokaż tabelę (jak na PC)" : lang === "en" ? "Show Table (PC view)" : lang === "ru" ? "Показать таблицу (как на ПК)" : "Показати таблицю (як на ПК)")}
        </button>
      </div>

      {/* --- ПК ТАБЛИЦЯ (БЕЗ ЗМІН) --- */}
      <div className={`${showMobileTable ? 'block' : 'hidden'} md:block bg-[#1e1e24] rounded-xl border border-gray-800 overflow-x-auto mb-10`}>
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-[#2a2a35] text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800">
              <th className="p-4 font-bold text-gray-300">{t.work.tableDate}</th>
              <th className="p-4 font-bold text-blue-400 bg-blue-500/5">{t.work.tableOrders} ℹ️</th>
              <th className="p-4 font-bold text-green-400 bg-green-500/5">{t.work.tableIncome}</th>
              <th className="p-4 font-medium text-gray-400">{t.work.tableBase} ℹ️</th>
              <th className="p-4 font-medium text-purple-400">{t.work.tableBonuses} ℹ️</th>
              <th className="p-4 font-medium text-rose-400">{t.work.tableTips} ℹ️</th>
              <th className="p-4 font-medium">{t.work.tableHours}</th>
              <th className="p-4 font-medium">{t.work.tableKm}</th>
              <th className="p-4 font-bold text-cyan-400 border-l-2 border-gray-700/70 bg-cyan-950/20">{t.work.tableRate}</th>
              <th className="p-4 font-bold text-purple-400 bg-purple-950/20">{t.work.tableEff}</th>
              <th className="p-4 font-bold text-yellow-400 bg-yellow-950/20">{t.work.orderUnit.toUpperCase()}</th>
              <th className="p-4 font-medium text-right">{t.work.tableActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {isLoading ? (
              <tr><td colSpan={12} className="p-8 text-center text-gray-500">{t.common.loading}</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan={12} className="p-8 text-center text-gray-500">{t.work.noRecords}</td></tr>
            ) : (
              shifts.map((shift) => {
                const dailyTotals = getShiftPlatformTotals(shift);
                const dailyBase = dailyTotals.income;
                const dailyTips = dailyTotals.tips;
                const dailyBonuses = dailyTotals.bonuses;
                const absoluteTotal = dailyBase + dailyTips + dailyBonuses; // ЗАВЖДИ ПОВНА СУМА
                const dailyOrders = dailyTotals.orders;
                const platformNames = getActivePlatformNames(shift, t.work.otherPlatform);

                const dailyAvgHour = shift.hours > 0 ? (absoluteTotal / shift.hours).toFixed(2) : "—";
                const dailyAvgKm = shift.km > 0 ? (absoluteTotal / shift.km).toFixed(2) : "—";
                const dailyAvgOrder = dailyOrders > 0 ? (absoluteTotal / dailyOrders).toFixed(2) : "—";

                const baseTooltip = getMetricTooltip(shift, "income");
                const ordersTooltip = getMetricTooltip(shift, "orders");
                const tipsTooltip = getMetricTooltip(shift, "tips");
                const bonusesTooltip = getMetricTooltip(shift, "bonuses");

                return (
                  <tr key={shift.id} className="hover:bg-[#2a2a35] transition">
                    <td className="p-4 font-medium">
                      <span className="block">{new Date(shift.date).toLocaleDateString("uk-UA")}</span>
                      {platformNames.length > 0 && (
                        <span className="mt-1 block max-w-44 whitespace-normal text-[10px] font-normal text-gray-500">
                          {platformNames.join(" • ")}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-blue-400 font-bold bg-blue-500/5 cursor-help" title={ordersTooltip}>{dailyOrders > 0 ? dailyOrders : "-"}</td>
                    <td className="p-4 font-bold text-green-400 bg-green-500/5">{absoluteTotal.toFixed(2)}</td>
                    <td className="p-4 text-gray-400 cursor-help" title={baseTooltip}>{dailyBase.toFixed(2)}</td>
                    <td className="p-4 text-purple-400 cursor-help" title={bonusesTooltip}>{dailyBonuses > 0 ? dailyBonuses.toFixed(2) : "-"}</td>
                    <td className="p-4 text-rose-400 cursor-help" title={tipsTooltip}>{dailyTips > 0 ? dailyTips.toFixed(2) : "-"}</td>
                    <td className="p-4">{shift.hours > 0 ? shift.hours : "—"}</td>
                    <td className="p-4 text-gray-400">{shift.km > 0 ? shift.km : "—"}</td>
                    <td className="p-4 text-cyan-400 font-bold border-l-2 border-gray-700/70 bg-cyan-950/20">{dailyAvgHour}</td>
                    <td className="p-4 text-purple-400 font-bold bg-purple-950/20">{dailyAvgKm}</td>
                    <td className="p-4 text-yellow-400 font-bold bg-yellow-950/20">{dailyAvgOrder}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => onEdit(shift)} className="text-gray-400 hover:text-yellow-500 p-2 transition">✏️</button>
                      <button onClick={() => onDelete(shift.id)} className="text-gray-400 hover:text-red-500 p-2 transition">🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- ВИПРАВЛЕНА МОБІЛЬНА ТАБЛИЦЯ --- */}
      <div className={`${showMobileTable ? 'hidden' : 'flex'} md:hidden flex-col gap-3 pb-10`}>
        {isLoading ? (
          <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.common.loading}</div>
        ) : shifts.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-[#1e1e24] rounded-xl border border-gray-800">{t.work.noRecords}</div>
        ) : (
          shifts.map((shift) => {
            const dailyTotals = getShiftPlatformTotals(shift);
            const dailyBase = dailyTotals.income;
            const dailyTips = dailyTotals.tips;
            const dailyBonuses = dailyTotals.bonuses;
            const absoluteTotal = dailyBase + dailyTips + dailyBonuses; // ЗАВЖДИ ПОВНА СУМА
            const dailyOrders = dailyTotals.orders;
            const platformNames = getActivePlatformNames(shift, t.work.otherPlatform);

            const dailyAvgHour = shift.hours > 0 ? (absoluteTotal / shift.hours).toFixed(2) : "—";
            const dailyAvgKm = shift.km > 0 ? (absoluteTotal / shift.km).toFixed(2) : "—";
            const dailyAvgOrder = dailyOrders > 0 ? (absoluteTotal / dailyOrders).toFixed(2) : "—";

            // Динамічна локаль для правильного формату дати
            const dateLocale = lang === "pl" ? "pl-PL" : lang === "en" ? "en-US" : lang === "ru" ? "ru-RU" : "uk-UA";

            return (
              <div key={shift.id} className="bg-[#1e1e24] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col gap-3">
                 <div className="flex justify-between items-center border-b border-gray-700/50 pb-2.5">
                  <span className="font-bold text-white text-base capitalize">
                    {new Date(shift.date).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                   <span className="font-black text-green-400 text-lg">{absoluteTotal.toFixed(2)} <span className="text-[10px] font-normal">{t.common.currency}</span></span>
                 </div>
                 {platformNames.length > 0 && (
                   <div className="text-[10px] text-gray-500">
                     <span className="font-semibold uppercase tracking-wider">{t.work.platformsLabel}: </span>
                     {platformNames.join(" • ")}
                   </div>
                 )}

                <div className="grid grid-cols-2 gap-3 items-stretch">
                  <div className="flex flex-col gap-1 text-xs bg-[#17171d] p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1">
                      {lang === "pl" ? "Dane zmiany" : lang === "en" ? "Shift Data" : lang === "ru" ? "Данные смены" : "Дані зміни"}
                    </span>
                    <div className="flex justify-between text-gray-400"><span>{t.work.tableBase}:</span><strong>{dailyBase.toFixed(2)}</strong></div>
                    {dailyTips > 0 && <div className="flex justify-between text-rose-400"><span>{t.work.tableTips}:</span><strong>{dailyTips.toFixed(2)}</strong></div>}
                    {dailyBonuses > 0 && <div className="flex justify-between text-purple-400"><span>{t.work.tableBonuses}:</span><strong>{dailyBonuses.toFixed(2)}</strong></div>}
                    <div className="flex justify-between text-blue-400 border-t border-gray-800 mt-1 pt-1"><span>{t.work.tableOrders}:</span><strong>{dailyOrders > 0 ? dailyOrders : "—"}</strong></div>
                    <div className="flex justify-between text-white"><span>{t.work.tableHours}:</span><strong>{shift.hours > 0 ? shift.hours : "—"}</strong></div>
                    <div className="flex justify-between text-gray-300"><span>{t.work.tableKm}:</span><strong>{shift.km > 0 ? shift.km : "—"}</strong></div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs bg-[#22222a]/50 p-2.5 rounded-lg border border-cyan-950/30 flex-1 justify-center">
                    <span className="text-gray-500 uppercase text-[9px] tracking-wider font-semibold block mb-1 text-center">
                      {lang === "pl" ? "Efektywność" : lang === "en" ? "Efficiency" : lang === "ru" ? "Эффективность" : "Ефективність"}
                    </span>
                    <div className="flex justify-between border-b border-gray-800/50 pb-1 text-cyan-400"><span>{t.work.tableRate}:</span><strong>{dailyAvgHour}</strong></div>
                    <div className="flex justify-between border-b border-gray-800/50 pb-1 text-purple-400"><span>{t.work.tableEff}:</span><strong>{dailyAvgKm}</strong></div>
                    <div className="flex justify-between text-yellow-400"><span>{t.work.orderUnit}:</span><strong>{dailyAvgOrder}</strong></div>
                  </div>
                </div>

                <div className="flex justify-between gap-2 border-t border-gray-800/50 pt-2.5">
                  <button onClick={() => onEdit(shift)} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-2 rounded-lg text-yellow-500 text-xs font-bold transition flex items-center justify-center gap-1">✏️ {t.common.edit}</button>
                  <button onClick={() => onDelete(shift.id)} className="w-10 bg-red-900/10 hover:bg-red-900/30 border border-red-900/20 rounded-lg text-red-500 transition text-xs flex items-center justify-center">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
