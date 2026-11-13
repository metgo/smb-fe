import clsx from "clsx";
import { Clock, Hash, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatLocalDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const PunchPassCataloguesDetails = ({
  catalogues = [],
}: Partial<IPunchPassDetailsRes>) => {
  const { t } = useTranslation("punch_pass");
  const { isDark, language, textPrimary, textTertiary, borderColor } =
    useThemeClasses();

  const badge = (content: React.ReactNode) => (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs",
        borderColor,
        isDark ? "bg-gray-900/50 text-gray-300" : "bg-gray-50 text-gray-600",
      )}
    >
      {content}
    </span>
  );

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-6",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      <h3
        className={clsx(
          "text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-4",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {t("catalogues")} ({catalogues.length})
      </h3>

      {catalogues.length === 0 ? (
        <div className="text-center py-10">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className={clsx("text-sm", textTertiary)}>
            {t("no_catalogues_added")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {catalogues.map((item, idx) => (
            <div
              key={item._id ?? idx}
              className={clsx(
                "rounded-lg border px-3 py-2.5 flex flex-wrap items-center justify-between gap-2",
                borderColor,
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0",
                    isDark
                      ? "bg-teal-500/20 text-teal-400"
                      : "bg-teal-100 text-teal-700",
                  )}
                >
                  {idx + 1}
                </div>
                <span
                  className={clsx("text-sm font-medium truncate", textPrimary)}
                >
                  {item.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {item.type &&
                  badge(t(`catalogue_type_${item.type.toLowerCase()}`))}
                {!!item.quantity &&
                  badge(
                    <>
                      <Hash className="w-3 h-3" />
                      {t("catalogue_quantity")}: {item.quantity}
                    </>,
                  )}
                {item.dateTime &&
                  badge(
                    <>
                      <Clock className="w-3 h-3" />
                      {formatLocalDateTime(item.dateTime, language)}
                    </>,
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PunchPassCataloguesDetails;
