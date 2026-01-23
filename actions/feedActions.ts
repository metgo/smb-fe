"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

// Direct fetch function without any caching
const getCachedFeeds = async (baseUrl: string, page: number) => {
  let allData: any[] = [];
  let currentPage = page;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = `${baseUrl}&page=${currentPage}`;
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) throw new Error(`Failed to fetch feeds: ${res.statusText}`);

    const json = await res.json();
    allData = [...allData, ...(json.data || [])];
    hasNextPage = json.meta?.hasNextPage;
    currentPage++; // Fix pagination
  }

  return allData;
};

export async function getAllFeeds(
  page: number,
  filters: FiltersProps,
  isAllClear: boolean = false,
  limit: number = 10,
): Promise<BusinessesProps> {
  let baseUrl: string;

  if (isAllClear) {
    baseUrl = `${urls.feeds}?campCode=${CODE}&limit=${limit}`;
  } else {
    const {
      categoryIds,
      subCategoryIds,
      groupTypesIds,
      accessibilitiesIds,
      serviceTypes,
    } = filters;

    const query = new URLSearchParams();
    query.append("limit", limit.toString());
    query.append("sortBy", "createdAt");
    query.append("sortOrder", "DESC");
    query.append("campCode", CODE!);

    categoryIds?.forEach((id) => query.append("categoriesId", id));
    subCategoryIds?.forEach((id) => query.append("subCategoriesId", id));
    groupTypesIds?.forEach((id) => query.append("groupTypesId", id));
    accessibilitiesIds?.forEach((id) => query.append("accessibilitiesId", id));
    serviceTypes?.forEach((type) => query.append("serviceType", type));

    baseUrl = `${urls.feeds}?${query.toString()}`;
  }

  try {
    const allData = await getCachedFeeds(baseUrl, page);
    const finalData = shuffleArray(allData);

    return {
      data: finalData,
      totalData: finalData.length,
      meta: {
        page: 1,
        limit,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  } catch (error) {
    console.error("Error in getAllFeeds:", error);

    return {
      data: [],
      totalData: 0,
      meta: {
        page: 1,
        limit,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }
}

export async function getFeedItemsWithFilter(
  page: number = 1,
  filters: FiltersProps,
  isAllClear: boolean = false,
): Promise<FeedItemResponse> {
  let baseUrl: string;
  const limit = 1000;

  if (isAllClear) {
    baseUrl = `${urls.feeds}?campCode=${CODE}&limit=${limit}&page=${page}`;
  } else {
    const {
      categoryIds,
      subCategoryIds,
      groupTypesIds,
      accessibilitiesIds,
      serviceTypes,
    } = filters;

    const query = new URLSearchParams();
    query.append("limit", limit.toString());
    query.append("sortBy", "createdAt");
    query.append("sortOrder", "DESC");
    query.append("campCode", CODE!);
    query.append("page", page.toString());

    categoryIds?.forEach((id) => query.append("categoriesId", id));
    subCategoryIds?.forEach((id) => query.append("subCategoriesId", id));
    groupTypesIds?.forEach((id) => query.append("groupTypesId", id));
    accessibilitiesIds?.forEach((id) => query.append("accessibilitiesId", id));
    serviceTypes?.forEach((type) => query.append("serviceType", type));

    baseUrl = `${urls.feeds}?${query.toString()}`;
  }

  try {
    const res = await fetch(baseUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch feeds: ${res.statusText}`);

    const resData: FeedItemResponse = await res.json();
    const finalData = shuffleArray(resData?.data);
    return {
      ...resData,
      data: finalData,
    };
  } catch (error) {
    console.error("Error in getAllFeeds:", error);

    return {
      data: [],
      totalData: 0,
      meta: {
        page: 1,
        limit,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }
}

export async function getFeedItems(): Promise<FeedItemResponse> {
  let baseUrl: string;

  baseUrl = `${urls.feeds}?campCode=${CODE}`;

  try {
    const res = await fetch(baseUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch feeds: ${res.statusText}`);

    const resData: FeedItemResponse = await res.json();
    const finalData = shuffleArray(resData?.data);
    return {
      ...resData,
      data: finalData,
    };
  } catch (error) {
    console.error("Error in getAllFeeds:", error);

    return {
      data: [],
      totalData: 0,
    };
  }
}
// ------------------------------------------------------------------------------------------

export async function getAllFilters(filters?: FiltersProps) {
  const query = new URLSearchParams();

  query.append("campCode", CODE!);

  // Safely append only if available
  filters?.categoryIds?.forEach((id) => query.append("categoriesId", id));
  filters?.subCategoryIds?.forEach((id) => query.append("subCategoriesId", id));
  const url = `${urls.filters}?${query.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feeds: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error in getAllFilters:", error);
  }
}

export async function getAllFiltersOld(filters?: FiltersProps) {
  const query = new URLSearchParams();

  query.append("campCode", CODE!);

  // Safely append only if available
  filters?.categoryIds?.forEach((id) => query.append("categoriesId", id));
  filters?.subCategoryIds?.forEach((id) => query.append("subCategoriesId", id));
  filters?.groupTypesIds?.forEach((id) => query.append("groupTypesId", id));
  filters?.accessibilitiesIds?.forEach((id) =>
    query.append("accessibilitiesId", id),
  );

  const url = `${urls.filters}?${query.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feeds: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error in getAllFilters:", error);
  }
}

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
