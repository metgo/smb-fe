import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/features/uiSlice";
import authReducer from "@/features/authSlice";
import settingsReducer from "@/features/settingsSlice";
import notificationSlice from "@/features/notificationSlice";
import filterReducer from "@/features/filterSlice";
import themeSlice from "@/features/themeSlice";
import { authApi } from "@/store/api/authApi";
import { analyticsApi } from "@/store/api/analyticsApi";
import { itemStatsApi } from "./api/itemStatsApi";
import { masterDataApi } from "./api/masterDataApi";
import { eventMutationApi } from "./api/eventMutationApi";
import { businessMutationApi } from "./api/businessMutationApi";
import { businessQueryApi } from "./api/businessQueryApi";
import { voucherMutationApi } from "./api/voucherMutationApi";
import { voucherQueryApi } from "./api/voucherQueryApi";
import { eventQueryApi } from "./api/eventQueryApi";
import { orderQueryApi } from "./api/orderQueryApi";
import { orderMutationApi } from "./api/orderMutationApi";
import { userMutationApi } from "./api/userMutationApi";
import { userQueryApi } from "./api/userQueryApi";
import { mediaMutationApi } from "./api/mediaMutationApi";
import { productMutationApi } from "./api/productMutationApi";
import { productQueryApi } from "./api/productQueryApi";
import { commonMutationApi } from "./api/commonMutationApi";
import { saveSettings, saveUserInfo } from "@/lib/storage";
import { contentMutationApi } from "./api/contentMutationApi";
import { contentQueryApi } from "./api/contentQueryApi";
import { notificationApi } from "./api/notificationApi";
import { tripQueryApi } from "./api/tripsQueryApi";
import { poiQueryApi } from "./api/poiQueryApi";
import { dynamicPageApi } from "./api/dynamicPageApi";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    settings: settingsReducer,
    filters: filterReducer,
    theme: themeSlice,
    notification: notificationSlice,
    [authApi.reducerPath]: authApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [itemStatsApi.reducerPath]: itemStatsApi.reducer,
    [masterDataApi.reducerPath]: masterDataApi.reducer,
    [mediaMutationApi.reducerPath]: mediaMutationApi.reducer,
    [commonMutationApi.reducerPath]: commonMutationApi.reducer,
    [orderMutationApi.reducerPath]: orderMutationApi.reducer,

    [productMutationApi.reducerPath]: productMutationApi.reducer,
    [productQueryApi.reducerPath]: productQueryApi.reducer,

    [businessQueryApi.reducerPath]: businessQueryApi.reducer,
    [businessMutationApi.reducerPath]: businessMutationApi.reducer,

    [eventQueryApi.reducerPath]: eventQueryApi.reducer,
    [eventMutationApi.reducerPath]: eventMutationApi.reducer,

    [userQueryApi.reducerPath]: userQueryApi.reducer,
    [orderQueryApi.reducerPath]: orderQueryApi.reducer,
    [userMutationApi.reducerPath]: userMutationApi.reducer,

    [contentQueryApi.reducerPath]: contentQueryApi.reducer,
    [contentMutationApi.reducerPath]: contentMutationApi.reducer,
    [voucherMutationApi.reducerPath]: voucherMutationApi.reducer,

    [voucherQueryApi.reducerPath]: voucherQueryApi.reducer,
    [tripQueryApi.reducerPath]: tripQueryApi.reducer,
    [poiQueryApi.reducerPath]: poiQueryApi.reducer,

    [notificationApi.reducerPath]: notificationApi.reducer,
    [dynamicPageApi.reducerPath]: dynamicPageApi.reducer,
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
      orderMutationApi.middleware,
      eventQueryApi.middleware,
      orderQueryApi.middleware,
      userQueryApi.middleware,
      businessQueryApi.middleware,
      mediaMutationApi.middleware,
      productMutationApi.middleware,
      productQueryApi.middleware,

      commonMutationApi.middleware,
      contentMutationApi.middleware,
      contentQueryApi.middleware,
      voucherMutationApi.middleware,
      voucherQueryApi.middleware,
      notificationApi.middleware,
      dynamicPageApi.middleware,
      tripQueryApi.middleware,
      poiQueryApi.middleware,
    ),
});

store.subscribe(() => {
  saveSettings(store.getState().settings);
  saveUserInfo(store.getState().auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
