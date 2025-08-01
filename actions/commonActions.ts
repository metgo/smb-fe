"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

export const getAllLocations = async () => {
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
};

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
