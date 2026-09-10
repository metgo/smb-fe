import type { TFunction } from "i18next";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PayoutCalculationInfoProps {
  t: TFunction;
}

// Shown for both admin and vendor views - the calculation is the same for
// everyone, only the audience viewing it differs.
export default function PayoutCalculationInfo({
  t,
}: PayoutCalculationInfoProps) {
  const { textPrimary, borderColor } = useThemeClasses();

  return (
    <InfoTooltip title={t("payout_calculation_info_title")} width="w-96">
      <ol className="list-decimal ps-4 space-y-1.5">
        <li>
          <span className={`font-medium ${textPrimary}`}>
            {t("payout_calculation_grand_total_label")}:
          </span>{" "}
          {t("payout_calculation_grand_total_desc")}
        </li>
        <li>
          <span className={`font-medium ${textPrimary}`}>
            {t("payout_calculation_platform_fee_label")}:
          </span>{" "}
          {t("payout_calculation_platform_fee_desc")}
        </li>
        <li>
          <span className={`font-medium ${textPrimary}`}>
            {t("payout_calculation_vendor_payable_label")}:
          </span>{" "}
          {t("payout_calculation_vendor_payable_desc")}
        </li>
      </ol>
      <p
        className={`mt-2 pt-2 border-t ${borderColor} text-xs text-teal-500 italic font-semibold`}
      >
        {t("payout_calculation_note")}
      </p>
    </InfoTooltip>
  );
}
