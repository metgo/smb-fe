import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { store } from "@/store/store";
import { setTextDirection } from "@/features/settingsSlice";

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
      "punch_pass",
      "poi",
      "campaign",
      "trips",
      "tour",
      "content",
      "reconciliation",
      "payments",
      "utm_campaign",
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

// i18next is the single source of truth for "current UI language" — text
// direction (dir) and the Redux `isRTL` field must only ever follow what
// i18next actually resolved and loaded, never be set independently of it.
// Otherwise the two can drift (e.g. dir flips to RTL while text is still
// English because the language bundle failed to load, or vice versa).
//
// Note: this is distinct from `settings.language`, the header-selected
// "API language" used for localized data requests — that one does NOT
// drive i18n and must not be changed here.
i18n.on("languageChanged", (lng) => {
  store.dispatch(setTextDirection(lng as Language));

  const { isRTL } = store.getState().settings;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

export default i18n;
