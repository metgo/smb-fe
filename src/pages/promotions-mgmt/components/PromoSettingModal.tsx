import { PublishButton } from "@/components/btns";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { Clock, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PromoSettingModalProps {
  settings: IPromotionSettings;
  onSettingsChange: (updated: Partial<IPromotionSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
  setShowSettings: (v: any) => void;
}

const PromoSettingModal = ({
  settings,
  onSettingsChange,
  onSave,
  isSaving,
  setShowSettings,
}: PromoSettingModalProps) => {
  const { t } = useTranslation("promotions");
  const { isDark, bgPrimary, textPrimary, textSecondary, borderColor } =
    useThemeClasses();

  return (
    <ModalWrapper
      onClose={() => setShowSettings(false)}
      maxWidth="max-w-lg"
      height=""
    >
      <div className="p-5 ">
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
          {t("rotation_settings")}
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              {t("rotation_type")}
            </label>

            <select
              value={settings.rotationType}
              onChange={(e) =>
                onSettingsChange({
                  rotationType: e.target.value as "automatic" | "manual",
                })
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-green-500`}
            >
              <option value="automatic">{t("automatic")}</option>
              <option value="manual">{t("manual")}</option>
            </select>
          </div>

          <div>
            <label
              className={`flex items-center gap-2 text-sm font-medium ${textPrimary} mb-2`}
            >
              <Clock className="w-4 h-4" />
              {t("time_interval_seconds")}
            </label>

            <input
              type="number"
              value={settings.timeInterval}
              onChange={(e) =>
                onSettingsChange({
                  timeInterval: parseInt(e.target.value),
                })
              }
              min="1"
              max="60"
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>

        <div className="my-3">
          <label
            className={`flex items-center gap-2 text-sm font-medium ${textPrimary} mb-2`}
          >
            <Info className="w-4 h-4" />
            {t("active_placements")}
          </label>

          <div className={`p-3 rounded-lg border ${borderColor} ${bgPrimary}`}>
            <div className="space-y-1">
              {settings.placements.map((placement, idx) => (
                <div key={idx} className={`text-sm ${textSecondary}`}>
                  • {t(placement)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "mt-4 p-3 rounded-lg border",
            isDark
              ? "bg-green-950/20 border-green-800"
              : "bg-green-50 border-green-200",
          )}
        >
          <p
            className={clsx(
              "text-xs",
              isDark ? "text-green-100" : "text-green-900",
            )}
          >
            <strong>{t("note")}:</strong> {t("rotation_note_text")}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          <PublishButton isLoading={isSaving} onClick={onSave} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PromoSettingModal;
