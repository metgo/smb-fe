"use server";

import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";
import { shuffleArray } from "@/lib/helpers";

// Create separate cache and state for each context
const contextStates = new Map<
  string,
  {
    lastFetchedPage: number;
    pageCache: Map<number, TrailFeedList>;
    metaCache: Map<number, any>;
  }
>();

// Helper function to get or create context state
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
  // Get state for this specific context
  const state = getContextState(contextId);

  // Only fetch pages that haven't been fetched yet
  for (let i = state.lastFetchedPage + 1; i <= pageCount; i++) {
    const isCached = state.pageCache.has(i);
    if (!isCached) {
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
  }

  // Update the last fetched page
  state.lastFetchedPage = Math.max(state.lastFetchedPage, pageCount);

  // Reconstruct allFeedData from cached pages in correct order
  const allFeedData: TrailFeedList = [];
  for (let i = 1; i <= pageCount; i++) {
    if (state.pageCache.has(i)) {
      allFeedData.push(...state.pageCache.get(i)!);
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
    data: allFeedData,
    totalData: allFeedData.length,
    meta: latestMeta,
  };
};

// Optional: Clear specific context when component unmounts
export const clearBusinessContext = async (contextId: string) => {
  await contextStates.delete(contextId);
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
