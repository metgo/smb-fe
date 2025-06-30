"use client";

import { useEffect, useRef, useState } from "react";

import { categoryBgClasses } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import {
  FilterIcon,
  LeftAngleArrow,
  RightAngleArrow,
} from "@/components/ui/icons";
import { getAllSubCategory } from "@/actions/businessActions";

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

  console.log("---------subCategories", subCategories);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (activeCategoryKey === "" || subCategories?.length === 0) return;

  return (
    <div className="max-w-5xl bg-white/80 backdrop-blur-md border border-white/20 shadow-md p-2.5 rounded-2xl z-50">
      <div className="flex items-center gap-2.5">
        <div className="px-4 py-2.5 rounded-xl border border-theme flex items-center gap-2">
          <FilterIcon />
          <span>מסננים</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={scrollLeft}
            className="border border-theme rounded-full p-1 cursor-pointer"
          >
            <RightAngleArrow />
          </button>
          <div className="max-w-3xl overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2.5 overflow-x-auto flex-nowrap hide-scrollbar scroll-smooth"
            >
              {subCategories?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSubcategoryChange(item.id)}
                  className={`${
                    activeSubCategory === item.id
                      ? `${categoryBgClasses[activeCategoryKey]} text-white`
                      : "bg-white"
                  } cursor-pointer px-5 py-3 rounded-4xl font-bold text-sm whitespace-nowrap shrink-0`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollRight}
            className="border border-theme rounded-full p-1 cursor-pointer"
          >
            <LeftAngleArrow />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryFilterPanel;
