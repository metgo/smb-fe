import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "he",
    supportedLngs: ["he", "ar", "en"],
    debug: false,

    ns: ["common", "dashboard", "events", "businesses", "products"],
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

export default i18n;
