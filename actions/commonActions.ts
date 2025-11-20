"use server";

import { urls } from "@/lib/endpoints";
import { CODE, IdentifierId } from "@/constant/envConstants";

export async function getAllLocations() {
  try {
    const res = await fetch(urls.locations);
    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    const allLocations = data?.data;

    const seen = new Set<string>();

    const uniqueLocations = allLocations?.filter((item: BusinessMakerProps) => {
      const { lat, long } = item.geoLocation || {};
      if (lat == null || long == null) return false;

      const key = `${lat},${long}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    return uniqueLocations?.map((item: BusinessMakerProps) => ({
      _id: item._id,
      geoLocation: item.geoLocation,
      primaryCategoryId: item.primaryCategoryId,
      slug: item.slug,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getLocationDetailsById(locationId: string) {
  try {
    const res = await fetch(
      `${urls.locationData}/${locationId}?campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getSiteInfo() {
  try {
    const res = await fetch(`${urls.siteInfo}/${IdentifierId}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getAminitiesInfo() {
  try {
    const res = await fetch(`${urls.aminitiesInfo}/${CODE}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getPromotionsList() {
  try {
    const res = await fetch(
      `${urls.promotional}/${IdentifierId}?isBusiness=false&isEvent=false&isTrip=false`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getComboFilters() {
  try {
    const res = await fetch(urls.filters);
    if (!res.ok) throw new Error("Failed to fetch combo filters");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching combo filters:", error);
  }
}

export async function getFilters() {
  try {
    const res = await fetch(`${urls.filters}?identifierId=${IdentifierId}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getSubcategories() {
  try {
    const res = await fetch(`${urls.subcategory}?identifierId=${IdentifierId}`);
    if (!res.ok) throw new Error("Failed to fetch sub-categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
  }
}

export async function getPresetFilters() {
  try {
    const res = await fetch(
      `${urls.defaultFilters}?identifierId=${IdentifierId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch preset filters");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching preset filters:", error);
  }
}
