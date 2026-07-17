import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// export function formatAndDedupeBusinesses(businesses: ITripStations[]) {
//   const seen = new Set();

//   return businesses
//     .filter((b) => {
//       const key = `${b.geoLocation?.lat}-${b.geoLocation?.long}`;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     })
//     .map((b) => ({
//       _id: b._id,
//       geoLocation: b.geoLocation,
//       name: b.,
//       serviceType: b.serviceType,
//       dmoId: b.dmoId,
//       authorityId: b.authorityId,
//     }));
// }

interface StationsState {
  businesses: ITripStations[];
  originalStations: ITripStations[];
  selectedStationList: ITripStations[];
  selectedStations: IClickedStationProps[];
  selectedStationDetails: IStationDetailsProps[];
  stationDetails: IStationDetailsProps | undefined;
}

const initialState: StationsState = {
  businesses: [],
  originalStations: [],
  selectedStationList: [],
  selectedStations: [],
  selectedStationDetails: [],
  stationDetails: undefined,
};

const stationsSlice = createSlice({
  name: "stations",
  initialState,
  reducers: {
    setBusinesses: (state, action: PayloadAction<ITripStations[]>) => {
      state.businesses = action.payload;
    },

    setOriginalStations: (state, action: PayloadAction<ITripStations[]>) => {
      state.originalStations = action.payload;
    },

    setSelectedStationList: (state, action: PayloadAction<ITripStations[]>) => {
      state.selectedStationList = action.payload;
    },

    setSelectStations: (
      state,
      action: PayloadAction<IClickedStationProps[]>,
    ) => {
      state.selectedStations = action.payload;
    },

    setSelectStationDetails: (
      state,
      action: PayloadAction<IStationDetailsProps[]>,
    ) => {
      state.selectedStationDetails = action.payload;
    },

    setStationDetails: (
      state,
      action: PayloadAction<IStationDetailsProps | undefined>,
    ) => {
      state.stationDetails = action.payload;
    },

    addSelectedStation: (
      state,
      action: PayloadAction<{
        station: ITripStations;
        clickedStation: IClickedStationProps;
        details: IStationDetailsProps;
      }>,
    ) => {
      const { station, clickedStation, details } = action.payload;
      const alreadySelected = state.selectedStationList.some(
        (s) => s._id === station._id,
      );
      if (alreadySelected) return;

      state.selectedStationList.push(station);
      state.selectedStations.push(clickedStation);
      state.selectedStationDetails.push(details);
    },

    removeSelectedStation: (state, action: PayloadAction<string>) => {
      const stationId = action.payload;
      state.selectedStationList = state.selectedStationList.filter(
        (s) => s._id !== stationId,
      );
      state.selectedStations = state.selectedStations.filter(
        (s) => s.stationId !== stationId,
      );
      state.selectedStationDetails = state.selectedStationDetails.filter(
        (d) => d._id !== stationId,
      );
    },

    resetSelected: (state) => {
      state.selectedStationList = [];
      state.selectedStations = [];
      state.selectedStationDetails = [];
    },
  },
});

export const {
  setBusinesses,
  setOriginalStations,
  setSelectedStationList,
  setSelectStations,
  setSelectStationDetails,
  setStationDetails,
  addSelectedStation,
  removeSelectedStation,
  resetSelected,
} = stationsSlice.actions;

export default stationsSlice.reducer;
