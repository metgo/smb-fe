import { loadSettings } from "@/lib/storage";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  language: Language;
  theme: Theme;
  isRTL: boolean;
}

const persisted = loadSettings();

const initialState: SettingsState = {
  language: persisted?.language ?? "en",
  theme: persisted?.theme ?? "dark",
  isRTL: persisted?.isRTL ?? false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // API language only — selected via the header switcher and sent along
    // with API requests. Must NOT drive static UI text or text direction;
    // those follow the user's saved languagePreference (see setTextDirection).
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    // Static UI text direction — follows the active i18n language, which in
    // turn follows the user's saved languagePreference, not the header's API
    // language switcher.
    setTextDirection: (state, action: PayloadAction<Language>) => {
      state.isRTL = action.payload === "he" || action.payload === "ar";
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setLanguage, setTextDirection, setTheme } =
  settingsSlice.actions;
export default settingsSlice.reducer;
