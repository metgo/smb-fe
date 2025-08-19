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

export async function postProductToCart6(
  id: string,
  itemType: string = "PRODUCT",
  quantity: number = 1,
) {
  const response = await fetch(urls.carts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: { id, quantity, itemType },
      campCode: CODE,
    }),
  });
  return await response.json();
}

export async function postProductToCart(
  cartInfo: { _id: string; qty: number; itemType: string }[],
) {
  if (!cartInfo.length) throw new Error("cartInfo cannot be empty");

  // First item -> POST
  const firstItem = cartInfo[0];
  const response = await fetch(urls.carts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id: firstItem._id,
        quantity: firstItem.qty,
        itemType: firstItem.itemType ?? "PRODUCT",
      },
      campCode: CODE,
    }),
  });

  const postResult = await response.json();

  if (!response.ok) {
    throw new Error(postResult?.message || "Failed to create cart");
  }

  const cartId = postResult?.data?.id || postResult?.cartId; // adjust based on API shape

  // Remaining items -> PATCH
  if (cartInfo.length > 1 && cartId) {
    const restItems = cartInfo.slice(1);

    await fetch(`${urls.carts}/${cartId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: restItems.map((item) => ({
          id: item._id,
          quantity: item.qty,
          itemType: item.itemType ?? "PRODUCT",
        })),
        campCode: CODE,
      }),
    });
  }

  return postResult;
}
