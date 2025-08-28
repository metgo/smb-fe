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
    return data?.data ?? data?.products;
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

export async function getProductDetailsByIds6(productIds: string[]) {
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

export async function getProductDetailsByIds(
  products: { id: string; itemType: string }[],
) {
  try {
    const results = await Promise.all(
      products.map(async ({ id, itemType }) => {
        let url = "";

        if (itemType === "PRODUCT") {
          url = `${urls.productsDetails}/${id}?campCode=${CODE}`;
        } else if (itemType === "TICKET") {
          url = `${urls.ticketDetails}/${id}`;
        } else {
          throw new Error(`Unknown itemType: ${itemType}`);
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${itemType} ${id}`);

        return res.json();
      }),
    );

    return results;
  } catch (error) {
    console.error("Error fetching product/package details:", error);
    return [];
  }
}

export async function postProductToCart(
  cartInfo: { _id: string; quantity: number; itemType: string }[],
) {
  if (!cartInfo.length) throw new Error("cartInfo cannot be empty");

  // --- 1. First item -> POST ---
  const firstItem = cartInfo[0];
  const response = await fetch(urls.carts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        id: firstItem._id,
        quantity: firstItem.quantity,
        itemType: firstItem.itemType,
      },
      campCode: CODE,
    }),
  });

  const postResult = await response.json();

  if (!response.ok) {
    throw new Error(postResult?.message || "Failed to create cart");
  }

  const cartId = postResult?._id;
  if (!cartId) {
    throw new Error("Cart ID not found in POST response");
  }

  // --- 2. Remaining items -> PATCH one by one ---
  const patchResults: any[] = [];
  if (cartInfo.length > 1) {
    const restItems = cartInfo.slice(1);

    for (const item of restItems) {
      const patchRes = await fetch(`${urls.carts}/${cartId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item._id,
          quantity: item.quantity,
          itemType: item.itemType,
        }),
      });

      const patchResult = await patchRes.json();

      if (!patchRes.ok) {
        throw new Error(patchResult?.message || "Failed to update cart");
      }

      patchResults.push(patchResult);
    }
  }

  // --- 3. Return merged result ---
  return postResult;
}
