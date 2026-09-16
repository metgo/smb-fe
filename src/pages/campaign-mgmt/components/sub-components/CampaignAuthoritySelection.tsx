import clsx from "clsx";
import { Landmark, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";

interface CampaignAuthoritySelectionProps {
  selectedDmoIds: string[];
  selectedAuthorityIds: string[];
  onChange: (ids: string[]) => void;
  errors: Record<string, string>;
}

export default function CampaignAuthoritySelection({
  selectedDmoIds,
  selectedAuthorityIds,
  onChange,
  errors,
}: CampaignAuthoritySelectionProps) {
  const { t } = useTranslation("campaign");
  const { textSecondary, textTertiary, bgTertiary, isDark } = useThemeClasses();
  const { dmosAuthorities } = useCommon();

  const authorities = useMemo(() => {
    if (!dmosAuthorities?.length || !selectedDmoIds.length) return [];
    return dmosAuthorities
      .filter((dmo) => selectedDmoIds.includes(dmo._id))
      .flatMap((dmo) =>
        (dmo.authorities ?? []).map((authority: any) => ({
          ...authority,
          dmoName: dmo.name,
        })),
      );
  }, [dmosAuthorities, selectedDmoIds]);

  const toggle = (id: string) => {
    if (selectedAuthorityIds.includes(id)) {
      onChange(selectedAuthorityIds.filter((a) => a !== id));
    } else {
      onChange([...selectedAuthorityIds, id]);
    }
  };

  const toggleAll = () => {
    if (!authorities.length) return;
    const allIds = authorities.map((a) => a._id);
    if (allIds.every((id) => selectedAuthorityIds.includes(id))) {
      onChange(selectedAuthorityIds.filter((id) => !allIds.includes(id)));
    } else {
      onChange(Array.from(new Set([...selectedAuthorityIds, ...allIds])));
    }
  };

  const allSelected =
    authorities.length > 0 &&
    authorities.every((a) => selectedAuthorityIds.includes(a._id));

  return (
    <div className="space-y-4">
      <div>
        <p className={clsx("text-sm font-medium mb-1", textSecondary)}>
          {t("select_authorities")}
        </p>
        <p className={clsx("text-xs mb-4", textTertiary)}>
          {t("select_authorities_hint")}
        </p>
      </div>

      {!selectedDmoIds.length ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Landmark
            className={clsx(
              "w-10 h-10",
              isDark ? "text-gray-600" : "text-gray-300",
            )}
          />
          <p className={clsx("text-sm", textTertiary)}>
            {t("select_dmos_first")}
          </p>
        </div>
      ) : !authorities.length ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Landmark
            className={clsx(
              "w-10 h-10",
              isDark ? "text-gray-600" : "text-gray-300",
            )}
          />
          <p className={clsx("text-sm", textTertiary)}>
            {t("no_authorities_found")}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className={clsx("text-xs", textTertiary)}>
              {t("selected_count", {
                count: selectedAuthorityIds.filter((id) =>
                  authorities.some((a) => a._id === id),
                ).length,
                total: authorities.length,
              })}
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-teal-500 hover:text-teal-400 cursor-pointer"
            >
              {allSelected ? t("deselect_all") : t("select_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {authorities.map((authority) => {
              const selected = selectedAuthorityIds.includes(authority._id);
              return (
                <button
                  key={authority._id}
                  type="button"
                  onClick={() => toggle(authority._id)}
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
                    {authority.logoPath ? (
                      <img
                        src={authority.logoPath}
                        alt={authority.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Landmark
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
                      {authority.name}
                    </p>
                    <p
                      className={clsx("text-xs truncate mt-0.5", textTertiary)}
                    >
                      {authority.dmoName}
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

      {errors.authorityIds && (
        <p className="text-xs text-red-500 mt-1">{errors.authorityIds}</p>
      )}
    </div>
  );
}
