import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TrailStation {
  trailId: string;
  stations: LocalstoreTrailStaionsProps[];
}

interface TrailStationStoreState {
  trailStations: TrailStation[];
  clearTrailStations: () => void;
  getStationsByTrailId: (trailId: string) => LocalstoreTrailStaionsProps[];
  setTrailStations: (
    trailId: string,
    stations: LocalstoreTrailStaionsProps[],
  ) => void;
  addTrailStation: (
    trailId: string,
    station: LocalstoreTrailStaionsProps,
  ) => void;
  isAreadyExistStation: (trailId: string, stationId: string) => boolean;
}

const useTrailStationStore = create<TrailStationStoreState>()(
  persist(
    (set, get) => ({
      trailStations: [],

      setTrailStations: (trailId, stations) => {
        const updated = [
          ...get().trailStations.filter((t) => t.trailId !== trailId),
          { trailId, stations },
        ];
        set({ trailStations: updated });
      },

      clearTrailStations: () => set({ trailStations: [] }),

      getStationsByTrailId: (trailId) => {
        const trail = get().trailStations.find((t) => t.trailId === trailId);
        return trail ? trail.stations : [];
      },

      addTrailStation: (trailId, newStation) => {
        const currentTrails = get().trailStations;
        const trailIndex = currentTrails.findIndex(
          (t) => t.trailId === trailId,
        );

        if (trailIndex === -1) {
          // Add new trail with this station
          set({
            trailStations: [
              ...currentTrails,
              { trailId, stations: [newStation] },
            ],
          });
        } else {
          const updatedTrail = {
            ...currentTrails[trailIndex],
            stations: [...currentTrails[trailIndex].stations, newStation],
          };
          const updatedTrails = [...currentTrails];
          updatedTrails[trailIndex] = updatedTrail;

          set({ trailStations: updatedTrails });
        }
      },

      isAreadyExistStation: (trailId: string, stationId: string) => {
        const trail = get().trailStations.find((t) => t.trailId === trailId);
        if (!trail) return false;
        return trail.stations.some((station) => station._id === stationId);
      },
    }),
    {
      name: "trail-station-storage",
    },
  ),
);

export default useTrailStationStore;
