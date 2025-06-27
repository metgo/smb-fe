"use client";

import clsx from "clsx";
import { categoryIcons } from "@/lib/utils";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";

const CategoryPanel = ({ categories }: { categories: BusinessCategoryProps }) => {

  const {handleCategoryChange,activeCategoryKey }=useCtgSubctg()

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center gap-2.5 p-2.5 rounded-2xl">
      {categories?.map((item) => {
        const category = categoryIcons[item.id as any];
        const IconComponent = category?.icon;
        const isActive = activeCategoryKey === item.id;

        return (
          <div
            key={item.id}
            onClick={() => handleCategoryChange(item.id)}
            className={clsx(
              "w-16.5 h-16.5 flex items-center flex-col gap-2 p-1 rounded-lg transition-colors cursor-pointer",
              isActive ? `${category?.bg} text-white font-bold` : " font-normal"
            )}
          >
            {IconComponent && <IconComponent fill={isActive ? "#fff" : undefined} />}
            <div className="text-sm">{item.name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryPanel;
