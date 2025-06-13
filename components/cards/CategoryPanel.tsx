"use client"

import clsx from "clsx";
import { categories } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";

const CategoryPanel = () => {
  const { activeCategoryKey, setActiveCategoryKey } = useGeneralStore()

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center gap-2.5 p-2.5 rounded-2xl">

      {categories.map(item => (
        <div
          key={item.key}
          onClick={() => setActiveCategoryKey(item.key)}
          className={clsx(
            "w-16.5 h-16.5 flex items-center flex-col gap-2 p-1 cursor-pointer rounded-lg transition-colors",
            `${activeCategoryKey === item.key ? `${item.bg} text-white font-bold` : " font-normal"}`
          )}
        >
          <item.icon fill={activeCategoryKey === item.key ? "#fff" : undefined} />
          <div className="text-sm">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CategoryPanel;
