"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { urls } from "@/lib/endpoints";
import { filterLabels } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import { FilterTypeHeader, IconImage, MotionDialogDiv } from "../ui";
import clsx from "clsx";

const parseCommaParam = (param: string | null): string[] =>
  param ? param.split(",").filter(Boolean) : [];

const toggleIdInList = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((i) => i !== id) : [...list, id];

const FilterDrawer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { groupTypes, setGroupTypes, accessibilities, setAccessibilities } =
    useGeneralStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activePreference, setActivePreference] = useState(false);
  const [activeTargetAudiace, setActiveTargetAudiance] = useState(false);

  const [selectedGroupTypeIds, setSelectedGroupTypeIds] = useState<string[]>(
    parseCommaParam(searchParams.get("groupTypesId")),
  );
  const [selectedAccessibilityIds, setSelectedAccessibilityIds] = useState<
    string[]
  >(parseCommaParam(searchParams.get("accessibilitiesId")));

  const fetchFiltersData = async () => {
    try {
      const [groupRes, accessRes] = await Promise.all([
        fetch(urls.groupTypes),
        fetch(urls.accessibilities),
      ]);

      const [groupData, accessData] = await Promise.all([
        groupRes.json(),
        accessRes.json(),
      ]);
      const formattedGroupTypes = groupData?.data?.map((item: any) => ({
        _id: item._id,
        name: item.name,
      }));
      const formattedAccessibilities = accessData?.data?.map((item: any) => ({
        _id: item._id,
        name: item.name,
      }));

      setGroupTypes(formattedGroupTypes);
      setAccessibilities(formattedAccessibilities);
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
    }
  };

  useEffect(() => {
    if (accessibilities.length === 0 || groupTypes.length === 0)
      fetchFiltersData();
  }, [accessibilities, groupTypes, isOpen]);

  function handleGroupToggle(id: string) {
    setSelectedGroupTypeIds((prev) => toggleIdInList(prev, id));
  }

  function handleAccessToggle(id: string) {
    setSelectedAccessibilityIds((prev) => toggleIdInList(prev, id));
  }

  function handleResetFilters() {
    setSelectedGroupTypeIds([]);
    setSelectedAccessibilityIds([]);
    // Reset searchParams
    const current = new URLSearchParams(searchParams.toString());
    current.delete("groupTypesId");
    current.delete("accessibilitiesId");
    current.delete("vendorDelivery");
    current.delete("minPrice");
    current.delete("maxPrice");

    router.push(`?${current.toString()}`);
  }

  return (
    <>
      {/* Trigger button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-4 py-2.5 rounded-xl border border-theme flex items-center gap-2 custom-cursor"
      >
        <IconImage icon="filter" />
        <span className="text-theme font-bold">{filterLabels.filter}</span>
      </div>

      {/* Drawer via portal */}
      {isOpen &&
        createPortal(
          <MotionDialogDiv
            type="drawer-bottom"
            className="fixed inset-0 z-[9999] w-[395px] h-full bg-white shadow-xl px-5 py-7.5 overflow-y-auto dialog-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{filterLabels.filter}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-black bg-primary rounded-full p-2 text-2xl custom-cursor w-10 h-10 flex items-center justify-center"
              >
                <span>x</span>
              </button>
            </div>

            <div>
              {/* Preferences */}
              <div className="border-b border-primary pb-3">
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
                        onClick={() => handleAccessToggle(item._id)}
                        className={`custom-cursor py-2 px-4 rounded-3xl ${
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

              {/* Traget Audience */}
              <div className="border-b border-primary py-3">
                <FilterTypeHeader
                  activeTitle={activeTargetAudiace}
                  title={filterLabels.targetAudiences}
                  setActiveTitle={setActiveTargetAudiance}
                />
                {activeTargetAudiace && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {groupTypes.map((item) => (
                      <span
                        key={item._id}
                        onClick={() => handleGroupToggle(item._id)}
                        className={`custom-cursor py-2 px-4 rounded-3xl ${
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

              <div className="w-full">
                <div className="w-full h-1 bg-gray mb-4" />
                <div className="px-8 text-center pb-8">
                  <button
                    type="button"
                    onClick={() => {}}
                    className={clsx(
                      "bg-lightGray text-white font-bold px-34 py-2 rounded-xl custom-cursor",
                    )}
                  >
                    {filterLabels.show}
                  </button>
                  <div
                    onClick={handleResetFilters}
                    className="custom-cursor hover:underline hover:bg-gray w-full items-center py-3 font-bold text-lightGray"
                  >
                    {filterLabels.clearEverything}
                  </div>
                </div>
              </div>
            </div>
          </MotionDialogDiv>,
          document.body,
        )}
    </>
  );
};

export default FilterDrawer;
