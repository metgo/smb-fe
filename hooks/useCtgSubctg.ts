import { useState } from "react";

import useGeneralStore from "@/stores/generalStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useCtgSubctg = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId");

  const { activeCategoryKey, setActiveCategoryKey } = useGeneralStore();

  const [activeSubCategory, setActiveSubCategory] = useState<string>();

  const isHomepage = pathname === "/";

  const handleCategoryChange = (categoryId: string) => {
    const isSameCategory = activeCategoryId === categoryId;
    const newCategoryId = isSameCategory ? "" : categoryId;

    setActiveCategoryKey(categoryId || "");
    setActiveSubCategory("");

    const params = new URLSearchParams(searchParams.toString());

    if (newCategoryId) params.set("categoryId", newCategoryId);
    else {
      params.delete("categoryId");
    }

    params.set("page", "1");
    params.delete("subCategoryId");

    window.scrollTo({
      top: isHomepage ? window.innerHeight : 0,
      left: 0,
      behavior: "smooth",
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSubcategoryChange = (subCtgId: string) => {
    const isSameCategory = activeSubCategory === subCtgId;
    const newSubcategoryId = isSameCategory ? "" : subCtgId;

    setActiveSubCategory(newSubcategoryId);

    const params = new URLSearchParams(searchParams.toString());

    if (newSubcategoryId) params.set("subCategoryId", newSubcategoryId);
    else params.delete("subCategoryId");

    params.set("page", "1");
    params.set("categoryId", activeCategoryKey);
    window.scrollTo({
      top: isHomepage ? window.innerHeight : 0,
      left: 0,
      behavior: "smooth",
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return {
    handleCategoryChange,
    handleSubcategoryChange,
    activeSubCategory,
    activeCategoryId,
    setActiveCategoryKey,
  };
};
