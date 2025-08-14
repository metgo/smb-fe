"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

// Cache in-memory only during the current session or lifetime of the serverless function
let contextStates = new Map<
  string,
  {
    lastFetchedPage: number;
    pageCache: Map<number, BusinessProps[]>;
    metaCache: Map<number, any>;
  }
>();

// Reset context state when page reloads
export const resetEventsContext = () => {
  contextStates = new Map();
};

// Get or initialize state per context
const getContextState = (contextId: string) => {
  if (!contextStates.has(contextId)) {
    contextStates.set(contextId, {
      lastFetchedPage: 0,
      pageCache: new Map(),
      metaCache: new Map(),
    });
  }
  return contextStates.get(contextId)!;
};

export const getAllEvents = async (
  pageCount: number,
  contextId: string = "default",
): Promise<BusinessesProps> => {
  // Always reset state per request to force re-fetch on reload
  resetEventsContext();
  const state = getContextState(contextId);

  for (let i = 1; i <= pageCount; i++) {
    try {
      console.log(`Fetching page ${i} from API`);
      const res = await fetch(
        `${urls.events}?page=${i}&limit=16&sortBy=createdAt&sortOrder=DESC&campCode=${CODE}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
      const json: BusinessesProps = await res.json();

      const randomizedData = shuffleArray(json.data);

      state.pageCache.set(i, randomizedData);
      state.metaCache.set(i, json.meta);

      console.log(`Page ${i} fetched and cached, ${json.data.length} items`);
    } catch (err) {
      console.error(`Error fetching page ${i}:`, err);
      break;
    }
  }

  // Store latest fetched page
  state.lastFetchedPage = pageCount;

  const allBusinessData: BusinessProps[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const cached = state.pageCache.get(i);
    if (cached) {
      allBusinessData.push(...cached);
    }
  }

  const latestMeta = state.metaCache.get(pageCount) || {
    page: pageCount,
    limit: "16",
    data: allBusinessData.length,
    pageCount: pageCount,
    hasPreviousPage: pageCount > 1,
    hasNextPage: true,
  };

  return {
    data: allBusinessData,
    totalData: allBusinessData.length,
    meta: latestMeta,
  };
};

export async function getEventDetailsBySlug(slug: string) {
  try {
    const res = await fetch(`${urls.eventDetails}/${slug}?campCode=${CODE}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
