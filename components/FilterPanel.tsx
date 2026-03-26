import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { SunsetButton } from "./filter-icon/SunsetButton";
import { IconImage } from "./ui";
import {
  RouteIcon,
  EventIcon,
  CloseIcon,
  FundayIcon,
  PointOfInterestIcon,
} from "./ui/svgIcons";
import { SERVICE_TYPE_MAP } from "@/lib/utils";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

interface FilterPanelProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;

  filterPanelLabels: {
    searchText: string;
    results: string;
    main: string;
    pointOfInterest: string;
    funDays: string;
    events: string;
    routes: string;
    second: string;
    accessibility: string;
    targetAudiences: string;
    everything: string;
    business: string;
    products: string;
    clearAll: string;
  };

  searchText: { search: string };
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  handleClearInputText: () => void;

  itemCount: number;

  aminitiesInfo?: {
    poi?: boolean;
    funday?: boolean;
    event?: boolean;
    trip?: boolean;
  };

  categoriesSites?: {
    siteTopics?: Array<{
      title: string;
      siteCategories?: Array<{ title: string }>;
    }>;
  };

  isSelected: (paramKey: string, value: string) => boolean;
  toggleParam: (paramKey: string, value: string) => void;

  advancedFilter: boolean;
  setAdvancedFilter: (value: boolean) => void;

  filteredSubCategories?: Array<{ _id: string; hebrewName: string }>;

  filters?: {
    accessibilities?: Array<{ _id: string; hebrewName: string }>;
    groupTypes?: Array<{ _id: string; hebrewName: string }>;
  };

  displayMode: string;
  setDisplayMode: (mode: string) => void;

  appliedFilterCount: number;
  handleResetFilters: () => void;
}

