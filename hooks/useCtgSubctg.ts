import { useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { startLoading } from "@/components/wrappers/ProgressBar";

export const useCtgSubctg = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);

  const activeCategoryKey = searchParams.get("categoryId");

  const [activeSubCategory, setActiveSubCategory] = useState<string>();

  const handleCategoryChange = async (categoryId: string) => {
    const isSameCategory = activeCategoryKey === categoryId;
    const newCategoryId = isSameCategory ? "" : categoryId;

    setActiveSubCategory("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("groupTypesIds");
    params.delete("accessibilitiesIds");
    if (newCategoryId) {
      params.set("categoryId", newCategoryId);
    } else {
      params.delete("categoryId");
    }

    params.set("page", "1");
    params.delete("subCategoryId");

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    startLoading();
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSubcategoryChange = (subCtgId: string) => {
    hasFetchedRef.current = false;
    const isSameCategory = activeSubCategory === subCtgId;
    const newSubcategoryId = isSameCategory ? "" : subCtgId;

    setActiveSubCategory(newSubcategoryId);

    const params = new URLSearchParams(searchParams.toString());

    if (newSubcategoryId) params.set("subCategoryId", newSubcategoryId);
    else {
      params.delete("subCategoryId");
    }

    params.set("page", "1");
    if (activeCategoryKey) {
      params.set("categoryId", activeCategoryKey);
    } else {
      params.delete("categoryId");
    }
    params.delete("groupTypesIds");
    params.delete("accessibilitiesIds");
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    startLoading();
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return {
    handleCategoryChange,
    handleSubcategoryChange,
    activeSubCategory,
    activeCategoryKey,
  };
};
