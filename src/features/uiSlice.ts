import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isEditMode: boolean;
  showSettings: boolean;
  isSidebarCollapsed: boolean;
  preSelectedBusiness: string | null;
  isNotificationOpen: boolean;
}

const initialState: UIState = {
  isEditMode: false,
  showSettings: false,
  isSidebarCollapsed: false,
  preSelectedBusiness: null,
  isNotificationOpen: false,
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
    toggleNotification: (state) => {
      state.isNotificationOpen = !state.isNotificationOpen;
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
  toggleNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
