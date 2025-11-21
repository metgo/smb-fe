"use server";
import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

interface FiltersProps {
  categoryIds: string[];
  subCategoryIds: string[];
  groupTypesIds: string[];
  accessibilitiesIds: string[];
  serviceTypes: string[];
}

export async function getAllFeeds(
  page: number,
  filters: FiltersProps,
  isAllClear: boolean = false,
): Promise<BusinessesProps> {
  let url: string;

  if (isAllClear) {
    url = `${urls.feeds}?campCode=${CODE}`;
  } else {
    const {
      categoryIds = [],
      subCategoryIds = [],
      groupTypesIds = [],
      accessibilitiesIds = [],
      serviceTypes = [],
    } = filters;

    const normalizedServiceTypes = serviceTypes.includes("business")
      ? serviceTypes
      : [...serviceTypes, "business"];

    // Build URL query parameters
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", "100");
    query.append("sortBy", "createdAt");
    query.append("sortOrder", "DESC");
    query.append("campCode", CODE!);

    categoryIds.forEach((id) => query.append("categoriesId", id));
    subCategoryIds.forEach((id) => query.append("subCategoriesId", id));
    groupTypesIds.forEach((id) => query.append("groupTypesId", id));
    accessibilitiesIds.forEach((id) => query.append("accessibilitiesId", id));

    // ✅ Always include "business"
    normalizedServiceTypes.forEach((type) => query.append("serviceType", type));

    url = `${urls.feeds}?${query.toString()}`;
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feeds: ${res.statusText}`);
    }

    const json = await res.json();

    return {
      data: shuffleArray(json.data) || [],
      totalData: json.data?.length || 0,
      meta: json.meta || {
        page,
        limit: 100,
        pageCount: 1,
        hasPreviousPage: page > 1,
        hasNextPage: true,
      },
    };
  } catch (error) {
    console.error("Error in getAllFeeds:", error);

    return {
      data: [],
      totalData: 0,
      meta: {
        page,
        limit: 100,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
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
