"use client";

import clsx from "clsx";
import Image from "next/image";

import { categoryIcons } from "@/lib/utils";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import useCategoryStore from "@/stores/categoriesStore";
import { triggerName, sendGAEvent } from "@/lib/googleEventsConfig";

const CategoryPanel = () => {
  const { handleCategoryChange, activeCategoryKey } = useCtgSubctg();
  const { categories } = useCategoryStore();

  return (
    <div className="bg-[#FAFAFAE6] backdrop-blur-md border border-white/20 shadow-md items-center justify-center gap-2.5 p-2.5 rounded-2xl max-sm:hidden md:flex">
      {categories?.map((item) => {
        const category = categoryIcons[item.id as any];
        const isActive = activeCategoryKey === item.id;
        const iconSrc = isActive ? item.activeIcon : item.icon;
        return (
          <div
            key={item.id}
            onClick={() => {
              handleCategoryChange(item.id);
              sendGAEvent(triggerName.clickToCategory, {
                category_id: item.id,
                category_name: item.name,
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

export default CategoryPanel;
