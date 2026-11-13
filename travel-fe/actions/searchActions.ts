"use server";

import { urls } from "@/lib/endpoints";

export const getAllRecommendedBusiness = async () => {
  try {
    const res = await fetch(urls.searchRecommendation);
    if (!res.ok) throw new Error("Failed to fetch recommended businesses");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching recommended businesses:", err);
    return [];
  }
};

export const tourismSearch = async (searchKeyword: string) => {
  try {
    const res = await fetch(`${urls.tourismSearch}&search=${searchKeyword}`);
    if (!res.ok) throw new Error("Failed to fetch recommended businesses");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching recommended businesses:", err);
    return [];
  }
};
