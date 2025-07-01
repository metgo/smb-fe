import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

const pageCache = new Map<number, BusinessProps[]>();
const metaCache = new Map<number, BusinessesProps["meta"]>();

let previousCategoryId: string | null = null;
let previousSubCategoryId: string | null = null;
let allBusinessData: BusinessProps[] = []; // Store all accumulated data
let lastFetchedPage = 0; // Track the last fetched page

export const getAllBusinesses = async (
  pageCount: number,
  categoryId: string,
  subCategoryId: string,
): Promise<BusinessesProps> => {
  const isCategoryChanged = previousCategoryId !== categoryId;
  const isSubCategoryChanged = previousSubCategoryId !== subCategoryId;

  // Clear cache and reset data when category/subcategory changes
  if (isCategoryChanged || isSubCategoryChanged) {
    pageCache.clear();
    metaCache.clear();
    allBusinessData = [];
    lastFetchedPage = 0;
    previousCategoryId = categoryId;
    previousSubCategoryId = subCategoryId;
  }

  // Only fetch pages that haven't been fetched yet
  for (let i = lastFetchedPage + 1; i <= pageCount; i++) {
    const isCached = pageCache.has(i);

    if (isCached) {
      allBusinessData.push(...pageCache.get(i)!);
    } else {
      try {
        const res = await fetch(
          `${urls.tourismBusinesses}?page=${i}&limit=16&bussCategoriesId=${categoryId}&bussSubCategoriesId=${subCategoryId}&sortBy=createdAt&sortOrder=DESC&campCode=${CODE}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
        const json: BusinessesProps = await res.json();

        pageCache.set(i, json.data);
        metaCache.set(i, json.meta);
        allBusinessData.push(...json.data);
      } catch (err) {
        console.error(`Error fetching page ${i}:`, err);
        break; // Stop fetching if there's an error
      }
    }
  }

  // Update the last fetched page
  lastFetchedPage = pageCount;

  const latestMeta = metaCache.get(pageCount) || {
    page: pageCount,
    limit: "16",
    data: allBusinessData.length,
    pageCount: pageCount,
    hasPreviousPage: pageCount > 1,
    hasNextPage: true,
  };

  return {
    data: allBusinessData,
    totalData: allBusinessData.length,
    meta: latestMeta,
  };
};

export const getAllCategory = async () => {
  try {
    const res = await fetch(urls.categories);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data?.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

export const getAllSubCategory = async (categoryId: string) => {
  try {
    const res = await fetch(
      `${urls.subcategory}?bussCategoryId=${categoryId}&campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

export const getAllBusinessLocation = async () => {
  try {
    const res = await fetch(urls.locations);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

export async function getBusinessById(
  businessId: string,
  setIsLoading: (isBoolean: boolean) => void,
) {
  setIsLoading(true);
  try {
    const res = await fetch(
      `${urls.locationData}/${businessId}?campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  } finally {
    setIsLoading(false);
  }
}
