import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// EN
import enNavbar from "./locales/en/navbar.json";
import enAuth from "./locales/en/auth.json";
import enHome from "./locales/en/home.json";
import enMap from "./locales/en/map.json";

// RU
import ruNavbar from "./locales/ru/navbar.json";
import ruAuth from "./locales/ru/auth.json";
import ruHome from "./locales/ru/home.json";
import ruMap from "./locales/ru/map.json";

// KZ
import kzNavbar from "./locales/kz/navbar.json";
import kzAuth from "./locales/kz/auth.json";
import kzHome from "./locales/kz/home.json";
import kzMap from "./locales/kz/map.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        navbar: enNavbar,
        auth: enAuth,
        home: enHome,
        map: enMap,
      },
      ru: {
        navbar: ruNavbar,
        auth: ruAuth,
        home: ruHome,
        map: ruMap,
      },
      kz: {
        navbar: kzNavbar,
        auth: kzAuth,
        home: kzHome,
        map: kzMap,
      },
    },
    ns: ["navbar", "auth", "home", "map"],
    defaultNS: "home", // not critical, we’ll usually pass ns explicitly
  });

export default i18n;
