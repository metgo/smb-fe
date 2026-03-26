import { create } from "zustand";

type FilterType = {
  _id: string;
  name: string;
};

export type FeedFilterKey =
  | "categoryIds"
  | "subCategoryIds"
  | "groupTypeIds"
  | "accessibilityIds"
  | "serviceTypes";

type FeedFilterState = Record<FeedFilterKey, string[]>;

const emptyFeedFilterState: FeedFilterState = {
  categoryIds: [],
  subCategoryIds: [],
  groupTypeIds: [],
  accessibilityIds: [],
  serviceTypes: [],
};

type LatLngType = {
  lat: number;
  lng: number;
};

const initialSiteConfig: ISiteConfig = {
  _id: "",

  header: "",
  headerDescription: null,
  headerHe: null,
  headerDescriptionHe: null,
  headerAr: null,
  headerDescriptionAr: null,

  siteTopics: [
    {
      title: "",
      titleHe: null,
      titleAr: null,
      description: null,
      descriptionHe: null,
      descriptionAr: null,

      siteCategories: [
        {
          title: "",
          titleHe: null,
          titleAr: null,
          description: null,
          descriptionHe: null,
          descriptionAr: null,

          businessIds: [],
          eventIds: [],
          poiIds: [],
          tripIds: [],
          productIds: [],
          fundayIds: [],

          isPrimary: false,
          isArchived: false,
          icon: null
        }
      ],

      order: 0,
      isArchived: false
    }
  ]
};

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

  activeFeedItemIndex: number;
  setActiveFeedItemIndex: (v: number) => void;

  hideFirstTwoSection: boolean;
  setHideFirstTwoSection: (v: boolean) => void;

  isMobile: boolean;
  setIsMobile: (v: boolean) => void;

  homePageSectionState: string;
  setHomePageSectionState: (v: string) => void;

  aminitiesInfo: AminitiesInfoType;
  setAminitiesInfo: (v: AminitiesInfoType) => void;

  siteInfo: SiteConfig;
  setSiteInfo: (v: SiteConfig) => void;

  userLiveLocation: LatLngType | null;
  setUserLiveLocation: (v: LatLngType | null) => void;

  clickedOnSoundButton: boolean;
  setClickedOnSoundButton: (v: boolean) => void;

  promotionalItems: PromotionalItem[];
  setPromotionalItems: (v: PromotionalItem[]) => void;

  filterItems: FiltersResponse;
  setFilterItems: (v: FiltersResponse) => void;

  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (v: boolean) => void;

  showFavoriteFeedItems: boolean;
  setShowFavoriteFeedItems: (v: boolean) => void;

  presetFeedFilters: ISiteConfig;
  setPresetFeedFilters: (v: ISiteConfig) => void;

  isCategoryHeaderInView: boolean;
  setIsCategoryHeaderInView: (v: boolean) => void;

  selectedSiteCategories: ISiteCategory[];
  setSelectedSiteCategories: (v: ISiteCategory[]) => void;
  toggleSiteCategory: (cat: ISiteCategory) => void;

  feedSearchKeyword: string;
  setFeedSearchKeyword: (v: string) => void;

  feedFilterState: FeedFilterState;
  toggleFeedFilter: (key: FeedFilterKey, value: string) => void;
  resetFeedFilters: () => void;
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

  aminitiesInfo: {
    event: false,
    trip: false,
    business: false,
    funday: false,
    poi: false,
  },
  setAminitiesInfo: (v) => set({ aminitiesInfo: v }),

  siteInfo: {
    name: "",
    metaTitle: "",
    metaDescription: "",
    siteName: "",
    desktopHomeVideos: [],
    mobileHomeVideos: [],
  },
  setSiteInfo: (v) => set({ siteInfo: v }),

  userLiveLocation: null,
  setUserLiveLocation: (v) => set({ userLiveLocation: v }),

  clickedOnSoundButton: false,
  setClickedOnSoundButton: (v) => set({ clickedOnSoundButton: v }),

  activeFeedItemIndex: 0,
  setActiveFeedItemIndex: (v) => set({ activeFeedItemIndex: v }),

  promotionalItems: [],
  setPromotionalItems: (v) => set({ promotionalItems: v }),

  filterItems: {
    groupTypes: [],
    accessibilities: [],
    categories: [],
    subCategories: [{ _id: "", hebrewName: "", categoryId: "" }],
    displayBusinesses: false,
    displayEvents: false,
    displayFunday: false,
    displayPOI: false,
    displayTrips: false,
  },
  setFilterItems: (v) => set({ filterItems: v }),

  isFilterDrawerOpen: false,
  setIsFilterDrawerOpen: (v) => set({ isFilterDrawerOpen: v }),

  showFavoriteFeedItems: false,
  setShowFavoriteFeedItems: (v) => set({ showFavoriteFeedItems: v }),

  presetFeedFilters: initialSiteConfig,
  setPresetFeedFilters: (v) => set({ presetFeedFilters: v }),

  isCategoryHeaderInView: true,
  setIsCategoryHeaderInView: (v) => set({ isCategoryHeaderInView: v }),

  selectedSiteCategories: [],
  setSelectedSiteCategories: (v) => set({ selectedSiteCategories: v }),
  toggleSiteCategory: (cat) =>
    set((state) => {
      const exists = state.selectedSiteCategories.some(
        (c) => c.title === cat.title,
      );
      return {
        selectedSiteCategories: exists
          ? state.selectedSiteCategories.filter((c) => c.title !== cat.title)
          : [...state.selectedSiteCategories, cat],
      };
    }),

  feedSearchKeyword: "",
  setFeedSearchKeyword: (v) => set({ feedSearchKeyword: v }),

  feedFilterState: emptyFeedFilterState,
  toggleFeedFilter: (key, value) =>
    set((state) => {
      const current = state.feedFilterState[key] ?? [];
      const next = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return { feedFilterState: { ...state.feedFilterState, [key]: next } };
    }),
  resetFeedFilters: () => set({ feedFilterState: emptyFeedFilterState }),
}));

export default useGeneralStore;
