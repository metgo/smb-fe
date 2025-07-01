import { create } from "zustand";

interface GeneralStoreState {
  activeCategoryKey: string;
  setActiveCategoryKey: (key: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (key: string) => void;
  clickedBusinessId: string;
  setClickedBusinessId: (key: string) => void;
  // not used yet
  navigationPath: string;
  setNevigationPath: (path: string) => void;
}

const useGeneralStore = create<GeneralStoreState>((set) => ({
  activeCategoryKey: "",
  setActiveCategoryKey: (activeCategoryKey) => set({ activeCategoryKey }),
  activeFilterTab: "gallery",
  setActiveFilterTab: (activeFilterTab) => set({ activeFilterTab }),
  clickedBusinessId: "",
  setClickedBusinessId: (clickedBusinessId) => set({ clickedBusinessId }),
  navigationPath: "",
  setNevigationPath: (navigationPath) => set({ navigationPath }),
}));

export default useGeneralStore;
