import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type TCancelled = IProductDto["cancelled"];

export default function CancelledInfo({
  cancelled,
  compact = false,
}: {
  cancelled?: TCancelled;
  compact?: boolean;
}) {
  const { t } = useTranslation("orders");
  const { isDark, isRTL, language } = useThemeClasses();

  if (!cancelled) return null;

  // Known reason codes (e.g. "card_payment_declined") translate via the
  // "orders" namespace; free-text reasons typed by an admin fall back to
  // showing exactly what was stored, unchanged.
  const reasonText = cancelled?.canceledReson
    ? t(cancelled.canceledReson, { defaultValue: cancelled.canceledReson })
    : cancelled?.canceledReson;

  const rows = [
    { label: t("cancellationReason"), value: reasonText },
    { label: t("additionalNotes"), value: cancelled?.additionalInfo },
    {
      label: t("cancelledOn"),
      value: cancelled?.canceledDate
        ? formatDateTime(cancelled.canceledDate, language)
        : "",
    },
    {
      label: t("cancelledBy"),
      value:
        [cancelled?.name, cancelled?.email].filter(Boolean).join(" · ") || "",
    },
  ].filter((row) => row.value);

  if (!rows.length) return null;

  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        isDark
          ? "border-red-900/40 bg-red-900/10 text-red-200"
          : "border-red-200 bg-red-50 text-red-800"
      } ${isRTL ? "text-right" : "text-left"} ${compact ? "" : "mt-3"}`}
    >
      <div
        className={`flex items-center gap-2 font-medium mb-2 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <XCircle className="w-4 h-4 shrink-0" />
        <span>{t("cancellationDetails")}</span>
      </div>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <dt className="shrink-0 opacity-80">{row.label}:</dt>
            <dd className="font-medium wrap-break-word">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
