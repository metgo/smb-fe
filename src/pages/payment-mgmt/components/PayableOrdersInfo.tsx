import type { TFunction } from "i18next";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PayableOrdersInfoProps {
  t: TFunction;
}

// Explains what each count under the "Payable Orders" KPI means.
export default function PayableOrdersInfo({ t }: PayableOrdersInfoProps) {
  const { textPrimary } = useThemeClasses();

  const rows = [
    "payable_orders_count",
    "pending_count",
    "approved_count",
    "disputed_count",
    "cancelled_count",
    "rejected_count",
  ] as const;

  return (
    <InfoTooltip title={t("payable_orders_info_title")} width="w-96" elevated>
      <ol className="list-decimal ps-4 space-y-1.5">
        {rows.map((key) => (
          <li key={key}>
            <span className={`font-medium ${textPrimary}`}>
              {t(`${key}_label`)}:
            </span>{" "}
            {t(`${key}_desc`)}
          </li>
        ))}
      </ol>
    </InfoTooltip>
  );
}
