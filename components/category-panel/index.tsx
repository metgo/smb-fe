"use client"

import clsx from "clsx";
import { categories } from "@/lib/utils";
import { useState } from "react";

const CategoryPanel = () => {
  const [activeCategory, setActiveCategory] = useState(1)
  return (
    <div className="w-full fixed bottom-4 right-0 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center gap-2.5 p-2.5 rounded-3xl">

        {categories.map(item => (
            <div
            key={item.id}
            onClick={() => setActiveCategory(item.id)}
            className={clsx(
              "w-16.5 h-16.5 flex items-center flex-col gap-2 p-1 cursor-pointer rounded-lg transition-colors",
              `${activeCategory === item.id ? `${item.bg} text-white font-bold` : " font-normal"}`
            )}
            >
            <item.icon fill={activeCategory === item.id ? "#fff" : undefined} />
            <div className="text-sm">{item.label}</div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPanel;
