import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isEditMode: boolean;
  showSettings: boolean;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  preSelectedBusiness: string | null;
  isNotificationOpen: boolean;
}

const initialState: UIState = {
  isEditMode: false,
  showSettings: false,
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
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
    toggleMobileSidebar: (state) => {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileSidebarOpen = action.payload;
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
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setPreSelectedBusiness,
  toggleNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
