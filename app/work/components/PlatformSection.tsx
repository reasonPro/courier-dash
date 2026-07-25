import {
  PLATFORM_LABELS,
  normalizeOtherPlatformName,
  type PlatformKey,
} from "../../../lib/work-platforms";
import { PLATFORM_CARD_ACCENTS } from "../work-page.constants";
import type {
  FieldSettings,
  WorkTranslations,
} from "../work-page.types";

type PlatformSectionProps = {
  bonuses: string;
  cashTips: string;
  earnings: string;
  fieldSettings: FieldSettings;
  onBonusChange: (platform: PlatformKey, value: string) => void;
  onCashTipChange: (platform: PlatformKey, value: string) => void;
  onEarningChange: (platform: PlatformKey, value: string) => void;
  onOrderChange: (platform: PlatformKey, value: string) => void;
  onOtherPlatformNameBlur: () => void;
  onOtherPlatformNameChange: (value: string) => void;
  onRemove: (platform: PlatformKey) => void;
  onTipChange: (platform: PlatformKey, value: string) => void;
  orders: string;
  otherPlatformName: string;
  platform: PlatformKey;
  showExtras: boolean;
  tips: string;
  translations: WorkTranslations;
};

export function PlatformSection({
  bonuses,
  cashTips,
  earnings,
  fieldSettings,
  onBonusChange,
  onCashTipChange,
  onEarningChange,
  onOrderChange,
  onOtherPlatformNameBlur,
  onOtherPlatformNameChange,
  onRemove,
  onTipChange,
  orders,
  otherPlatformName,
  platform,
  showExtras,
  tips,
  translations: t,
}: PlatformSectionProps) {
  return (
    <div className={`relative bg-[#252530] p-3.5 rounded-xl border shadow-inner ${PLATFORM_CARD_ACCENTS[platform]}`}>
      <div className="flex justify-between items-center mb-2.5">
        <label className="text-sm font-bold text-gray-300">
          {platform === "other"
            ? normalizeOtherPlatformName(otherPlatformName) || t.work.otherPlatform
            : PLATFORM_LABELS[platform]}
        </label>
        <button type="button" onClick={() => onRemove(platform)} className="text-gray-500 hover:text-red-500 text-sm">✕</button>
      </div>
      {platform === "other" && (
        <div className="mb-3">
          <span className="block text-[10px] text-orange-300 uppercase tracking-wider mb-1">{t.work.otherPlatformName}</span>
          <input
            type="text"
            required
            maxLength={100}
            value={otherPlatformName}
            onChange={(e) => onOtherPlatformNameChange(e.target.value)}
            onBlur={onOtherPlatformNameBlur}
            placeholder={t.work.otherPlatformPlaceholder}
            className="w-full bg-[#1e1e24] border border-orange-700/70 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      )}
      <div className={`grid gap-3 ${showExtras ? "grid-cols-2" : "grid-cols-2"}`}>
        <div>
          <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.incomePlatforms}</span>
          <input type="number" step="0.01" value={earnings} onChange={(e) => onEarningChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-green-500 transition appearance-none" />
        </div>
        <div className={!fieldSettings.orders ? "opacity-50" : ""}>
          <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.ordersLabel}</span>
          <input type="number" step="1" required={fieldSettings.orders} disabled={!fieldSettings.orders} value={fieldSettings.orders ? orders : ""} onChange={(e) => onOrderChange(platform, e.target.value)} placeholder="0" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-white text-sm md:text-base font-bold focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed transition appearance-none" />
        </div>
        {showExtras && (
          <>
            <div className="col-span-2">
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t.work.tipsLabel}</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block whitespace-nowrap text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.appTipsLabel}</span>
                  <input type="number" step="0.01" value={tips} onChange={(e) => onTipChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-rose-400 text-sm md:text-base font-bold focus:outline-none focus:border-rose-500 transition appearance-none" />
                </div>
                <div>
                  <span className="block whitespace-nowrap text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.cashTipsLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashTips}
                    onChange={(e) => onCashTipChange(platform, e.target.value)}
                    onInput={(e) => e.currentTarget.setCustomValidity("")}
                    onInvalid={(e) => {
                      if (e.currentTarget.validity.rangeUnderflow) {
                        e.currentTarget.setCustomValidity(t.work.cashTipsNonNegative);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-amber-300 text-sm md:text-base font-bold focus:outline-none focus:border-amber-500 transition appearance-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.work.bonusesLabel}</span>
              <input type="number" step="0.01" value={bonuses} onChange={(e) => onBonusChange(platform, e.target.value)} placeholder="0.00" className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg p-2.5 text-purple-400 text-sm md:text-base font-bold focus:outline-none focus:border-purple-500 transition appearance-none" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
