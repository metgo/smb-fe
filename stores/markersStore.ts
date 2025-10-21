import { create } from "zustand";

type BusinessMarker = {
  _id: string;
  geoLocation: {
    lat: string;
    long: string;
    _id: string;
  };
  bussCategoriesId: string[];
  bussSubCategoriesId: string[];
  serviceType: "business" | "service" | string;
  primaryCategoryId: string;
  slug: string;
};

interface MarkersStoreState {
  businessMarkers: BusinessMarker[];
  setBusinessMarkers: (v: BusinessMarker[]) => void;
}

const useMarkersStore = create<MarkersStoreState>((set) => ({
  businessMarkers: [],
  setBusinessMarkers: (v: BusinessMarker[]) => set({ businessMarkers: [...v] }),
}));

export default useMarkersStore;
