import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/features/uiSlice";
import authReducer from "@/features/authSlice";
import settingsReducer from "@/features/settingsSlice";
import filterReducer from "@/features/filterSlice";
import themeSlice from "@/features/themeSlice";

import { authApi } from "@/store/api/authApi";
import { analyticsApi } from "@/store/api/analyticsApi";
import { itemStatsApi } from "./api/itemStatsApi";
import { masterDataApi } from "./api/masterDataApi";
import { eventMutationApi } from "./api/eventMutationApi";
import { businessMutationApi } from "./api/businessMutationApi";
import { businessQueryApi } from "./api/businessQueryApi";
import { eventQueryApi } from "./api/eventQueryApi";
import { userMutationApi } from "./api/userMutationApi";
import { userQueryApi } from "./api/userQueryApi";
import { mediaMutationApi } from "./api/mediaMutationApi";
import { commonMutationApi } from "./api/commonMutationApi";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    settings: settingsReducer,
    filters: filterReducer,
    theme: themeSlice,

    [authApi.reducerPath]: authApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [itemStatsApi.reducerPath]: itemStatsApi.reducer,
    [businessMutationApi.reducerPath]: businessMutationApi.reducer,
    [masterDataApi.reducerPath]: masterDataApi.reducer,
    [userMutationApi.reducerPath]: userMutationApi.reducer,
    [eventMutationApi.reducerPath]: eventMutationApi.reducer,
    [mediaMutationApi.reducerPath]: mediaMutationApi.reducer,
    [commonMutationApi.reducerPath]: commonMutationApi.reducer,

    [businessQueryApi.reducerPath]: businessQueryApi.reducer,
    [eventQueryApi.reducerPath]: eventQueryApi.reducer,
    [userQueryApi.reducerPath]: userQueryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      analyticsApi.middleware,
      itemStatsApi.middleware,
      masterDataApi.middleware,
      userMutationApi.middleware,
      eventMutationApi.middleware,
      businessMutationApi.middleware,
      eventQueryApi.middleware,
      userQueryApi.middleware,
      businessQueryApi.middleware,
      mediaMutationApi.middleware,
      commonMutationApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
