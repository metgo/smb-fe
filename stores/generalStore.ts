import { create } from "zustand";

type FilterType = {
  _id: string;
  name: string;
};

type LatLngType = {
  lat: number;
  lng: number;
};

interface AminitiesInfoType {
  [key: string]: boolean;
}

interface GeneralStoreState {
  zIndex: string;
  setZIndex: (value: string) => void;
  activeCategoryKey: string;
  setActiveCategoryKey: (key: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (key: string) => void;
  activeFilterTabMobile: string;
  setActiveFilterTabMobile: (key: string) => void;

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
  hideFirstTwoSection: boolean;
  setHideFirstTwoSection: (v: boolean) => void;
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
  homePageSectionState: string;
  setHomePageSectionState: (v: string) => void;
  aminitiesInfo: AminitiesInfoType;
  setAminitiesInfo: (v: AminitiesInfoType) => void;

  userLiveLocation: LatLngType | null;
  setUserLiveLocation: (v: LatLngType | null) => void;

  clickedOnSoundButton: boolean;
  setClickedOnSoundButton: (v: boolean) => void;
}

const useGeneralStore = create<GeneralStoreState>((set) => ({
  zIndex: "20",
  setZIndex: (zIndex) => set({ zIndex }),
  activeCategoryKey: "",
  setActiveCategoryKey: (activeCategoryKey) => set({ activeCategoryKey }),

  activeFilterTab: "gallery",
  setActiveFilterTab: (activeFilterTab) => set({ activeFilterTab }),
  activeFilterTabMobile: "gallery",
  setActiveFilterTabMobile: (activeFilterTabMobile) =>
    set({ activeFilterTabMobile }),

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
  hideFirstTwoSection: false,
  setHideFirstTwoSection: (v) => set({ hideFirstTwoSection: v }),
  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),
  homePageSectionState: "first",
  setHomePageSectionState: (v) => set({ homePageSectionState: v }),

  aminitiesInfo: { event: true, trip: true, business: true },
  setAminitiesInfo: (v) => set({ aminitiesInfo: v }),

  userLiveLocation: null,
  setUserLiveLocation: (v) => set({ userLiveLocation: v }),

  clickedOnSoundButton: false,
  setClickedOnSoundButton: (v) => set({ clickedOnSoundButton: v }),
}));

export default useGeneralStore;
