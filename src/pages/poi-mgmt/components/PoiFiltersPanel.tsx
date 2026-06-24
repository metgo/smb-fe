import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FilterChips from "@/components/shared/FilterChips";
import { FilterByStatus } from "@/components/filter-fields";
import type { PoiFilters } from "../hooks/usePoiFilters";

interface PoiFiltersPanelProps {
  filters: PoiFilters;
  setFilters: (filters: PoiFilters) => void;
  hasSavedFilters: boolean;
  clearFilter: () => void;
}

export function PoiFiltersPanel({
  filters,
  setFilters,
  hasSavedFilters,
  clearFilter,
}: PoiFiltersPanelProps) {
  const { t } = useTranslation("poi");
  const { isDark } = useThemeClasses();

  return (
    <div
      className={`border-t py-2 ${
        isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-wrap items-start gap-4 ml-4 w-full">
        <FilterByStatus filters={filters} setFilters={setFilters} />

        {hasSavedFilters && (
          <div className="flex flex-col min-w-45">
            <label
              className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("active_filters")}
            </label>
            <div className="flex gap-2 items-center">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(
                  ([key, value]) =>
                    value !== "all" && (
                      <FilterChips
                        key={key}
                        label={t(value.toLowerCase())}
                        onRemove={() =>
                          setFilters({ ...filters, [key]: "all" } as PoiFilters)
                        }
                      />
                    ),
                )}
              </div>
              <button
                onClick={clearFilter}
                className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
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
