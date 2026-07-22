import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FilterChips from "@/components/shared/FilterChips";
import { FilterByStatus } from "@/components/filter-fields";
import type { BusinessFilters } from "../hooks/useBusinessFilters";

interface BusinessFiltersPanelProps {
  filters: BusinessFilters;
  setFilters: (filters: BusinessFilters) => void;
  hasSavedFilters: boolean;
  clearFilter: () => void;
  isHighlighted?: boolean;
}

export function BusinessFiltersPanel({
  filters,
  setFilters,
  hasSavedFilters,
  clearFilter,
  isHighlighted,
}: BusinessFiltersPanelProps) {
  const { t } = useTranslation("businesses");
  const { isDark } = useThemeClasses();

  return (
    <div
      data-tour="filter-panel"
      className={`border-t py-2 ${isHighlighted ? "z-10001 relative" : ""} ${
        isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3 px-3 w-full">
        <FilterByStatus filters={filters} setFilters={setFilters} />

        <div className="flex flex-col flex-1 min-w-35">
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("has_products")}
          </label>
          <select
            value={filters.hasProductFilter}
            onChange={(e) =>
              setFilters({
                ...filters,
                hasProductFilter: e.target
                  .value as BusinessFilters["hasProductFilter"],
              })
            }
            className={`w-full px-2 py-1.5 text-sm rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="all">{t("all")}</option>
            <option value="yes">{t("yes")}</option>
            <option value="no">{t("no")}</option>
          </select>
        </div>

        {hasSavedFilters && (
          <div className="flex flex-col w-full sm:w-auto">
            <label
              className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("active_filters")}
            </label>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(filters).map(
                  ([key, value]) =>
                    value !== "all" && (
                      <FilterChips
                        key={key}
                        label={t(
                          value === "yes" || value === "no"
                            ? value
                            : value.toLowerCase(),
                        )}
                        onRemove={() =>
                          setFilters({
                            ...filters,
                            [key]: "all",
                          } as BusinessFilters)
                        }
                      />
                    ),
                )}
              </div>
              <button
                onClick={clearFilter}
                className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
              >
                {t("clear_all")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
