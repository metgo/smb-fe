import { configureStore } from "@reduxjs/toolkit";
import { isPlainObject } from "redux";
import uiReducer from "@/features/uiSlice";
import chatPopupReducer from "@/features/chatPopupSlice";
import authReducer from "@/features/authSlice";
import settingsReducer from "@/features/settingsSlice";
import notificationSlice from "@/features/notificationSlice";
import filterReducer from "@/features/filterSlice";
import themeSlice from "@/features/themeSlice";
import stationsReducer from "@/features/stationsSlice";
import { authApi } from "@/store/api/authApi";
import { analyticsApi } from "@/store/api/analyticsApi";
import { itemStatsApi } from "./api/itemStatsApi";
import { masterDataApi } from "./api/masterDataApi";
import { eventMutationApi } from "./api/eventMutationApi";
import { eventSessionApi } from "./api/eventSessionApi";
import { businessMutationApi } from "./api/businessMutationApi";
import { businessQueryApi } from "./api/businessQueryApi";
import { voucherMutationApi } from "./api/voucherMutationApi";
import { voucherQueryApi } from "./api/voucherQueryApi";
import { eventQueryApi } from "./api/eventQueryApi";
import { orderQueryApi } from "./api/orderQueryApi";
import { orderMutationApi } from "./api/orderMutationApi";
import { userMutationApi } from "./api/userMutationApi";
import { miniSiteMutationApi } from "./api/miniSiteMutation";
import { miniSiteQueryApi } from "./api/miniSiteQueryApi";
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
import { tripMutationApi } from "./api/tripsMutationApi";
import { poiQueryApi } from "./api/poiQueryApi";
import { poiMutationApi } from "./api/poiMutationApi";
import { dynamicPageApi } from "./api/dynamicPageApi";
import { blogQueryApi } from "./api/blogQueryApi";
import { blogMutationApi } from "./api/blogMutationApi";
import { websiteSettingsApi } from "./api/websiteSettingsApi";
import { documentMutationApi } from "./api/doumentMutationApi";
import { promotionsApi } from "./api/promotionsApi";
import { websiteConfigApi } from "./api/websiteConfigApi";
import { websiteCrashApi } from "./api/websiteCrashApi";
import { businessScoreApi } from "./api/businessScoreApi";
import { siteAnalyticsApi } from "./api/siteAnalyticsApi";
import { campaignApi } from "./api/campaignApi";
import { sessionQueryApi } from "./api/sessionQueryApi";
import { sessionMutationApi } from "./api/sessionMutationApi";
import { reconciliationQueryApi } from "./api/reconciliationQueryApi";
import { paymentQueryApi } from "./api/paymentQueryApi";
import { nprogressMiddleware } from "./nprogressMiddleware";
import { chatSystemApi } from "./api/chatSystemApi";
import { utmCampaignApi } from "./api/utmCampaignApi";
import { emailConfigQueryApi } from "./api/emailConfigQueryApi";
import { emailConfigMutationApi } from "./api/emailConfigMutationApi";
import { emailActivityQueryApi } from "./api/emailActivityQueryApi";
import { emailActivityMutationApi } from "./api/emailActivityMutationApi";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    chatPopup: chatPopupReducer,
    auth: authReducer,
    settings: settingsReducer,
    filters: filterReducer,
    theme: themeSlice,
    notification: notificationSlice,
    stations: stationsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [itemStatsApi.reducerPath]: itemStatsApi.reducer,
    [masterDataApi.reducerPath]: masterDataApi.reducer,
    [mediaMutationApi.reducerPath]: mediaMutationApi.reducer,
    [commonMutationApi.reducerPath]: commonMutationApi.reducer,
    [miniSiteMutationApi.reducerPath]: miniSiteMutationApi.reducer,
    [miniSiteQueryApi.reducerPath]: miniSiteQueryApi.reducer,
    [orderMutationApi.reducerPath]: orderMutationApi.reducer,

    [productMutationApi.reducerPath]: productMutationApi.reducer,
    [productQueryApi.reducerPath]: productQueryApi.reducer,
    [documentMutationApi.reducerPath]: documentMutationApi.reducer,
    [businessQueryApi.reducerPath]: businessQueryApi.reducer,
    [businessMutationApi.reducerPath]: businessMutationApi.reducer,

    [eventQueryApi.reducerPath]: eventQueryApi.reducer,
    [eventMutationApi.reducerPath]: eventMutationApi.reducer,
    [eventSessionApi.reducerPath]: eventSessionApi.reducer,

    [userQueryApi.reducerPath]: userQueryApi.reducer,
    [orderQueryApi.reducerPath]: orderQueryApi.reducer,
    [userMutationApi.reducerPath]: userMutationApi.reducer,

    [contentQueryApi.reducerPath]: contentQueryApi.reducer,
    [contentMutationApi.reducerPath]: contentMutationApi.reducer,
    [voucherMutationApi.reducerPath]: voucherMutationApi.reducer,

    [voucherQueryApi.reducerPath]: voucherQueryApi.reducer,
    [tripQueryApi.reducerPath]: tripQueryApi.reducer,
    [tripMutationApi.reducerPath]: tripMutationApi.reducer,
    [blogQueryApi.reducerPath]: blogQueryApi.reducer,
    [blogMutationApi.reducerPath]: blogMutationApi.reducer,

    [poiQueryApi.reducerPath]: poiQueryApi.reducer,
    [poiMutationApi.reducerPath]: poiMutationApi.reducer,

    [notificationApi.reducerPath]: notificationApi.reducer,
    [dynamicPageApi.reducerPath]: dynamicPageApi.reducer,
    [websiteSettingsApi.reducerPath]: websiteSettingsApi.reducer,
    [promotionsApi.reducerPath]: promotionsApi.reducer,
    [websiteConfigApi.reducerPath]: websiteConfigApi.reducer,
    [websiteCrashApi.reducerPath]: websiteCrashApi.reducer,
    [businessScoreApi.reducerPath]: businessScoreApi.reducer,
    [siteAnalyticsApi.reducerPath]: siteAnalyticsApi.reducer,
    [campaignApi.reducerPath]: campaignApi.reducer,
    [sessionQueryApi.reducerPath]: sessionQueryApi.reducer,
    [sessionMutationApi.reducerPath]: sessionMutationApi.reducer,
    [reconciliationQueryApi.reducerPath]: reconciliationQueryApi.reducer,
    [paymentQueryApi.reducerPath]: paymentQueryApi.reducer,
    [chatSystemApi.reducerPath]: chatSystemApi.reducer,
    [utmCampaignApi.reducerPath]: utmCampaignApi.reducer,
    [emailConfigQueryApi.reducerPath]: emailConfigQueryApi.reducer,
    [emailConfigMutationApi.reducerPath]: emailConfigMutationApi.reducer,
    [emailActivityQueryApi.reducerPath]: emailActivityQueryApi.reducer,
    [emailActivityMutationApi.reducerPath]: emailActivityMutationApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // several RTK Query endpoints intentionally return raw Blob payloads
      // (xlsx/csv/pdf export downloads) - those aren't meant to be
      // serializable, so allow Blob on top of RTK's default isPlain check
      serializableCheck: {
        isSerializable: (value: unknown) => {
          if (value instanceof Blob) return true;
          const type = typeof value;
          return (
            value == null ||
            type === "string" ||
            type === "boolean" ||
            type === "number" ||
            Array.isArray(value) ||
            isPlainObject(value)
          );
        },
      },
    }).concat(
      authApi.middleware,
      analyticsApi.middleware,
      itemStatsApi.middleware,
      masterDataApi.middleware,
      userMutationApi.middleware,
      eventMutationApi.middleware,
      eventSessionApi.middleware,
      businessMutationApi.middleware,
      orderMutationApi.middleware,
      eventQueryApi.middleware,
      orderQueryApi.middleware,
      userQueryApi.middleware,
      businessQueryApi.middleware,
      mediaMutationApi.middleware,
      miniSiteMutationApi.middleware,
      miniSiteQueryApi.middleware,
      productMutationApi.middleware,
      productQueryApi.middleware,
      documentMutationApi.middleware,
      commonMutationApi.middleware,
      contentMutationApi.middleware,
      contentQueryApi.middleware,
      voucherMutationApi.middleware,
      voucherQueryApi.middleware,
      notificationApi.middleware,
      dynamicPageApi.middleware,
      tripQueryApi.middleware,
      tripMutationApi.middleware,
      blogMutationApi.middleware,
      blogQueryApi.middleware,
      poiQueryApi.middleware,
      poiMutationApi.middleware,
      websiteSettingsApi.middleware,
      promotionsApi.middleware,
      websiteConfigApi.middleware,
      websiteCrashApi.middleware,
      businessScoreApi.middleware,
      siteAnalyticsApi.middleware,
      campaignApi.middleware,
      sessionQueryApi.middleware,
      sessionMutationApi.middleware,
      reconciliationQueryApi.middleware,
      paymentQueryApi.middleware,
      chatSystemApi.middleware,
      utmCampaignApi.middleware,
      emailConfigQueryApi.middleware,
      emailConfigMutationApi.middleware,
      emailActivityQueryApi.middleware,
      emailActivityMutationApi.middleware,
      nprogressMiddleware,
    ),
});

store.subscribe(() => {
  saveSettings(store.getState().settings);
  saveUserInfo(store.getState().auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
