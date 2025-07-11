"use client";

import { useEffect, useRef, useState } from "react";

import { categoryBgClasses } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import { LeftAngleArrow, RightAngleArrow } from "@/components/ui/icons";
import { getAllSubCategory } from "@/actions/businessActions";
import { misc } from "@/constant/hebrew";
import { IconImage } from "../ui";

const scrollAmount = 150;

const SubcategoryFilterPanel = () => {
  const { activeCategoryKey } = useGeneralStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { handleSubcategoryChange, activeSubCategory } = useCtgSubctg();
  const [subCategories, setSubCategories] = useState<BusienssSubcategoryProps>(
    [],
  );

  useEffect(() => {
    if (activeCategoryKey !== "") {
      async function fetchSubCategory() {
        const res = await getAllSubCategory(activeCategoryKey);
        setSubCategories(res);
      }
      fetchSubCategory();
    }
  }, [activeCategoryKey]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (activeCategoryKey === "" || subCategories?.length === 0) return;

  return (
    <div className="max-w-[1008px] bg-[#FAFAFA]/80 backdrop-blur border border-white/20 shadow-md p-2.5 rounded-2xl z-50">
      <div className="flex items-center gap-2.5 cursor-pointer">
        <div className="px-4 py-2.5 rounded-xl border border-theme flex items-center gap-2">
          <IconImage icon="filter" />
          <span className="text-theme font-bold">{misc.filter}</span>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={scrollLeft}
            className="border border-theme bg-white p-1 rounded-full cursor-pointer"
          >
            <RightAngleArrow />
          </button>
          <div className="max-w-3xl overflow-hidden px-2.5">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2.5 overflow-x-auto flex-nowrap hide-scrollbar scroll-smooth pe-4"
            >
              {subCategories?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSubcategoryChange(item.id)}
                  className={`${
                    activeSubCategory === item.id
                      ? `${categoryBgClasses[activeCategoryKey]} text-white`
                      : "bg-white text-theme"
                  } cursor-pointer px-5 py-3 rounded-[34px] font-bold text-sm whitespace-nowrap shrink-0 h-[36px] flex items-center justify-center`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollRight}
            className="border border-theme bg-white rounded-full p-1 cursor-pointer -ms-4"
          >
            <LeftAngleArrow />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryFilterPanel;
