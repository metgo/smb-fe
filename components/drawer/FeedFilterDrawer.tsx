"use client";

import clsx from "clsx";
import { MotionDialogDiv } from "../ui";
import { filterPanelLabels } from "@/constant/hebrew";
import { useGetAllCategorySites } from "@/hooks/useGetAllCategorySites";

import {
  CloseIcon,
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
} from "../ui/svgIcons";
import { filterCategories, ICON_MAP, SERVICE_TYPE_MAP } from "@/lib/utils";
import { useCommonHook } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import { SunsetButton } from "../filter-icon/SunsetButton";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import { IdentifierId } from "@/constant/envConstants";

interface FeedFilterDrawerProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  itemCount: number;
  filters: FiltersResponse;
  appliedFilterCount: number;
  isSelected: (key: any, value: string) => boolean;
  toggleParam: (key: any, value: string) => void;
  handleResetFilters: () => void;
  filteredSubCategories: SubCategory[];
}

const FeedFilterDrawer: React.FC<FeedFilterDrawerProps> = ({
  isOpen,
  setIsOpen,
  itemCount,
  filters,
  appliedFilterCount,
  isSelected,
  toggleParam,
  handleResetFilters,
  filteredSubCategories,
}) => {
  const { isMobile } = useCommonHook();
  const { aminitiesInfo } = useGeneralStore();
  const { data, isLoading, isError } = useGetAllCategorySites();

  if (!isOpen || isMobile) return null;

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/10 z-10 custom-cursor"
      />

      {/* DRAWER */}
      <MotionDialogDiv
        type="drawer-right"
        onClick={(e) => e.stopPropagation()}
        className="
        fixed bottom-0 z-10
        w-full
        sm:max-w-[200px]
        md:max-w-[300px]
        lg:max-w-[400px]
        bg-white shadow-xl flex flex-col h-screen
      "
      >
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[90vh] px-5 z-50">
          {/* MAIN CATEGORIES & SERVICE TYPES */}
          <div className="border-b border-primary py-3 mt-20">
            <div
              className="w-full relative flex items-center justify-end mb-2 custom-cursor"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </div>

            <div className="flex justify-between items-center px-2  pb-2 flex-shrink-0">
              <div className="font-bold text-theme">
                {filterPanelLabels.main}
              </div>
              <h2 className="text-lg font-bold">
                <span>{itemCount}</span>{" "}
                <span>{filterPanelLabels.results}</span>
              </h2>
            </div>
            <div className="grid grid-cols-12 gap-x-1 gap-y-2 mt-2">
              {/* Point of Interest */}

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
              <div className="border-b border-primary py-3">
                {data?.siteTopics?.map((topic: any) => {
                  const topicSubCategories = filteredSubCategories.filter(
                    (item) =>
                      topic.siteCategories?.some((cat: any) =>
                        cat.subCategories?.some(
                          (sub: any) => sub._id === item._id,
                        ),
                      ),
                  );

                  if (!topicSubCategories.length) return null;

                  return (
                    <div key={topic.title} className="mb-4">
                      <div className="font-bold text-theme mb-1">
                        {topic.title}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {topicSubCategories.map((item) => (
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
                  );
                })}
              </div>
              {/* Main Categories */}
              {/* {filterCategories?.map((menu) => {
                const Icon = ICON_MAP[menu._id];
                return (
                  <FilterButton
                    key={menu._id}
                    active={isSelected("categoryIds", menu._id)}
                    onClick={() => {
                      toggleParam("categoryIds", menu._id);
                      sendGAEvent(triggerName.clickToCategory, {
                        category_id: menu._id,
                        category_name: menu.hebrewName,
                      });
                    }}
                    icon={Icon && <Icon strokColor="#7c7c7c" />}
                    activeIcon={Icon && <Icon strokColor="#fff" />}
                    label={menu.hebrewName}
                  />
                );
              })} */}

              {/* Funday */}
              {aminitiesInfo?.funday && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.fun_day)}
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

              {/* Events */}
              {aminitiesInfo?.event && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.event)}
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

              {/* Routes */}
              {aminitiesInfo?.trip && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.route)}
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

          {/* SUBCATEGORIES */}
          {filteredSubCategories && filteredSubCategories.length > 0 && (
            <div className="border-b border-primary py-3">
              <div className="font-bold text-theme">
                {filterPanelLabels.second}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredSubCategories?.map((item) => (
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

          {/* ACCESSIBILITY */}
          <div className="border-b border-primary py-3">
            <div className="font-bold text-theme">
              {filterPanelLabels.accessibility}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters?.accessibilities?.map((item) => (
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

          {/* TARGET AUDIENCE (Group Types) */}
          <div className="border-b border-primary py-3">
            <div className="font-bold text-theme">
              {filterPanelLabels.targetAudiences}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters?.groupTypes?.map((item) => (
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
        </div>

        {/* CLOSE BUTTON */}
        <div className=" shrink-0 flex items-center justify-between px-4 mt-4">
          <div
            onClick={() => setIsOpen(false)}
            className="relative custom-cursor"
          >
            <SunsetButton
              size={50}
              variant={"black"}
              appliedFilterCount={appliedFilterCount}
            />
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={appliedFilterCount === 0}
            className={clsx(
              appliedFilterCount === 0
                ? "cursor-not-allowed text-black/30 "
                : "custom-cursor bg-black/80 text-white font-bold hover:bg-black ",
              " border border-black/20 items-center font-bold text-lightGray rounded-xl px-12 py-2",
            )}
          >
            {filterPanelLabels.clearAll}
          </button>
        </div>
      </MotionDialogDiv>
    </>
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
    className={`md:col-span-6 max-sm:col-span-4 sm:col-span-12 lg:col-span-4 custom-cursor flex items-center justify-start gap-2 border border-theme rounded-3xl ps-3 h-[42px] transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {active ? activeIcon : icon}
    <span className="text-[12px] font-bold">{label}</span>
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
    className={`custom-cursor px-5 h-[42px] flex items-center justify-center rounded-3xl text-[12px] font-bold border border-theme transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {label}
  </span>
);

export default FeedFilterDrawer;
