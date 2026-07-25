import type {
  FormEventHandler,
} from "react";

import type {
  PlatformKey,
  PlatformValues,
} from "../../../lib/work-platforms";
import type {
  FieldSettings,
  WorkBreak,
  WorkTranslations,
} from "../work-page.types";
import { PlatformSelector } from "./PlatformSelector";

type FieldText = {
  formTitle: string;
  title: string;
};

type WorkEntryFormProps = {
  activePlatforms: PlatformKey[];
  availablePlatforms: PlatformKey[];
  bonuses: PlatformValues;
  breaks: WorkBreak[];
  cashTips: PlatformValues;
  date: string;
  earnings: PlatformValues;
  editingId: number | null;
  fieldSettings: FieldSettings;
  fieldText: FieldText;
  getPlatformOptionLabel: (platform: PlatformKey) => string;
  hours: string;
  isFormOpen: boolean;
  isSubmitting: boolean;
  km: string;
  onAddPlatform: (platform: PlatformKey) => void;
  onBonusChange: (platform: PlatformKey, value: string) => void;
  onCashTipChange: (platform: PlatformKey, value: string) => void;
  onBreaksChange: (breaks: WorkBreak[]) => void;
  onCalculateHours: () => void;
  onDateChange: (value: string) => void;
  onEarningChange: (platform: PlatformKey, value: string) => void;
  onHoursChange: (value: string) => void;
  onKmChange: (value: string) => void;
  onOpenFieldSettings: () => void;
  onOrderChange: (platform: PlatformKey, value: string) => void;
  onOtherPlatformNameBlur: () => void;
  onOtherPlatformNameChange: (value: string) => void;
  onRemovePlatform: (platform: PlatformKey) => void;
  onReset: () => void;
  onShiftEndChange: (value: string) => void;
  onShiftStartChange: (value: string) => void;
  onShowCalcChange: (value: boolean) => void;
  onShowCalcInfoChange: (value: boolean) => void;
  onShowExtrasChange: (value: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onTipChange: (platform: PlatformKey, value: string) => void;
  orders: PlatformValues;
  otherPlatformName: string;
  shiftEnd: string;
  shiftStart: string;
  showCalc: boolean;
  showCalcInfo: boolean;
  showExtras: boolean;
  tips: PlatformValues;
  translations: WorkTranslations;
};

export function WorkEntryForm({
  activePlatforms,
  availablePlatforms,
  bonuses,
  breaks,
  cashTips,
  date,
  earnings,
  editingId,
  fieldSettings,
  fieldText,
  getPlatformOptionLabel,
  hours,
  isFormOpen,
  isSubmitting,
  km,
  onAddPlatform,
  onBonusChange,
  onCashTipChange,
  onBreaksChange,
  onCalculateHours,
  onDateChange,
  onEarningChange,
  onHoursChange,
  onKmChange,
  onOpenFieldSettings,
  onOrderChange,
  onOtherPlatformNameBlur,
  onOtherPlatformNameChange,
  onRemovePlatform,
  onReset,
  onShiftEndChange,
  onShiftStartChange,
  onShowCalcChange,
  onShowCalcInfoChange,
  onShowExtrasChange,
  onSubmit,
  onTipChange,
  orders,
  otherPlatformName,
  shiftEnd,
  shiftStart,
  showCalc,
  showCalcInfo,
  showExtras,
  tips,
  translations: t,
}: WorkEntryFormProps) {
  return (
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormOpen ? "max-h-[4000px] opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
      <form onSubmit={onSubmit} className={`p-5 md:p-6 rounded-xl border shadow-lg transition-all ${editingId ? 'bg-[#25251a] border-yellow-700/50' : 'bg-[#1e1e24] border-gray-800'}`}>
        {/* ШАПКА ФОРМИ З КНОПКОЮ НАЛАШТУВАНЬ */}
        <div className="flex justify-between items-center mb-5 border-b border-gray-700/50 pb-3">
          <h3 className="text-gray-300 font-bold flex items-center gap-2">📝 {fieldText.formTitle}</h3>
          <button type="button" onClick={onOpenFieldSettings} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition border border-gray-700 flex items-center gap-1.5 font-medium shadow-sm">
            ⚙️ {fieldText.title}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t.work.date}</label>
            <input type="date" required value={date} onChange={(e) => onDateChange(e.target.value)} disabled={editingId !== null} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:opacity-50 text-base appearance-none" />
          </div>
          <div className={!fieldSettings.km ? "opacity-50" : ""}>
            <label className="block text-sm text-gray-400 mb-1.5">{t.work.mileage}</label>
            <input type="number" step="0.1" required={fieldSettings.km} disabled={!fieldSettings.km} value={fieldSettings.km ? km : ""} onChange={(e) => onKmChange(e.target.value)} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:cursor-not-allowed text-base font-medium appearance-none" />
          </div>
          <div className={!fieldSettings.hours ? "opacity-50" : ""}>
            <label className="block text-sm text-gray-400 mb-1.5">{t.work.hours}</label>
            <input type="number" step="0.1" required={fieldSettings.hours} disabled={!fieldSettings.hours} value={fieldSettings.hours ? hours : ""} onChange={(e) => onHoursChange(e.target.value)} className="w-full p-3.5 bg-[#2a2a35] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 disabled:cursor-not-allowed text-base font-medium appearance-none" />

            {fieldSettings.hours && (
              <div className="mt-2 flex items-center justify-between px-1">
                <button type="button" onClick={() => onShowCalcChange(!showCalc)} className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                  🧮 {t.work.calcHoursBtn}
                </button>
                <button type="button" onClick={() => onShowCalcInfoChange(!showCalcInfo)} className="text-gray-400 hover:text-white transition text-xs w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">❓</button>
              </div>
            )}
          </div>
        </div>

        {showCalcInfo && fieldSettings.hours && (
          <div className="mb-4 p-3 bg-[#1e2330] border border-blue-900/50 rounded-xl text-xs text-blue-200 leading-relaxed shadow-inner animate-fade-in">
            {t.work.calcTooltip}
          </div>
        )}

        {showCalc && fieldSettings.hours && (
          <div className="col-span-1 md:col-span-3 bg-[#17171d] p-4 md:p-5 rounded-xl border border-blue-900/50 mb-6 shadow-inner animate-fade-in">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t.work.shiftStart}</label>
                <input type="time" value={shiftStart} onChange={(e) => onShiftStartChange(e.target.value)} className="w-full p-3 bg-[#2a2a35] border border-gray-700 rounded-lg text-white font-bold focus:border-blue-500 focus:outline-none appearance-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t.work.shiftEnd}</label>
                <input type="time" value={shiftEnd} onChange={(e) => onShiftEndChange(e.target.value)} className="w-full p-3 bg-[#2a2a35] border border-gray-700 rounded-lg text-white font-bold focus:border-blue-500 focus:outline-none appearance-none" />
              </div>
            </div>

            {breaks.length > 0 && (
              <div className="mb-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2 block">Перерви</span>
                <div className="space-y-3">
                  {breaks.map((brk, idx) => (
                    <div key={idx} className="relative bg-[#22222a] p-3 rounded-lg border border-gray-800 flex flex-col gap-2">
                      <button type="button" onClick={() => onBreaksChange(breaks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-900/20 text-red-500 w-6 h-6 rounded-md flex items-center justify-center border border-red-900/30 hover:bg-red-900/40 transition">✕</button>
                      <span className="text-[10px] font-bold text-gray-500">Перерва {idx + 1}</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.work.breakStart}</label>
                          <input type="time" value={brk.start} onChange={(e) => { const newBreaks = [...breaks]; newBreaks[idx].start = e.target.value; onBreaksChange(newBreaks); }} className="w-full p-2.5 bg-[#1e1e24] border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none appearance-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase tracking-wider mb-1">{t.work.breakEnd}</label>
                          <input type="time" value={brk.end} onChange={(e) => { const newBreaks = [...breaks]; newBreaks[idx].end = e.target.value; onBreaksChange(newBreaks); }} className="w-full p-2.5 bg-[#1e1e24] border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none appearance-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-800 pt-4 mt-2">
              <button type="button" onClick={() => onBreaksChange([...breaks, { start: "", end: "" }])} className="sm:w-1/3 w-full py-3.5 rounded-xl text-sm font-bold text-yellow-500 hover:text-yellow-400 transition bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 flex items-center justify-center">
                {t.work.addBreakBtn}
              </button>
              <button type="button" onClick={onCalculateHours} disabled={!shiftStart || !shiftEnd} className="flex-1 w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 transition shadow-md flex items-center justify-center">
                {t.work.calcActionBtn}
              </button>
            </div>
          </div>
        )}

        <PlatformSelector
          activePlatforms={activePlatforms}
          availablePlatforms={availablePlatforms}
          bonuses={bonuses}
          cashTips={cashTips}
          earnings={earnings}
          fieldSettings={fieldSettings}
          getPlatformOptionLabel={getPlatformOptionLabel}
          onAddPlatform={onAddPlatform}
          onBonusChange={onBonusChange}
          onCashTipChange={onCashTipChange}
          onEarningChange={onEarningChange}
          onOrderChange={onOrderChange}
          onOtherPlatformNameBlur={onOtherPlatformNameBlur}
          onOtherPlatformNameChange={onOtherPlatformNameChange}
          onRemovePlatform={onRemovePlatform}
          onTipChange={onTipChange}
          orders={orders}
          otherPlatformName={otherPlatformName}
          showExtras={showExtras}
          tips={tips}
          translations={t}
        />

        <div className="mb-6">
          <button type="button" onClick={() => onShowExtrasChange(!showExtras)} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition">
            {showExtras ? t.work.hideExtrasBtn : t.work.addExtrasBtn}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className={`flex-1 py-4 rounded-xl font-bold text-lg transition ${editingId ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"} ${isSubmitting && "opacity-70 cursor-not-allowed"}`}>
            {isSubmitting ? t.work.saving : (editingId ? t.work.updateShift : t.work.saveShift)}
          </button>
          <button type="button" onClick={onReset} className="sm:w-1/3 py-4 rounded-xl font-bold text-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition">
            {t.common.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
