"use server";

import { urls } from "@/lib/endpoints";

export async function postDeliveryInfo(cartId: string, payload: CartTypeProps) {
  try {
    const response = await fetch(`${urls.carts}/${cartId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Something went wrong", error);
  }
}

export async function placeOrder(payload: PlaceOrderProps) {
  try {
    const response = await fetch(`${urls.orders}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Something went wrong", error);
  }
}

export async function checkVoucherAmount(
  voucherCode: string,
  productId: string,
) {
  try {
    const res = await fetch(
      `${urls.vouchers}/${voucherCode}?productId=${productId}`,
    );
    return await res.json();
  } catch (error) {
    console.log("Something went wrong", error);
  }
}
