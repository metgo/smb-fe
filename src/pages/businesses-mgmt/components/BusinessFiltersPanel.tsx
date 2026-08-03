import { useTranslation } from "react-i18next";

import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { BusinessFilters } from "../hooks/useBusinessFilters";
import { FilterByStatus, FilterByUnassigned } from "@/components/filter-fields";
import { useUserRoles } from "@/hooks/useUserRoles";

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
  const { isSuperadmin } = useUserRoles();

  return (
    <div
      data-tour="filter-panel"
      className={`border-t py-2 ${isHighlighted ? "z-10001 relative" : ""} ${
        isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3 px-3 w-full">
        <FilterByStatus filters={filters} setFilters={setFilters} />

        <div className="flex flex-col min-w-45">
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("has_products")}
          </label>
          <ReactSelect
            isClearable
            placeholder={t("has_products")}
            value={
              filters.hasProductFilter !== "all" ? filters.hasProductFilter : ""
            }
            onChange={(v) =>
              setFilters({
                ...filters,
                hasProductFilter: (v ||
                  "all") as BusinessFilters["hasProductFilter"],
              })
            }
            items={[
              { _id: "yes", name: t("yes") },
              { _id: "no", name: t("no") },
            ]}
            minWidth={160}
          />
        </div>

        {isSuperadmin && (
          <>
            <FilterByUnassigned
              label={t("dmo")}
              unassignedLabel={t("unassigned")}
              value={filters.dmoFilter}
              onChange={(v) => setFilters({ ...filters, dmoFilter: v })}
            />

            <FilterByUnassigned
              label={t("authority")}
              unassignedLabel={t("unassigned")}
              value={filters.authorityFilter}
              onChange={(v) => setFilters({ ...filters, authorityFilter: v })}
            />
          </>
        )}

        {hasSavedFilters && (
          <div className="flex flex-col w-full sm:w-auto">
            <label
              className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("active_filters")}
            </label>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={clearFilter}
                className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0 cursor-pointer"
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
