import type {
  PlatformKey,
  PlatformValues,
} from "../../../lib/work-platforms";
import type {
  FieldSettings,
  WorkTranslations,
} from "../work-page.types";
import { PlatformSection } from "./PlatformSection";

type PlatformSelectorProps = {
  activePlatforms: PlatformKey[];
  availablePlatforms: PlatformKey[];
  bonuses: PlatformValues;
  cashTips: PlatformValues;
  earnings: PlatformValues;
  fieldSettings: FieldSettings;
  getPlatformOptionLabel: (platform: PlatformKey) => string;
  onAddPlatform: (platform: PlatformKey) => void;
  onBonusChange: (platform: PlatformKey, value: string) => void;
  onCashTipChange: (platform: PlatformKey, value: string) => void;
  onEarningChange: (platform: PlatformKey, value: string) => void;
  onOrderChange: (platform: PlatformKey, value: string) => void;
  onOtherPlatformNameBlur: () => void;
  onOtherPlatformNameChange: (value: string) => void;
  onRemovePlatform: (platform: PlatformKey) => void;
  onTipChange: (platform: PlatformKey, value: string) => void;
  orders: PlatformValues;
  otherPlatformName: string;
  showExtras: boolean;
  tips: PlatformValues;
  translations: WorkTranslations;
};

export function PlatformSelector({
  activePlatforms,
  availablePlatforms,
  bonuses,
  cashTips,
  earnings,
  fieldSettings,
  getPlatformOptionLabel,
  onAddPlatform,
  onBonusChange,
  onCashTipChange,
  onEarningChange,
  onOrderChange,
  onOtherPlatformNameBlur,
  onOtherPlatformNameChange,
  onRemovePlatform,
  onTipChange,
  orders,
  otherPlatformName,
  showExtras,
  tips,
  translations: t,
}: PlatformSelectorProps) {
  return (
    <div className="border-t border-gray-800 pt-5 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg font-medium">{t.work.incomePlatforms}</h2>
        {availablePlatforms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map(platform => (
              <button key={platform} type="button" onClick={() => onAddPlatform(platform)} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 rounded-lg transition font-medium">+ {getPlatformOptionLabel(platform)}</button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {activePlatforms.map((platform) => (
          <PlatformSection
            key={platform}
            bonuses={bonuses[platform]}
            cashTips={cashTips[platform]}
            earnings={earnings[platform]}
            fieldSettings={fieldSettings}
            onBonusChange={onBonusChange}
            onCashTipChange={onCashTipChange}
            onEarningChange={onEarningChange}
            onOrderChange={onOrderChange}
            onOtherPlatformNameBlur={onOtherPlatformNameBlur}
            onOtherPlatformNameChange={onOtherPlatformNameChange}
            onRemove={onRemovePlatform}
            onTipChange={onTipChange}
            orders={orders[platform]}
            otherPlatformName={otherPlatformName}
            platform={platform}
            showExtras={showExtras}
            tips={tips[platform]}
            translations={t}
          />
        ))}
      </div>
    </div>
  );
}
