import { create } from "zustand";

type FilterType = {
  _id: string;
  name: string;
};

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
  isSearchModalOpen: boolean;
  setIsSerachModalOpen: (isOpen: boolean) => void;
  groupTypes: FilterType[];
  setGroupTypes: (item: FilterType[]) => void;
  accessibilities: FilterType[];
  setAccessibilities: (item: FilterType[]) => void;
  appliedFilterItemCount: number;
  setAppliedFilterItemCount: (count: number) => void;
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
  isSearchModalOpen: false,
  setIsSerachModalOpen: (isOpen) => set({ isSearchModalOpen: isOpen }),
  isOnSection2: false,
  setIsOnSection2: (isOnSection2) => set({ isOnSection2 }),
  groupTypes: [],
  setGroupTypes: (item) => set({ groupTypes: item }),
  accessibilities: [],
  setAccessibilities: (item) => set({ accessibilities: item }),
  appliedFilterItemCount: 0,
  setAppliedFilterItemCount: (count) => set({ appliedFilterItemCount: count }),
}));

export default useGeneralStore;
