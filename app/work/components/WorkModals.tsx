import type { FormEventHandler } from "react";

import type {
  FieldSettings,
  TaxSettings,
  WorkLanguage,
  WorkTranslations,
} from "../work-page.types";

type FieldText = {
  close: string;
  desc: string;
  title: string;
  trackHrs: string;
  trackKm: string;
  trackOrd: string;
};

type WorkModalsProps = {
  deleteConfirmId: number | null;
  fieldSettings: FieldSettings;
  fieldText: FieldText;
  isSavingNickname: boolean;
  isSavingTaxes: boolean;
  lang: WorkLanguage;
  newNickname: string;
  nicknameError: string | null;
  onCancelDelete: () => void;
  onCloseFieldSettings: () => void;
  onCloseTaxSettings: () => void;
  onConfirmDelete: () => void;
  onFieldSettingChange: (key: keyof FieldSettings, value: boolean) => void;
  onNewNicknameChange: (value: string) => void;
  onNicknameSubmit: FormEventHandler<HTMLFormElement>;
  onSaveTaxSettings: () => void;
  onTaxFormChange: (taxForm: TaxSettings) => void;
  showFieldSettings: boolean;
  showNicknameModal: boolean;
  showTaxModal: boolean;
  taxForm: TaxSettings;
  translations: WorkTranslations;
};

export function WorkModals({
  deleteConfirmId,
  fieldSettings,
  fieldText,
  isSavingNickname,
  isSavingTaxes,
  lang,
  newNickname,
  nicknameError,
  onCancelDelete,
  onCloseFieldSettings,
  onCloseTaxSettings,
  onConfirmDelete,
  onFieldSettingChange,
  onNewNicknameChange,
  onNicknameSubmit,
  onSaveTaxSettings,
  onTaxFormChange,
  showFieldSettings,
  showNicknameModal,
  showTaxModal,
  taxForm,
  translations: t,
}: WorkModalsProps) {
  return (
    <>
      {/* КАСТОМНЕ ВІКНО ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-red-500 text-4xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">{lang === "pl" ? "Usunąć zmianę?" : lang === "en" ? "Delete shift?" : lang === "ru" ? "Удалить смену?" : "Видалити зміну?"}</h3>
            <p className="text-gray-400 text-sm mb-6">{t.work.confirmDelete}</p>
            <div className="flex gap-3">
              <button onClick={onCancelDelete} className="flex-1 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 text-white transition">{t.common.cancel}</button>
              <button onClick={onConfirmDelete} className="flex-1 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition">{t.common.delete}</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: НАЛАШТУВАННЯ ПОЛІВ */}
      {showFieldSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button type="button" onClick={onCloseFieldSettings} className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-lg">✕</button>
            <h3 className="text-xl font-bold text-white mb-3">⚙️ {fieldText.title}</h3>
            <p className="text-xs leading-relaxed bg-blue-900/20 p-3 rounded-lg border border-blue-900/30 text-blue-200 mb-6">
              ℹ️ {fieldText.desc}
            </p>
            <div className="space-y-4 mb-8">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fieldText.trackKm}</span>
                <input type="checkbox" checked={fieldSettings.km} onChange={(e) => onFieldSettingChange('km', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fieldText.trackHrs}</span>
                <input type="checkbox" checked={fieldSettings.hours} onChange={(e) => onFieldSettingChange('hours', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">{fieldText.trackOrd}</span>
                <input type="checkbox" checked={fieldSettings.orders} onChange={(e) => onFieldSettingChange('orders', e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
              </label>
            </div>
            <button type="button" onClick={onCloseFieldSettings} className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-bold transition shadow-sm">
              {fieldText.close}
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: ПОДАТКИ */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl my-8">
            <button onClick={onCloseTaxSettings} className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl">✕</button>
            <h2 className="text-2xl font-black text-white mb-2">{t.work.taxModalTitle}</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t.work.taxModalDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {(["uber", "wolt", "bolt", "glovo"] as const).map(p => (
                <div key={p} className="bg-[#2a2a35] p-4 rounded-xl border border-gray-700">
                  <span className="font-bold text-lg text-white capitalize block mb-3 border-b border-gray-600 pb-2">{p}</span>
                  <div className="space-y-3">
                    <select
                      value={taxForm[`${p}_type` as keyof TaxSettings]}
                      onChange={(e) => onTaxFormChange({...taxForm, [`${p}_type`]: e.target.value})}
                      className="w-full bg-[#1e1e24] border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-blue-500 focus:outline-none appearance-none"
                    >
                      <option value="none">{t.work.taxTypeNone}</option>
                      <option value="percent">{t.work.taxTypePercent}</option>
                      <option value="fixed_week">{t.work.taxTypeFixedWeek}</option>
                      <option value="fixed_month">{t.work.taxTypeFixedMonth}</option>
                    </select>
                    {taxForm[`${p}_type` as keyof TaxSettings] !== 'none' && (
                      <div className="relative">
                        <input
                          type="text" inputMode="decimal" placeholder="0"
                          value={taxForm[`${p}_val` as keyof TaxSettings]}
                          onChange={(e) => onTaxFormChange({...taxForm, [`${p}_val`]: e.target.value.replace(/[^0-9.,]/g, '')})}
                          className="w-full bg-[#1e1e24] border border-gray-600 rounded-lg p-3 text-white text-base font-bold focus:border-blue-500 focus:outline-none pl-4 pr-10 appearance-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">
                          {taxForm[`${p}_type` as keyof TaxSettings] === 'percent' ? '%' : 'зл'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onSaveTaxSettings} disabled={isSavingTaxes} className="w-full py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg disabled:opacity-50">
              {isSavingTaxes ? t.work.saving : t.common.save}
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: НІКНЕЙМ */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-md p-6 md:p-8 relative shadow-2xl text-center">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              {lang === "pl" ? "Wybierz swój pseudonim" : lang === "en" ? "Choose your nickname" : lang === "ru" ? "Выбери свой никнейм" : "Придумай свій нікнейм"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {lang === "pl" ? "Wprowadzamy globalny ranking kurierów!" : lang === "en" ? "We are introducing a global courier leaderboard!" : lang === "ru" ? "Мы внедряем глобальный рейтинг курьеров!" : "Ми впроваджуємо загальний рейтинг кур'єрів!"}
            </p>
            {nicknameError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-xl text-xs mb-4 text-left">{nicknameError}</div>}
            <form onSubmit={onNicknameSubmit} className="space-y-4">
              <div className="text-left">
                <input type="text" required pattern="^[a-zA-Z0-9_]{3,15}$" title="Від 3 до 15 символів" value={newNickname} onChange={(e) => onNewNicknameChange(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} placeholder="Courier_Hero_2026" className="w-full text-center font-bold tracking-wide text-lg bg-[#2a2a35] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 appearance-none" />
              </div>
              <button type="submit" disabled={isSavingNickname || !newNickname.trim()} className={`w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition shadow-lg ${(isSavingNickname || !newNickname.trim()) && "opacity-50 cursor-not-allowed"}`}>
                {isSavingNickname ? t.work.saving : (lang === "pl" ? "Zatwierdź" : lang === "en" ? "Confirm" : lang === "ru" ? "Подтвердить" : "Підтвердити 🚀")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
