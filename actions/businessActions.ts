"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

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
    return data as BusinessDetailsProps;
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
