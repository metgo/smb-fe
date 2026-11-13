import clsx from "clsx";
import { Building2, Check, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllDmosQuery } from "@/store/api/websiteConfigApi";

interface CampaignDmoSelectionProps {
  selectedDmoIds: string[];
  onChange: (ids: string[]) => void;
  errors: Record<string, string>;
}

export default function CampaignDmoSelection({
  selectedDmoIds,
  onChange,
  errors,
}: CampaignDmoSelectionProps) {
  const { t } = useTranslation("campaign");
  const { textSecondary, textTertiary, bgTertiary, isDark } = useThemeClasses();

  const { data: dmos, isLoading } = useGetAllDmosQuery();

  const toggle = (id: string) => {
    if (selectedDmoIds.includes(id)) {
      onChange(selectedDmoIds.filter((d) => d !== id));
    } else {
      onChange([...selectedDmoIds, id]);
    }
  };

  const toggleAll = () => {
    if (!dmos?.length) return;
    if (selectedDmoIds.length === dmos.length) {
      onChange([]);
    } else {
      onChange(dmos.map((d) => d._id));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className={clsx("text-sm font-medium mb-1", textSecondary)}>
          {t("select_dmos")} <span className="text-red-500">*</span>
        </p>
        <p className={clsx("text-xs mb-4", textTertiary)}>
          {t("select_dmos_hint")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      ) : !dmos?.length ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Building2
            className={clsx(
              "w-10 h-10",
              isDark ? "text-gray-600" : "text-gray-300",
            )}
          />
          <p className={clsx("text-sm", textTertiary)}>{t("no_dmos_found")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className={clsx("text-xs", textTertiary)}>
              {t("selected_count", {
                count: selectedDmoIds.length,
                total: dmos.length,
              })}
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-teal-500 hover:text-teal-400 cursor-pointer"
            >
              {selectedDmoIds.length === dmos.length
                ? t("deselect_all")
                : t("select_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dmos.map((dmo) => {
              const selected = selectedDmoIds.includes(dmo._id);
              return (
                <button
                  key={dmo._id}
                  type="button"
                  onClick={() => toggle(dmo._id)}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    selected
                      ? "border-teal-500 bg-teal-500/10"
                      : isDark
                        ? "border-gray-700 hover:bg-gray-800"
                        : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                      bgTertiary,
                    )}
                  >
                    {dmo.logoPath ? (
                      <img
                        src={dmo.logoPath}
                        alt={dmo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2
                        className={clsx(
                          "w-4 h-4",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        "text-sm font-medium truncate",
                        selected
                          ? "text-teal-600"
                          : isDark
                            ? "text-gray-200"
                            : "text-gray-800",
                      )}
                    >
                      {dmo.name}
                    </p>
                    <p
                      className={clsx("text-xs truncate mt-0.5", textTertiary)}
                    >
                      {t("authorities_count", {
                        count: dmo.authorityCount ?? 0,
                      })}
                    </p>
                  </div>
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      selected
                        ? "border-teal-500 bg-teal-500"
                        : isDark
                          ? "border-gray-600"
                          : "border-gray-300",
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {errors.dmoIds && (
        <p className="text-xs text-red-500 mt-1">{errors.dmoIds}</p>
      )}
    </div>
  );
}
