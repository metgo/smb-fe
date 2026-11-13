"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { FilterDrawer } from "../drawer";
import { getPurposeType } from "@/lib/helpers";
import { categoryBgClasses } from "@/lib/utils";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import { getAllSubCategory } from "@/actions/feedActions";
import { LeftAngleArrow, RightAngleArrow } from "@/components/ui/icons";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

const scrollAmount = 150;

const SubcategoryFilterPanel = () => {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [subCategories, setSubCategories] = useState<BusienssSubcategoryProps>(
    [],
  );
  const { activeSubCategory, activeCategoryKey, handleSubcategoryChange } =
    useCtgSubctg();

  useEffect(() => {
    if (activeCategoryKey) {
      async function fetchSubcategory() {
        const purposeType = getPurposeType(pathname);
        const res = await getAllSubCategory(activeCategoryKey!, purposeType);
        setSubCategories(res);
      }
      fetchSubcategory();
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

  if (activeCategoryKey === null || subCategories?.length === 0) return;

  return (
    <div className="max-w-[1008px] bg-[#FAFAFA]/80 backdrop-blur border border-white/20 shadow-md p-2.5 rounded-2xl z-50 max-sm:hidden md:block">
      <div className="flex items-center gap-2.5">
        <FilterDrawer />

        <div className="flex items-center">
          <button
            type="button"
            onClick={scrollLeft}
            className="border border-theme bg-white p-1 rounded-full custom-cursor"
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
                  onClick={() => {
                    handleSubcategoryChange(item.id);
                    sendGAEvent(triggerName.clickToSubCategory, {
                      subCategoryId: item.id,
                      subCategoryName: item.name,
                    });
                  }}
                  className={`${
                    activeSubCategory === item.id
                      ? `${categoryBgClasses[activeCategoryKey!]} text-white`
                      : "bg-white text-theme"
                  } custom-cursor px-5 py-3 rounded-[34px] font-bold text-sm whitespace-nowrap shrink-0 h-[36px] flex items-center justify-center`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollRight}
            className="border border-theme bg-white rounded-full p-1 custom-cursor -ms-4"
          >
            <LeftAngleArrow />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryFilterPanel;
