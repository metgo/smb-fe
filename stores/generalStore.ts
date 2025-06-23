import { create } from "zustand";

interface GeneralStoreState {
  activeCategoryKey: string;
  setActiveCategoryKey: (key: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (key: string) => void;
}


const useGeneralStore = create<GeneralStoreState>((set) => ({
  activeCategoryKey: "",
  setActiveCategoryKey: (activeCategoryKey) => set({ activeCategoryKey }),
  activeFilterTab: "gallery",
  setActiveFilterTab: (activeFilterTab) => set({ activeFilterTab })
}))

export default useGeneralStore