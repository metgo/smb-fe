import { create } from "zustand";
import { persist } from "zustand/middleware";

type FeedItem = {
  _id: string;
  name: string;
  shortDescritption: string;
  images: ImageItem[];
  primaryCategoryId: string;
  slug: string;
  serviceType: string;
};

interface FavoriteFeedItemStore {
  favoriteFeedItems: FeedItem[];
  favoriteFeedItemIds: string[];
  addFavoriteFeedItem: (feedItem: FeedItem) => void;
  addFavoriteFeedItemId: (feedId: string) => void;
}

const useFavoriteFeedItemStore = create<FavoriteFeedItemStore>()(
  persist(
    (set, get) => ({
      favoriteFeedItems: [],
      favoriteFeedItemIds: [],

      addFavoriteFeedItemId: (feedId: string) => {
        const current = get().favoriteFeedItemIds;

        const exists = current.includes(feedId);

        if (exists) {
          set({
            favoriteFeedItemIds: current.filter((id) => id !== feedId),
          });
        } else {
          set({
            favoriteFeedItemIds: [...current, feedId],
          });
        }
      },

      addFavoriteFeedItem: (feedItem: FeedItem) => {
        const formattedFeedItem = {
          _id: feedItem._id,
          name: feedItem.name,
          shortDescritption: feedItem.shortDescritption,
          serviceType: feedItem.serviceType,
          images: feedItem.images,
          slug: feedItem.slug,
          primaryCategoryId: feedItem.primaryCategoryId,
        };

        const current = get().favoriteFeedItems;
        const exists = current.some((item) => item._id === feedItem._id);

        if (exists) {
          const newItems = current.filter((item) => item._id !== feedItem._id);
          set({
            favoriteFeedItemIds: newItems.map((item) => item._id),
          });
        } else {
          const newItems = [...current, formattedFeedItem];
          set({
            favoriteFeedItems: newItems,
          });
        }
      },
    }),
    {
      name: "favorite-storage",
    },
  ),
);

export default useFavoriteFeedItemStore;
