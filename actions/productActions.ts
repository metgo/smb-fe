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

export async function getProducts(businessId: string) {
  try {
    const res = await fetch(
      `${urls.productsList}?businessId=${businessId}&campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data?.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getProductDetailsById(productId: string) {
  try {
    const res = await fetch(
      `${urls.productsDetails}/${productId}?campCode=${CODE}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getProductDetailsByIds(productIds: string[]) {
  try {
    const results = await Promise.all(
      productIds.map(async (id) => {
        const res = await fetch(
          `${urls.productsDetails}/${id}?campCode=${CODE}`,
        );
        if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
        return res.json();
      }),
    );

    return results; // Array of product details
  } catch (error) {
    console.error("Error fetching product details:", error);
    return [];
  }
}

export async function postProductToCart(productId: string, qty: number = 1) {
  const response = await fetch(urls.carts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id: productId,
        quantity: qty,
      },
      campCode: CODE,
    }),
  });
  return await response.json();
}

export async function getRecommendedProducts() {}
