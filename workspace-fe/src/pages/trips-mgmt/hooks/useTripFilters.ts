import { useState } from "react";

export function useTripFilters() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPoiChecked, setIsPoiChecked] = useState(false);
  const [isBusinessChecked, setIsBusinessChecked] = useState(false);
  const [isMyAreaChecked, setIsMyAreaChecked] = useState(false);
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<
    string[]
  >([]);
  const [selectedGroupTypeIds, setSelectedGroupTypeIds] = useState<string[]>(
    [],
  );
  const [selectedAccessibilityIds, setSelectedAccessibilityIds] = useState<
    string[]
  >([]);

  return {
    searchTerm,
    setSearchTerm,
    isPoiChecked,
    setIsPoiChecked,
    isBusinessChecked,
    setIsBusinessChecked,
    isMyAreaChecked,
    setIsMyAreaChecked,
    activeCategoryIds,
    setActiveCategoryIds,
    selectedSubCategoryIds,
    setSelectedSubCategoryIds,
    selectedGroupTypeIds,
    setSelectedGroupTypeIds,
    selectedAccessibilityIds,
    setSelectedAccessibilityIds,
  };
}
