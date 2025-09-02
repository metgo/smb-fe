import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RemovedStation {
  trailId: string;
  stationId: string;
}

interface TrailStation {
  trailId: string;
  stations: LocalstoreTrailStaionsProps[];
}

interface TrailStationStoreState {
  trailStations: TrailStation[];
  removedStations: RemovedStation[];

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

  removeTrailStation: (trailId: string, stationId: string) => void;
  storeRemovedStation: (trailId: string, stationId: string) => void;
  getRemovedStationsByTrailId: (trailId: string) => string[];
  clearRemovedStation: (trailId: string, stationId: string) => void;
  resetTrailStation: (trailId: string) => void;
}

const useTrailStationStore = create<TrailStationStoreState>()(
  persist(
    (set, get) => ({
      trailStations: [],
      removedStations: [],

      setTrailStations: (trailId, stations) => {
        const updated = [
          ...get().trailStations.filter((t) => t.trailId !== trailId),
          { trailId, stations },
        ];
        set({ trailStations: updated });
      },

      clearTrailStations: () => set({ trailStations: [], removedStations: [] }),

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

        // if station was previously removed, clear it from removed list
        get().clearRemovedStation(trailId, newStation._id);
      },

      isAreadyExistStation: (trailId: string, stationId: string) => {
        const trail = get().trailStations.find((t) => t.trailId === trailId);
        if (!trail) return false;
        return trail.stations.some((station) => station._id === stationId);
      },

      removeTrailStation: (trailId: string, stationId: string) => {
        const trails = get().trailStations;
        const trailIndex = trails.findIndex((t) => t.trailId === trailId);
        if (trailIndex === -1) return;

        const updatedStations = trails[trailIndex].stations.filter(
          (station) => station?._id !== stationId,
        );

        const updatedTrail = {
          ...trails[trailIndex],
          stations: updatedStations,
        };
        const updatedTrails = [...trails];
        updatedTrails[trailIndex] = updatedTrail;

        set({ trailStations: updatedTrails });

        // also store removed station id
        get().storeRemovedStation(trailId, stationId);
      },

      storeRemovedStation: (trailId: string, stationId: string) => {
        const current = get().removedStations;
        if (
          current.some(
            (r) => r.trailId === trailId && r.stationId === stationId,
          )
        )
          return;
        set({ removedStations: [...current, { trailId, stationId }] });
      },

      getRemovedStationsByTrailId: (trailId: string) => {
        return get()
          .removedStations.filter((r) => r.trailId === trailId)
          .map((r) => r.stationId);
      },

      // remove from removedStations if added again
      clearRemovedStation: (trailId: string, stationId: string) => {
        const updated = get().removedStations.filter(
          (r) => !(r.trailId === trailId && r.stationId === stationId),
        );
        set({ removedStations: updated });
      },

      resetTrailStation: (trailId: string) => {
        set((state) => ({
          trailStations: state.trailStations.map((trail) =>
            trail.trailId === trailId
              ? {
                  ...trail,
                  trailStations: [],
                  removedStations: [],
                }
              : trail,
          ),
        }));
      },
    }),
    {
      name: "trail-station-storage",
    },
  ),
);

export default useTrailStationStore;
