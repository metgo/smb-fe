"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

export const getAllBusinesses = async (
  pageCount: number,
  categoryId: string,
  subCategoryId: string,
  groupTypesIds: string[],
  accessibilitiesIds: string[],
): Promise<BusinessesProps> => {
  const query = new URLSearchParams();

  if (categoryId) query.append("bussCategoriesId", categoryId);
  if (subCategoryId) query.append("bussSubCategoriesId", subCategoryId);
  if (accessibilitiesIds?.length > 0)
    accessibilitiesIds?.forEach((id) => query.append("accessibilitiesId", id));
  if (groupTypesIds?.length > 0)
    groupTypesIds?.forEach((id) => query.append("groupTypesId", id));

  const allBusinessData: BusinessProps[] = [];
  let latestMeta;

  // Fetch all pages
  for (let i = 1; i <= pageCount; i++) {
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
      allBusinessData.push(...randomizedData);
      latestMeta = json.meta;
    } catch (err) {
      console.error(`Error fetching page ${i}:`, err);
      break;
    }
  }

  const meta = latestMeta || {
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
    meta: meta,
  };
};

// Optional: Clear specific context when component unmounts
export const clearBusinessContext = async (contextId: string) => {
  console.log(contextId);
  // await contextStates.delete(contextId);
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
