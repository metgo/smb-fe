import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isEditMode: boolean;
  showSettings: boolean;
  isSidebarCollapsed: boolean;
  preSelectedBusiness: string | null;
}

const initialState: UIState = {
  isEditMode: false,
  showSettings: false,
  isSidebarCollapsed: false,
  preSelectedBusiness: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setPreSelectedBusiness: (state, action: PayloadAction<string | null>) => {
      state.preSelectedBusiness = action.payload;
    },
  },
});

export const {
  toggleEditMode,
  toggleSettings,
  toggleSidebar,
  setPreSelectedBusiness,
} = uiSlice.actions;

export default uiSlice.reducer;
