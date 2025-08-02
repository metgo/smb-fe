"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { categoryIcons } from "@/lib/utils";
import { useCtgSubctg } from "@/hooks/useCtgSubctg";
import { getAllCategory } from "@/actions/businessActions";
import useCategoryStore from "@/stores/categoriesStore";

const CategoryPanel = () => {
  const pathname = usePathname();
  const { handleCategoryChange, activeCategoryId, setActiveCategoryKey } =
    useCtgSubctg();
  const { categories, setCategories } = useCategoryStore();
  const hasEmptyName = categories.some((cat) => cat.name === "");

  useEffect(() => {
    if (hasEmptyName) {
      async function fetchCategories() {
        const res = await getAllCategory();
        const apiCategories = res?.data ? res?.data : res;
        const updatedCategories = categories?.map((cat) => {
          const match = apiCategories?.find(
            (apiCat: any) => apiCat.id === cat.id,
          );
          return {
            ...cat,
            name: match ? match.name : cat.name,
          };
        });
        setCategories(updatedCategories);
      }

      fetchCategories();
    }
  }, [hasEmptyName]);

  useEffect(() => {
    if (pathname) setActiveCategoryKey("");
  }, [pathname]);

  if (hasEmptyName) return;

  return (
    <div className="bg-[#FAFAFAE6] backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center gap-2.5 p-2.5 rounded-2xl">
      {categories?.map((item) => {
        const category = categoryIcons[item.id as any];
        const isActive = activeCategoryId === item.id;
        const iconSrc = isActive ? item.activeIcon : item.icon;
        return (
          <div
            key={item.id}
            onClick={() => handleCategoryChange(item.id)}
            className={clsx(
              "w-16.5 h-16.5 flex items-center flex-col gap-2 p-1 rounded-lg transition-colors cursor-pointer",
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
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
            <div className="text-sm">{item.name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryPanel;
