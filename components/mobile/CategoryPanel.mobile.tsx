"use client";

import clsx from "clsx";
import Image from "next/image";

import { categoryIcons } from "@/lib/utils";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import useCategoryStore from "@/stores/categoriesStore";
import { triggerName, googleSendGtmEvent } from "@/lib/googleEventsConfig";

const MobileCategoryPanel = () => {
  const { categories } = useCategoryStore();
  const { handleCategoryChange, activeCategoryKey } = useCtgSubctg();

  return (
    <div className="bg-white shadow-md flex items-center justify-center gap-2.5 py-2 px-0 h-20">
      {categories?.map((item) => {
        const category = categoryIcons[item.id as any];
        const isActive = activeCategoryKey === item.id;
        const iconSrc = isActive ? item.activeIcon : item.icon;

        return (
          <button
            key={item.id}
            onClick={() => {
              handleCategoryChange(item.id);
              googleSendGtmEvent(triggerName.clickToCategory, {
                categoryId: item.id,
                categoryName: item.name,
              });
            }}
            className={clsx(
              "aspect-square w-15.5 h-14 flex-shrink-0 flex flex-col items-center justify-center rounded-lg transition-colors duration-200 custom-cursor",
              isActive
                ? `${category?.bg} text-white font-bold`
                : " font-normal",
            )}
          >
            <Image
              alt={item.name}
              width={30}
              height={30}
              src={`/images/category/${iconSrc}.svg`}
              className="custom-cursor transition-opacity duration-204"
            />
            <div className="text-xs mt-1 text-center leading-tight">
              {item.name}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MobileCategoryPanel;
