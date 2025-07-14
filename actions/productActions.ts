"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

export async function getProductDetailsBySlug(slug: string) {
  try {
    const res = await fetch(`${urls.productsDetails}/${slug}?campCode=${CODE}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