const FilterPanel = ({
  isFilterOpen,
  setIsFilterOpen,
  filterPanelLabels,
  searchText,
  searchKeyword,
  setSearchKeyword,
  handleClearInputText,
  itemCount,
  aminitiesInfo,
  categoriesSites,
  isSelected,
  toggleParam,
  advancedFilter,
  setAdvancedFilter,
  filteredSubCategories,
  filters,
  displayMode,
  setDisplayMode,
  appliedFilterCount,
  handleResetFilters,
}: FilterPanelProps) => {
  return (
    <AnimatePresence>
      {isFilterOpen && (
        <motion.div
          key="inline-filter"
          initial={{ opacity: 0, x: 40, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 500 }}
          exit={{ opacity: 0, x: 40, width: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="sticky top-24 self-start shrink-0"
          style={{ width: 320 }}
        >
          <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <span className="font-bold text-lg text-theme">
                {filterPanelLabels.searchText}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {itemCount} {filterPanelLabels.results}
                </span>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="custom-cursor p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Scrollable filter body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Search input */}
              <div className="flex items-start justify-center py-7.5">
                <div className="max-sm:mx-4 max-sm:w-full md:w-[546px] h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
                  <IconImage icon="search" />
                  <input
                    type="text"
                    value={searchKeyword}
                    placeholder={searchText.search}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full outline-none border-none focus:ring-0"
                  />
                  {searchKeyword && (
                    <IconImage
                      height={18}
                      width={18}
                      icon="circular-close-white"
                      onClick={handleClearInputText}
                    />
                  )}
                </div>
              </div>

              {/* Main Categories & Service Types */}
              <div>
                <div className="font-bold text-theme mb-2">
                  {filterPanelLabels.main}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {aminitiesInfo?.poi && (
                    <FilterButton
                      active={isSelected("serviceTypes", SERVICE_TYPE_MAP.poi)}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.poi);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.pointOfInterest,
                        });
                      }}
                      icon={<PointOfInterestIcon strokColor="#7c7c7c" />}
                      activeIcon={<PointOfInterestIcon strokColor="#fff" />}
                      label={filterPanelLabels.pointOfInterest}
                    />
                  )}
                  {aminitiesInfo?.funday && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.fun_day,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.funDays,
                        });
                      }}
                      icon={<FundayIcon strokColor="#7c7c7c" />}
                      activeIcon={<FundayIcon strokColor="#fff" />}
                      label={filterPanelLabels.funDays}
                    />
                  )}
                  {aminitiesInfo?.event && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.event,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.event);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.events,
                        });
                      }}
                      icon={<EventIcon strokColor="#7c7c7c" />}
                      activeIcon={<EventIcon strokColor="#fff" />}
                      label={filterPanelLabels.events}
                    />
                  )}
                  {aminitiesInfo?.trip && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.route,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.route);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.routes,
                        });
                      }}
                      icon={<RouteIcon strokColor="#7c7c7c" />}
                      activeIcon={<RouteIcon strokColor="#fff" />}
                      label={filterPanelLabels.routes}
                    />
                  )}
                </div>
              </div>

              {/* Dynamic site topic categories */}
              {categoriesSites?.siteTopics?.map((topic) => (
                <div key={topic.title} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide mb-2 px-1">
                    {topic.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.siteCategories?.map((category) => (
                      <FilterButton
                        key={category.title}
                        active={isSelected("categoryIds", category.title)}
                        onClick={() => {
                          toggleParam("categoryIds", category.title);
                          sendGAEvent(triggerName.clickToCategory, {
                            category_id: category.title,
                            category_name: category.title,
                          });
                        }}
                        icon={null}
                        activeIcon={null}
                        label={category.title}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Advanced Search Toggle */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAdvancedFilter(!advancedFilter)}
                className="mb-8 px-4 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm font-medium mr-auto bg-white text-teal-600 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"
              >
                <span>חיפוש מתקדם</span>
                <motion.div
                  animate={{ rotate: advancedFilter ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Advanced filters (conditionally rendered) */}
              {advancedFilter && (
                <>
                  {/* Subcategories */}
                  {filteredSubCategories &&
                    filteredSubCategories.length > 0 && (
                      <div>
                        <div className="font-bold text-theme mb-2">
                          {filterPanelLabels.second}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {filteredSubCategories.map((item) => (
                            <FilterChip
                              key={item._id}
                              active={isSelected("subCategoryIds", item._id)}
                              onClick={() => {
                                toggleParam("subCategoryIds", item._id);
                                sendGAEvent(triggerName.clickToSubCategory, {
                                  subcategory_id: item._id,
                                  subcategory_name: item.hebrewName,
                                });
                              }}
                              label={item.hebrewName}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Accessibility */}
                  {filters?.accessibilities &&
                    filters.accessibilities.length > 0 && (
                      <div>
                        <div className="font-bold text-theme mb-2">
                          {filterPanelLabels.accessibility}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {filters.accessibilities.map((item) => (
                            <FilterChip
                              key={item._id}
                              active={isSelected("accessibilityIds", item._id)}
                              onClick={() => {
                                toggleParam("accessibilityIds", item._id);
                                sendGAEvent(triggerName.clickToAccessibility, {
                                  accessibility_id: item._id,
                                  accessibility_name: item.hebrewName,
                                });
                              }}
                              label={item.hebrewName}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Target Audience (Group Types) */}
                  {filters?.groupTypes && filters.groupTypes.length > 0 && (
                    <div>
                      <div className="font-bold text-theme mb-2">
                        {filterPanelLabels.targetAudiences}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filters.groupTypes.map((item) => (
                          <FilterChip
                            key={item._id}
                            active={isSelected("groupTypeIds", item._id)}
                            onClick={() => {
                              toggleParam("groupTypeIds", item._id);
                              sendGAEvent(triggerName.clickToGroupType, {
                                group_type_id: item._id,
                                group_type_name: item.hebrewName,
                              });
                            }}
                            label={item.hebrewName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display Mode */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold mb-3 text-right text-gray-600">
                      מה להציג?
                    </h3>
                    <div className="flex gap-1 rounded-xl p-0.5 w-fit bg-gray-100">
                      {(
                        [
                          { value: "", label: filterPanelLabels.everything },
                          {
                            value: "businesses",
                            label: filterPanelLabels.business,
                          },
                          {
                            value: "products",
                            label: filterPanelLabels.products,
                          },
                        ] as const
                      ).map(({ value, label }) => (
                        <motion.button
                          key={value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDisplayMode(value)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            displayMode === value
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <div
                onClick={() => setIsFilterOpen(false)}
                className="custom-cursor"
              >
                <SunsetButton
                  size={50}
                  variant="black"
                  appliedFilterCount={appliedFilterCount}
                />
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={appliedFilterCount === 0}
                className={clsx(
                  appliedFilterCount === 0
                    ? "cursor-not-allowed text-black/30"
                    : "custom-cursor bg-black/80 text-white font-bold hover:bg-black",
                  "border border-black/20 font-bold text-lightGray rounded-xl px-8 py-2 transition-colors",
                )}
              >
                {filterPanelLabels.clearAll}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// Reusable Filter Button (for icons)
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, activeIcon, label }) => (
  <div
    onClick={onClick}
    className={`custom-cursor flex items-center justify-start gap-2  border border-theme rounded-3xl ps-3 h-[42px] transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    <span className="mr-2">{active ? activeIcon : icon}</span>
    <span className="text-[12px] font-bold mr-2">{label}</span>
  </div>
);

// Reusable Filter Chip
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <span
    onClick={onClick}
    className={`custom-cursor px-4 h-[38px] flex items-center justify-center rounded-3xl text-[12px] font-bold border border-theme transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {label}
  </span>
);
export default FilterPanel;
