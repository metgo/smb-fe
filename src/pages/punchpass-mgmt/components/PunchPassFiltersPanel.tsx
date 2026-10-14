import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FilterChips from "@/components/shared/FilterChips";
import { FilterByStatus } from "@/components/filter-fields";
import { ReactSelect } from "@/components/form-fields";
import type { PunchPassFilters } from "../hooks/usePunchPassFilters";

interface PunchPassFiltersPanelProps {
  filters: PunchPassFilters;
  setFilters: (filters: PunchPassFilters) => void;
  hasSavedFilters: boolean;
  clearFilter: () => void;
  urlBusinessId: string | null;
  urlBusinessName: string | null;
  removeQueryParams: () => void;
  businesses: any[];
  searchBusiness: (query: string) => void;
  isSearching: boolean;
  isBusinessesLoading: boolean;
}

export function PunchPassFiltersPanel({
  filters,
  setFilters,
  hasSavedFilters,
  clearFilter,
  urlBusinessId,
  urlBusinessName,
  removeQueryParams,
  businesses,
  searchBusiness,
  isSearching,
  isBusinessesLoading,
}: PunchPassFiltersPanelProps) {
  const { t } = useTranslation("punch_pass");
  const { t: tb } = useTranslation("businesses");
  const { isDark, bgPrimary, borderColor, textTertiary } = useThemeClasses();

  const showFilterChips =
    filters.status !== "all" || filters.businessId !== "" || urlBusinessName;

  return (
    <div className={`rounded-md border py-2 px-3 ${borderColor} ${bgPrimary}`}>
      <div className="flex flex-wrap gap-3 items-start w-full">
        <FilterByStatus filters={filters} setFilters={setFilters} />

        {!urlBusinessId && (
          <div className="flex flex-col flex-1 min-w-35">
            <label
              className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("filter_by_business")}
            </label>
            <ReactSelect
              isClearable
              value={filters.businessId}
              onChange={(businessId: string) =>
                setFilters({ ...filters, businessId })
              }
              items={
                businesses?.map((item: any) => ({
                  _id: item._id,
                  name: item.name,
                })) ?? []
              }
              placeholder={t("select_business")}
              onSearch={searchBusiness}
              isLoading={isSearching || isBusinessesLoading}
            />
          </div>
        )}

        {showFilterChips && (
          <div className="flex flex-col w-full sm:w-auto">
            <label className={`block text-sm mb-1 ${textTertiary}`}>
              {tb("active_filters")}:
            </label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {filters.status !== "all" && (
                <FilterChips
                  label={t(filters.status)}
                  onRemove={() => setFilters({ ...filters, status: "all" })}
                />
              )}
              {urlBusinessId && urlBusinessName && (
                <FilterChips
                  label={urlBusinessName}
                  onRemove={removeQueryParams}
                />
              )}
              {filters.businessId && (
                <FilterChips
                  label={
                    businesses?.find((b: any) => b._id === filters.businessId)
                      ?.name || filters.businessId
                  }
                  onRemove={() => setFilters({ ...filters, businessId: "" })}
                />
              )}
              {hasSavedFilters && (
                <button
                  onClick={clearFilter}
                  className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
                >
                  {t("clear_all")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
