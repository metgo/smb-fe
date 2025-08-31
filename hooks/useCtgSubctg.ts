import { useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { getPurposeType } from "@/lib/helpers";
import { getAllSubCategory } from "@/actions/businessActions";

export const useCtgSubctg = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategoryKey = searchParams.get("categoryId");

  const [activeSubCategory, setActiveSubCategory] = useState<string>();
  const [subCategories, setSubCategories] = useState<BusienssSubcategoryProps>(
    [],
  );
  const isHomepage = pathname === "/";

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

  const handleCategoryChange = async (categoryId: string) => {
    const isSameCategory = activeCategoryKey === categoryId;
    const newCategoryId = isSameCategory ? "" : categoryId;

    setActiveSubCategory("");

    const params = new URLSearchParams(searchParams.toString());

    if (newCategoryId) {
      params.set("categoryId", newCategoryId);
    } else {
      params.delete("categoryId");
      setSubCategories([]);
    }

    params.set("page", "1");
    params.delete("subCategoryId");

    window.scrollTo({
      top: isHomepage ? window.innerHeight : 0,
      left: 0,
      behavior: "smooth",
    });
    startLoading();
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
    if (activeCategoryKey) {
      params.set("categoryId", activeCategoryKey);
    } else {
      params.delete("categoryId");
    }
    window.scrollTo({
      top: isHomepage ? window.innerHeight : 0,
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
    subCategories,
  };
};
