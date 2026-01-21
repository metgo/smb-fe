"use client";

import clsx from "clsx";
import { useState } from "react";
import { MotionDialogDiv } from "../ui";
import { filterPanelLabels } from "@/constant/hebrew";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloseIcon,
  DownAngleArrowIcon,
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
  UpAngleArrowIcon,
} from "../ui/svgIcons";
import { filterCategories, ICON_MAP, SERVICE_TYPE_MAP } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { SunsetButton } from "../filter-icon/SunsetButton";

interface MobileFeedFilterDrawerProps {
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

const MobileFeedFilterDrawer: React.FC<MobileFeedFilterDrawerProps> = ({
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
  const { aminitiesInfo } = useGeneralStore();
  const [showAllFilters, setShowAllFilters] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-50 custom-cursor"
      />

      {/* DRAWER */}
      <MotionDialogDiv
        type="drawer-bottom"
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 w-full bg-white flex flex-col shadow-2xl",
          showAllFilters ? "h-[calc(100dvh-65px)]" : "max-h-max",
        )}
      >
        {/* SHEET HANDLER */}
        <div className="w-full flex justify-center items-center pt-4 relative">
          <button
            type="button"
            onClick={() => setShowAllFilters((prev) => !prev)}
            className="transition-transform duration-300"
          >
            {showAllFilters ? <DownAngleArrowIcon /> : <UpAngleArrowIcon />}
          </button>
        </div>

        {/* HEADER */}

        <div
          className=" absolute left-4 top-4  custom-cursor"
          onClick={() => setIsOpen(false)}
        >
          <CloseIcon />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[80vh] px-5 z-50">
          {/* MAIN CATEGORIES & SERVICE TYPES */}
          <div className="border-b border-primary py-3">
            <div className="flex items-center justify-between">
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
                  onClick={() =>
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.poi)
                  }
                  icon={<PointOfInterestIcon strokColor="#7c7c7c" />}
                  activeIcon={<PointOfInterestIcon strokColor="#fff" />}
                  label={filterPanelLabels.pointOfInterest}
                />
              )}

              {/* Main Categories */}
              {filterCategories?.map((menu) => {
                const Icon = ICON_MAP[menu._id];
                return (
                  <FilterButton
                    key={menu._id}
                    active={isSelected("categoryIds", menu._id)}
                    onClick={() => toggleParam("categoryIds", menu._id)}
                    icon={Icon && <Icon strokColor="#7c7c7c" />}
                    activeIcon={Icon && <Icon strokColor="#fff" />}
                    label={menu.hebrewName}
                  />
                );
              })}

              {/* Funday */}
              {aminitiesInfo?.funday && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.fun_day)}
                  onClick={() =>
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day)
                  }
                  icon={<FundayIcon strokColor="#7c7c7c" />}
                  activeIcon={<FundayIcon strokColor="#fff" />}
                  label={filterPanelLabels.funDays}
                />
              )}

              {/* Events */}
              {aminitiesInfo?.event && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.event)}
                  onClick={() =>
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.event)
                  }
                  icon={<EventIcon strokColor="#7c7c7c" />}
                  activeIcon={<EventIcon strokColor="#fff" />}
                  label={filterPanelLabels.events}
                />
              )}

              {/* Routes */}
              {aminitiesInfo?.trip && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.route)}
                  onClick={() =>
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.route)
                  }
                  icon={<RouteIcon strokColor="#7c7c7c" />}
                  activeIcon={<RouteIcon strokColor="#fff" />}
                  label={filterPanelLabels.routes}
                />
              )}
            </div>
          </div>

          <AnimatePresence>
            {showAllFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0,
                  ease: "easeInOut",
                }}
                className="overflow-hidden"
              >
                <>
                  {/* SUBCATEGORIES */}
                  {filteredSubCategories &&
                    filteredSubCategories?.length > 0 && (
                      <div className="border-b border-primary py-3">
                        <div className="font-bold text-theme">
                          {filterPanelLabels.second}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {filteredSubCategories.map((item) => (
                            <FilterChip
                              key={item._id}
                              active={isSelected("subCategoryIds", item._id)}
                              onClick={() =>
                                toggleParam("subCategoryIds", item._id)
                              }
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
                          onClick={() =>
                            toggleParam("accessibilityIds", item._id)
                          }
                          label={item.hebrewName}
                        />
                      ))}
                    </div>
                  </div>

                  {/* TARGET AUDIENCE */}
                  <div className="border-b border-primary py-3">
                    <div className="font-bold text-theme">
                      {filterPanelLabels.targetAudiences}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters?.groupTypes?.map((item) => (
                        <FilterChip
                          key={item._id}
                          active={isSelected("groupTypeIds", item._id)}
                          onClick={() => toggleParam("groupTypeIds", item._id)}
                          label={item.hebrewName}
                        />
                      ))}
                    </div>
                  </div>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CLOSE BUTTON */}
        <div className=" flex-shrink-0 flex items-center justify-between px-4 gap-4 mt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="relative custom-cursor"
          >
            <SunsetButton
              size={46}
              variant={"continuous"}
              appliedFilterCount={appliedFilterCount}
            />
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={appliedFilterCount === 0}
            className={clsx(
              appliedFilterCount === 0
                ? "cursor-not-allowed text-black/30 "
                : "custom-cursor bg-black/80 text-white font-bold hover:bg-black ",
              " border border-black/20 items-center font-bold text-lightGray rounded-xl  w-full py-2",
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

export default MobileFeedFilterDrawer;
