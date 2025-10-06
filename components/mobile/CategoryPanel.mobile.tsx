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
    <div className="bg-white shadow-md flex items-center justify-center gap-2.5 px-2.5 py-4 h-24">
      {categories?.map((item) => {
        const category = categoryIcons[item.id as any];
        const isActive = activeCategoryKey === item.id;
        const iconSrc = isActive ? item.activeIcon : item.icon;
        return (
          <div
            key={item.id}
            onClick={() => {
              handleCategoryChange(item.id);
              googleSendGtmEvent(triggerName.clickToCategory, {
                categoryId: item.id,
                categoryName: item.name,
              });
            }}
            className={clsx(
              "w-16.5 h-16.5 flex items-center flex-col gap-2 p-1 rounded-lg transition-colors custom-cursor",
              isActive
                ? `${category?.bg} text-white font-bold`
                : " font-normal text-theme",
            )}
          >
            <Image
              alt={item.name}
              width={30}
              height={30}
              src={`/images/category/${iconSrc}.svg`}
              className="custom-cursor hover:opacity-80 transition-opacity duration-200"
            />
            <div className="text-sm">{item.name}</div>
          </div>
        );
      })}
    </div>
  );
};
export default MobileCategoryPanel;
