import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { store } from "@/store/store";
import { setLanguage } from "@/features/settingsSlice";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "he",
    supportedLngs: ["he", "ar", "en"],
    debug: false,

    ns: [
      "common",
      "dashboard",
      "events",
      "businesses",
      "products",
      "poi",
      "tour",
      "content",
      "reconciliation",
    ],
    defaultNS: "common",

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: "/assets/i18n/{{lng}}/{{ns}}.json",
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// i18next is the single source of truth for "current language" — direction
// (dir) and the Redux `language`/`isRTL` fields must only ever follow what
// i18next actually resolved and loaded, never be set independently of it.
// Otherwise the two can drift (e.g. dir flips to RTL while text is still
// English because the language bundle failed to load, or vice versa).
i18n.on("languageChanged", (lng) => {
  store.dispatch(setLanguage(lng as Language));

  const { isRTL } = store.getState().settings;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

export default i18n;
