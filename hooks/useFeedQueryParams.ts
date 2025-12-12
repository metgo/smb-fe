import { useSearchParams } from "next/navigation";

export const useFeedQueryParams = () => {
  const searchParams = useSearchParams();

  // Convert comma-separated params → string[]
  const getArray = (key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(",") : [];
  };

  // Convert to string
  const getString = (key: string): string | "" => {
    return searchParams.get(key) || "";
  };

  // Convert to boolean
  const getBoolean = (key: string): boolean => {
    return searchParams.get(key) === "true";
  };

  // Convert to number
  const getNumber = (key: string, fallback = 1): number => {
    const num = Number(searchParams.get(key));
    return isNaN(num) ? fallback : num;
  };

  return {
    // Arrays
    categoryIds: getArray("categoryIds"),
    subCategoryIds: getArray("subCategoryIds"),
    accessibilityIds: getArray("accessibilityIds"),
    groupTypeIds: getArray("groupTypeIds"),
    serviceTypes: getArray("serviceTypes"),

    // Strings
    searchTerm: getString("search"),

    // Boolean
    isAllClear: getBoolean("isAllClear"),

    // Number
    page: getNumber("page", 1),
  };
};
