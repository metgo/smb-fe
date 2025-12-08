import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteFeedItemStore {
  favoriteFeedItemIds: string[];
  alreadyShownFilterTooltip: boolean;
  addFavoriteFeedItemId: (feedId: string) => void;
  handleFilterTooltipShown: (v: boolean) => void;
}

const useFavoriteFeedItemStore = create<FavoriteFeedItemStore>()(
  persist(
    (set, get) => ({
      favoriteFeedItemIds: [],
      alreadyShownFilterTooltip: false,

      handleFilterTooltipShown: (v: boolean) => {
        set({ alreadyShownFilterTooltip: v });
      },

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
    }),
    {
      name: "favorite-storage",
    },
  ),
);

export default useFavoriteFeedItemStore;
