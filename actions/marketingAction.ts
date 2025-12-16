"use server";

import { IdentifierId } from "@/constant/envConstants";
import { urls } from "@/lib/endpoints";
import { unstable_cache } from "next/cache";

export const getMarketing = unstable_cache(
  async () => {
    try {
      const res = await fetch(
        `${urls.marketing}?identifierId=${IdentifierId}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      );
      const data = await res.json();
      // Return the full images object with items, playType, and timeInterval
      return data?.[0]?.images || null;
    } catch (error) {
      console.log("Error fetching marketing", error);
      return null;
    }
  },
  ["marketing-data"],
  { revalidate: 3600, tags: ["marketing"] },
);
