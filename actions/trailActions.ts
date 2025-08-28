"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

// Cache in-memory only during the current session or lifetime of the serverless function
let contextStates = new Map<
  string,
  {
    lastFetchedPage: number;
    pageCache: Map<number, TrailFeedList>;
    metaCache: Map<number, any>;
  }
>();

// Reset context state when page reloads
export const resetTrailContext = async () => {
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

export const getAllTrails = async (
  pageCount: number,
  contextId: string = "default",
): Promise<TrailsFeedProps> => {
  // Always reset state per request to force re-fetch on reload
  resetTrailContext();
  const state = getContextState(contextId);

  for (let i = 1; i <= pageCount; i++) {
    try {
      console.log(`Fetching page ${i} from API`);
      const res = await fetch(
        `${urls.trails}?page=${i}&limit=16&sortBy=createdAt&sortOrder=DESC&campCode=${CODE}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
      const json: TrailsFeedProps = await res.json();

      const randomizedData = shuffleArray(json.data) as TrailFeedList;

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

  const allFeedData: TrailFeedList = [];
  for (let i = 1; i <= pageCount; i++) {
    const cached = state.pageCache.get(i);
    if (cached) {
      allFeedData.push(...cached);
    }
  }

  const latestMeta = state.metaCache.get(pageCount) || {
    page: pageCount,
    limit: "16",
    data: allFeedData.length,
    pageCount: pageCount,
    hasPreviousPage: pageCount > 1,
    hasNextPage: true,
  };

  return {
    data: shuffleArray(allFeedData),
    totalData: allFeedData.length,
    meta: latestMeta,
  };
};

export const clearBusinessContext = async (contextId: string) => {
  contextStates.delete(contextId);
};

export async function getTrailDetailsBySlug(
  slug: string,
  isMap: boolean = false,
) {
  try {
    const res = await fetch(
      `${urls.trailDetails}/${slug}?campCode=${CODE}&isMap=${isMap}`,
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
