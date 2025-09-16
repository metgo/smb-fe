"use server";

import { IdentifierId } from "@/constant/envConstants";
import { urls } from "@/lib/endpoints";

export async function getMarketing() {
  try {
    const res = await fetch(
      // `${urls.marketing}?identifierId=BNEI-FO5%26GZ%294%253XD%3DB6I5T`,
      `${urls.marketing}?identifierId=${IdentifierId}`,
    );
    const data = await res.json();
    return data?.[0]?.images;
  } catch (error) {
    console.log("Error fetching marketing", error);
  }
}
