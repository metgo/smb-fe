import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  selectedAuthority: string;
  selectedWebsite: string;
  dateRange: string;
}

const initialState: FilterState = {
  selectedAuthority: "all",
  selectedWebsite: "all",
  dateRange: "last30days",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setAuthority: (state, action: PayloadAction<string>) => {
      state.selectedAuthority = action.payload;
    },
    setWebsite: (state, action: PayloadAction<string>) => {
      state.selectedWebsite = action.payload;
    },
    setDateRange: (state, action: PayloadAction<string>) => {
      state.dateRange = action.payload;
    },
  },
});

export const { setAuthority, setWebsite, setDateRange } = filterSlice.actions;

export default filterSlice.reducer;
