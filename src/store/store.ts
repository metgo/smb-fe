import { configureStore } from "@reduxjs/toolkit"
import uiReducer from "@/features/uiSlice"
import authReducer from "@/features/authSlice"
import settingsReducer from "@/features/settingsSlice"
import filterReducer from "@/features/filterSlice"
import themeSlice from "@/features/themeSlice"
import { authApi } from "@/store/api/authApi"
import { analyticsApi } from "@/store/api/analyticsApi"
import { distrbOverviewApi } from "./api/distrbOverviewApi"
import { itemStatsApi } from "./api/itemStatsApi"

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    settings: settingsReducer,
    filters: filterReducer,
    theme: themeSlice,

    [authApi.reducerPath]: authApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [distrbOverviewApi.reducerPath]: distrbOverviewApi.reducer,
    [itemStatsApi.reducerPath]: itemStatsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      analyticsApi.middleware,
      distrbOverviewApi.middleware,
      itemStatsApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
