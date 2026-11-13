"use client";

import clsx from "clsx";
import { createPortal } from "react-dom";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { urls } from "@/lib/endpoints";
import { filterLabels } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { getFilterTypes } from "@/actions/feedActions";
import { FilterTypeHeader, IconImage, MotionDialogDiv } from "../ui";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

const parseCommaParam = (param: string | null): string[] =>
  param ? param.split(",").filter(Boolean) : [];

const toggleIdInList = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((i) => i !== id) : [...list, id];

const FilterDrawer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  const {
    groupTypes,
    setGroupTypes,
    accessibilities,
    setAccessibilities,
    appliedFilterItemCount,
  } = useGeneralStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterApplied, setIsFilerApplied] = useState(false);
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [activePreference, setActivePreference] = useState(true);
  const [activeTargetAudience, setActiveTargetAudience] = useState(true);

  const [selectedGroupTypeIds, setSelectedGroupTypeIds] = useState<string[]>(
    parseCommaParam(searchParams.get("groupTypesIds")),
  );
  const [selectedAccessibilityIds, setSelectedAccessibilityIds] = useState<
    string[]
  >(parseCommaParam(searchParams.get("accessibilitiesIds")));

  const totalAppliedFilters = useMemo(
    () => selectedGroupTypeIds.length + selectedAccessibilityIds.length,
    [selectedGroupTypeIds, selectedAccessibilityIds],
  );

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      if (groupTypes.length === 0) {
        const res = await getFilterTypes(urls.groupTypes);
        setGroupTypes(res);
      }
      if (accessibilities.length === 0) {
        const res = await getFilterTypes(urls.accessibilities);
        setAccessibilities(res);
      }
    }
    fetchData();
  }, [isOpen, groupTypes, accessibilities, setGroupTypes, setAccessibilities]);

  useEffect(() => {
    setAppliedFilterCount(0);
    setSelectedAccessibilityIds([]);
    setSelectedGroupTypeIds([]);
  }, [categoryId]);

  const handleGroupToggle = (id: string) =>
    setSelectedGroupTypeIds((prev) => toggleIdInList(prev, id));

  const handleAccessToggle = (id: string) =>
    setSelectedAccessibilityIds((prev) => toggleIdInList(prev, id));

  const updateQueryParams = (params: Record<string, string[]>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value.length > 0) {
        current.set(key, value.join(","));
      } else {
        current.delete(key);
      }
    });

    router.push(`?${current.toString()}`);
  };

  function handleResetFilters() {
    if (isFilterApplied) startLoading();
    setIsFilerApplied(false);
    setSelectedGroupTypeIds([]);
    setSelectedAccessibilityIds([]);
    setAppliedFilterCount(0);
    updateQueryParams({ groupTypesIds: [], accessibilitiesIds: [] });
    sendGAEvent(triggerName.clickToFilterResetBtn, { label: "reset_filters" });
  }

  function handleApplyFilter() {
    startLoading();
    setIsLoading(true);
    setAppliedFilterCount(totalAppliedFilters);
    updateQueryParams({
      groupTypesIds: selectedGroupTypeIds,
      accessibilitiesIds: selectedAccessibilityIds,
    });

    setIsOpen(false);
    setIsLoading(false);
    setIsFilerApplied(true);
  }

  return (
    <>
      {/* Trigger button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-4 py-2.5 rounded-xl border border-theme flex items-center gap-2 custom-cursor"
      >
        <IconImage icon="filter" />
        <span className="text-theme font-bold">
          {filterLabels.filter}
          {appliedFilterCount > 0 && ` (${appliedFilterCount})`}
        </span>
      </div>

      {/* Drawer */}
      {isOpen &&
        createPortal(
          <MotionDialogDiv
            type="drawer-bottom"
            onClick={(e) => e.stopPropagation()}
            className=" fixed inset-x-0 bottom-0 z-99 w-full sm:max-w-[200px] md:max-w-[300px] lg:max-w-100 bg-white shadow-xl flex flex-col "
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{filterLabels.filter}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-black bg-primary rounded-full p-2 text-2xl custom-cursor w-10 h-10 flex items-center justify-center"
              >
                <IconImage icon="close-black" />
              </button>
            </div>

            <section className="flex flex-col items-center justify-between h-[84vh] w-full mt-4">
              <div className="overflow-y-scroll h-[80vh] w-full">
                {/* Preferences */}
                <div className="border-b border-primary pb-3 w-full">
                  <FilterTypeHeader
                    activeTitle={activePreference}
                    title={filterLabels.preferences}
                    setActiveTitle={setActivePreference}
                  />
                  {activePreference && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {accessibilities.map((item) => (
                        <span
                          key={item._id}
                          onClick={() => {
                            handleAccessToggle(item._id);
                            sendGAEvent(triggerName.clickToAccessibility, {
                              accessibility_id: item._id,
                              accessibility_name: item.name,
                            });
                          }}
                          className={`custom-cursor py-1.5 px-4 rounded-3xl text-sm ${
                            selectedAccessibilityIds.includes(item._id)
                              ? "bg-black text-white font-bold"
                              : "bg-primary text-black font-normal"
                          }`}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                <div className="border-b border-primary py-3 w-full">
                  <FilterTypeHeader
                    activeTitle={activeTargetAudience}
                    title={filterLabels.targetAudiences}
                    setActiveTitle={setActiveTargetAudience}
                  />
                  {activeTargetAudience && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {groupTypes.map((item) => (
                        <span
                          key={item._id}
                          onClick={() => {
                            handleGroupToggle(item._id);
                            sendGAEvent(triggerName.clickToGroupType, {
                              group_type_id: item._id,
                              group_type_name: item.name,
                            });
                          }}
                          className={`custom-cursor py-1.5 px-4 rounded-3xl text-sm ${
                            selectedGroupTypeIds.includes(item._id)
                              ? "bg-black text-white font-bold"
                              : "bg-primary text-black font-normal"
                          }`}
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="w-full">
                <div className="px-8 text-center">
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    disabled={isLoading || totalAppliedFilters === 0}
                    className={clsx(
                      isLoading || totalAppliedFilters === 0
                        ? "bg-lightGray cursor-not-allowed"
                        : "bg-black  custom-cursor",
                      "text-white font-bold w-68 py-2 rounded-xl",
                    )}
                  >
                    {appliedFilterCount
                      ? `הצג ${appliedFilterItemCount} תוצאות`
                      : filterLabels.show}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    disabled={isLoading || totalAppliedFilters === 0}
                    className={clsx(
                      isLoading || totalAppliedFilters === 0
                        ? "cursor-not-allowed "
                        : "custom-cursor ",
                      "hover:underline hover:text-black w-full items-center font-bold text-lightGray mt-4",
                    )}
                  >
                    {filterLabels.clearEverything}
                  </button>
                </div>
              </div>
            </section>
          </MotionDialogDiv>,
          document.body,
        )}
    </>
  );
};

export default FilterDrawer;
