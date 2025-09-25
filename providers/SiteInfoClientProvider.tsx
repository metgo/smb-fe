"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import { getAminitiesInfo } from "@/actions/commonActions";
import { getAllCategory } from "@/actions/businessActions";
import useCategoryStore from "@/stores/categoriesStore";

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { setAminitiesInfo } = useGeneralStore();
  const { categories, setCategories } = useCategoryStore();

  async function fetchAminitiesInfo() {
    const res = await getAminitiesInfo();
    setAminitiesInfo(res);
  }

  async function fetchCategories() {
    const res = await getAllCategory();
    const apiCategories = res?.data ? res?.data : res;
    const updatedCategories = categories?.map((cat) => {
      const match = apiCategories?.find((apiCat: any) => apiCat.id === cat.id);
      return {
        ...cat,
        name: match ? match.name : cat.name,
      };
    });
    setCategories(updatedCategories);
  }

  useEffect(() => {
    fetchCategories();
    fetchAminitiesInfo();
  }, []);

  return <div>{children}</div>;
};
