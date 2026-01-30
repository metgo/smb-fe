import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  language: string;
  theme: Theme;
  isRTL: boolean;
}

const initialState: SettingsState = {
  language: "en",
  theme: "light",
  isRTL: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      state.isRTL = action.payload === "he" || action.payload === "ar";
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
