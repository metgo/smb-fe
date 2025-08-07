import { create } from "zustand";

interface GeneralStoreState {
  zIndex: string;
  setZIndex: (value: string) => void;
  activeCategoryKey: string;
  setActiveCategoryKey: (key: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (key: string) => void;
  clickedBusinessId: string;
  setClickedBusinessId: (key: string) => void;
  isOnSection2: boolean;
  setIsOnSection2: (isOnSection2: boolean) => void;
  // not used yet
  navigationPath: string;
  setNevigationPath: (path: string) => void;
}

const useGeneralStore = create<GeneralStoreState>((set) => ({
  zIndex: "20",
  setZIndex: (zIndex) => set({ zIndex }),
  activeCategoryKey: "",
  setActiveCategoryKey: (activeCategoryKey) => set({ activeCategoryKey }),
  activeFilterTab: "gallery",
  setActiveFilterTab: (activeFilterTab) => set({ activeFilterTab }),
  clickedBusinessId: "",
  setClickedBusinessId: (clickedBusinessId) => set({ clickedBusinessId }),
  navigationPath: "",
  setNevigationPath: (navigationPath) => set({ navigationPath }),
  isOnSection2: false,
  setIsOnSection2: (isOnSection2) => set({ isOnSection2 }),
}));

export default useGeneralStore;
