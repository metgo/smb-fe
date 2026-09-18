import clsx from "clsx";
import { DollarSign, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CampaignRewardSettingsProps {
  rewardAmount: string;
  rewardVoucherLimit: string;
  onChange: (updates: {
    rewardAmount?: string;
    rewardVoucherLimit?: string;
  }) => void;
  errors: Record<string, string>;
}

export default function CampaignRewardSettings({
  rewardAmount,
  rewardVoucherLimit,
  onChange,
  errors,
}: CampaignRewardSettingsProps) {
  const { t } = useTranslation("campaign");
  const { inputClasses, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  return (
    <div className="space-y-6">
      <div>
        <p className={clsx("text-sm font-medium mb-1", textSecondary)}>
          {t("reward_configuration")}
        </p>
        <p className={clsx("text-xs mb-5", textTertiary)}>
          {t("reward_configuration_hint")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={clsx("rounded-xl border p-4 space-y-3", borderColor)}>
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-green-900/40" : "bg-green-50",
              )}
            >
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className={clsx("text-sm font-medium", textSecondary)}>
              {t("reward_amount")}
            </p>
          </div>
          <div>
            <div className="relative">
              <span
                className={clsx(
                  "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                ₪
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rewardAmount}
                onChange={(e) => onChange({ rewardAmount: e.target.value })}
                placeholder="0.00"
                className={clsx(
                  "w-full pl-7 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                  inputClasses,
                  errors.rewardAmount && "border-red-500",
                )}
              />
            </div>
            {errors.rewardAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.rewardAmount}</p>
            )}
            <p className={clsx("text-xs mt-1.5", textTertiary)}>
              {t("reward_amount_hint")}
            </p>
          </div>
        </div>

        <div className={clsx("rounded-xl border p-4 space-y-3", borderColor)}>
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-violet-900/40" : "bg-violet-50",
              )}
            >
              <Ticket className="w-4 h-4 text-violet-500" />
            </div>
            <p className={clsx("text-sm font-medium", textSecondary)}>
              {t("voucher_limit")}
            </p>
          </div>
          <div>
            <input
              type="number"
              min="0"
              step="1"
              value={rewardVoucherLimit}
              onChange={(e) => onChange({ rewardVoucherLimit: e.target.value })}
              placeholder={t("voucher_limit_placeholder")}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                inputClasses,
                errors.rewardVoucherLimit && "border-red-500",
              )}
            />
            {errors.rewardVoucherLimit && (
              <p className="mt-1 text-xs text-red-500">
                {errors.rewardVoucherLimit}
              </p>
            )}
            <p className={clsx("text-xs mt-1.5", textTertiary)}>
              {t("voucher_limit_hint")}
            </p>
          </div>
        </div>
      </div>

      <div
        className={clsx(
          "rounded-xl border p-4",
          isDark
            ? "border-amber-700/40 bg-amber-900/10"
            : "border-amber-200 bg-amber-50",
        )}
      >
        <p
          className={clsx(
            "text-xs",
            isDark ? "text-amber-400" : "text-amber-700",
          )}
        >
          {t("optional_fields_note")}
        </p>
      </div>
    </div>
  );
}
