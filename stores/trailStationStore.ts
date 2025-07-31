import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TrailStation {
  trailId: string;
  stationIds: string[];
}

interface TrailStationStoreState {
  trailStations: TrailStation[];
  setTrailStations: (trailId: string, stationIds: string[]) => void;
  clearTrailStations: () => void;
  getStationIdsByTrailId: (trailId: string) => string[]; // ✅ New selector
}

const useTrailStationStore = create<TrailStationStoreState>()(
  persist(
    (set, get) => ({
      trailStations: [],
      setTrailStations: (trailId, stationIds) => {
        const updated = [
          ...get().trailStations.filter((t) => t.trailId !== trailId),
          { trailId, stationIds },
        ];
        set({ trailStations: updated });
      },
      clearTrailStations: () => set({ trailStations: [] }),

      // ✅ Selector to get only stationIds for a given trailId
      getStationIdsByTrailId: (trailId) => {
        const trail = get().trailStations.find((t) => t.trailId === trailId);
        return trail ? trail.stationIds : [];
      },
    }),
    {
      name: "trail-station-storage",
    },
  ),
);

export default useTrailStationStore;
