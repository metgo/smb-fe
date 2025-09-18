"use server";

import { IdentifierId } from "@/constant/envConstants";
import { urls } from "@/lib/endpoints";

export async function getAllBlogs() {
  try {
    const res = await fetch(`${urls.blogs}?identifierId=${IdentifierId}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getBlogById(blogId: string) {
  try {
    const res = await fetch(`${urls.locationData}/${blogId}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
