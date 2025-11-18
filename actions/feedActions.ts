"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

// Create separate cache and state for each context
const contextStates = new Map<
  string,
  {
    previousCategoryIds: string[];
    previousSubCategoryIds: string[];
    previousGroupTypes: string[];
    previousAccessibilities: string[];
    previousServiceTypes: string[];
    lastFetchedPage: number;
    pageCache: Map<number, BusinessProps[]>;
    metaCache: Map<number, any>;
  }
>();

// Helper function to get or create context state
const getContextState = (contextId: string) => {
  if (!contextStates.has(contextId)) {
    contextStates.set(contextId, {
      previousCategoryIds: [],
      previousSubCategoryIds: [],
      previousGroupTypes: [],
      previousAccessibilities: [],
      previousServiceTypes: [],
      lastFetchedPage: 0,
      pageCache: new Map(),
      metaCache: new Map(),
    });
  }
  return contextStates.get(contextId)!;
};

export const getAllFeeds = async (
  pageCount: number,
  categoryIds: string[],
  subCategoryIds: string[],
  groupTypesIds: string[],
  accessibilitiesIds: string[],
  serviceTypes: string[],
  contextId: string = "default",
): Promise<BusinessesProps> => {
  // Get state for this specific context
  const state = getContextState(contextId);

  const isCategoryChanged = state.previousCategoryIds !== categoryIds;
  const isSubCategoryChanged = state.previousSubCategoryIds !== subCategoryIds;

  // Compare arrays for changes
  const isGroupTypesChanged =
    state?.previousGroupTypes?.length !== groupTypesIds?.length ||
    state?.previousGroupTypes?.some((id, idx) => id !== groupTypesIds[idx]);

  const isAccessibilitiesChanged =
    state?.previousAccessibilities?.length !== accessibilitiesIds?.length ||
    state?.previousAccessibilities?.some(
      (id, idx) => id !== accessibilitiesIds[idx],
    );

  // Clear cache and reset data when category/subcategory/groupTypes/accessibilities change
  if (
    isCategoryChanged ||
    isSubCategoryChanged ||
    isGroupTypesChanged ||
    isAccessibilitiesChanged
  ) {
    state.pageCache.clear();
    state.metaCache.clear();
    state.lastFetchedPage = 0;
    state.previousCategoryIds = [...categoryIds];
    state.previousSubCategoryIds = [...subCategoryIds];
    state.previousGroupTypes = [...groupTypesIds];
    state.previousServiceTypes = [...serviceTypes];
    state.previousAccessibilities = [...accessibilitiesIds];
  }

  const query = new URLSearchParams();

  if (categoryIds?.length > 0)
    categoryIds?.forEach((id) => query.append("categoriesId", id));
  if (subCategoryIds?.length > 0)
    subCategoryIds?.forEach((id) => query.append("subCategoriesId", id));
  if (accessibilitiesIds?.length > 0)
    accessibilitiesIds?.forEach((id) => query.append("accessibilitiesId", id));
  if (groupTypesIds?.length > 0)
    groupTypesIds?.forEach((id) => query.append("groupTypesId", id));
  if (serviceTypes?.length > 0)
    serviceTypes?.forEach((id) => query.append("serviceType", id));

  // Only fetch pages that haven't been fetched yet
  for (let i = state.lastFetchedPage + 1; i <= pageCount; i++) {
    const isCached = state.pageCache.has(i);
    if (!isCached) {
      try {
        const res = await fetch(
          `${urls.tourismBusinesses}?page=${i}&limit=100&sortBy=createdAt&sortOrder=DESC&campCode=${CODE}&${query.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
        const json: BusinessesProps = await res.json();

        const randomizedData = shuffleArray(json.data);

        state.pageCache.set(i, randomizedData);
        state.metaCache.set(i, json.meta);

        console.log(
          `Page ${i} fetched and cached, ${json.data.length} items (ctx: ${contextId})`,
        );
      } catch (err) {
        console.error(`Error fetching page ${i}:`, err);
        break;
      }
    }
  }

  // Update the last fetched page
  state.lastFetchedPage = Math.max(state.lastFetchedPage, pageCount);

  // Reconstruct allBusinessData from cached pages in correct order
  const allBusinessData: BusinessProps[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (state.pageCache.has(i)) {
      allBusinessData.push(...state.pageCache.get(i)!);
    }
  }

  const latestMeta = state.metaCache.get(pageCount) || {
    page: pageCount,
    limit: "16",
    data: allBusinessData.length,
    pageCount: pageCount,
    hasPreviousPage: pageCount > 1,
    hasNextPage: true,
  };

  return {
    data: shuffleArray(allBusinessData),
    totalData: allBusinessData.length,
    meta: latestMeta,
  };
};

// Optional: Clear specific context when component unmounts
export const clearBusinessContext = async (contextId: string) => {
  await contextStates.delete(contextId);
};

// ------------------------------------------------------------------------------------------

export const getAllCategory = async () => {
  try {
    const res = await fetch(urls.categories);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

export const getAllSubCategory = async (
  categoryId: string,
  purpose: string,
) => {
  try {
    const res = await fetch(
      `${urls.subcategory}?purpose=${purpose}&bussCategoryId=${categoryId}&campCode=${CODE}`,
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

export async function getBusinessById(businessId: string) {
  try {
    const res = await fetch(
      `${urls.locationData}/${businessId}?campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getBusinessDetailsBySlug(slug: string) {
  try {
    const res = await fetch(`${urls.businessDetails}/${slug}?campCode=${CODE}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getFilterTypes(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    const formattedData = data?.data?.map((item: any) => ({
      _id: item._id,
      name: item.name,
    }));
    return formattedData;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
