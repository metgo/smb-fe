"use server";

import { urls } from "@/lib/endpoints";

export const getAllCategorySites = async () => {
  try {
    const res = await fetch(urls.categoriesSites);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

