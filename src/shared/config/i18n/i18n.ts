import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// EN
import enNavbar from "./locales/en/navbar.json";
import enAuth from "./locales/en/auth.json";
import enHome from "./locales/en/home.json";
import enMap from "./locales/en/map.json";
import enDashboard from "./locales/en/dashboard.json";
import enFolklore from "./locales/en/folklore.json";
import enAdmin from "./locales/en/admin.json";
import enLessons from "./locales/en/lessons.json";
import enTests from "./locales/en/tests.json";
import enAchievements from "./locales/en/achievements.json";
import enAssistant from "./locales/en/assistant.json";
import enDictionary from "./locales/en/dictionary.json";
import enProfile from "./locales/en/profile.json";
import enLeaderboard from "./locales/en/leaderboard.json";
import enEvents from "./locales/en/events.json";
import enNotifications from "./locales/en/notifications.json";
import enAiChat from "./locales/en/aiChat.json";

// RU
import ruNavbar from "./locales/ru/navbar.json";
import ruAuth from "./locales/ru/auth.json";
import ruHome from "./locales/ru/home.json";
import ruMap from "./locales/ru/map.json";
import ruDashboard from "./locales/ru/dashboard.json";
import ruFolklore from "./locales/ru/folklore.json";
import ruAdmin from "./locales/ru/admin.json";
import ruLessons from "./locales/ru/lessons.json";
import ruTests from "./locales/ru/tests.json";
import ruAchievements from "./locales/ru/achievements.json";
import ruAssistant from "./locales/ru/assistant.json";
import ruDictionary from "./locales/ru/dictionary.json";
import ruProfile from "./locales/ru/profile.json";
import ruLeaderboard from "./locales/ru/leaderboard.json";
import ruEvents from "./locales/ru/events.json";
import ruNotifications from "./locales/ru/notifications.json";
import ruAiChat from "./locales/ru/aiChat.json";

// KZ
import kzNavbar from "./locales/kz/navbar.json";
import kzAuth from "./locales/kz/auth.json";
import kzHome from "./locales/kz/home.json";
import kzMap from "./locales/kz/map.json";
import kzDashboard from "./locales/kz/dashboard.json";
import kzFolklore from "./locales/kz/folklore.json";
import kzAdmin from "./locales/kz/admin.json";
import kzLessons from "./locales/kz/lessons.json";
import kzTests from "./locales/kz/tests.json";
import kzAchievements from "./locales/kz/achievements.json";
import kzAssistant from "./locales/kz/assistant.json";
import kzDictionary from "./locales/kz/dictionary.json";
import kzProfile from "./locales/kz/profile.json";
import kzLeaderboard from "./locales/kz/leaderboard.json";
import kzEvents from "./locales/kz/events.json";
import kzNotifications from "./locales/kz/notifications.json";
import kzAiChat from "./locales/kz/aiChat.json";

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
        dashboard: enDashboard,
        folklore: enFolklore,
        admin: enAdmin,
        lessons: enLessons,
        tests: enTests,
        achievements: enAchievements,
        assistant: enAssistant,
        dictionary: enDictionary,
        profile: enProfile,
        leaderboard: enLeaderboard,
        events: enEvents,
        notifications: enNotifications,
        aiChat: enAiChat,
      },
      ru: {
        navbar: ruNavbar,
        auth: ruAuth,
        home: ruHome,
        map: ruMap,
        dashboard: ruDashboard,
        folklore: ruFolklore,
        admin: ruAdmin,
        lessons: ruLessons,
        tests: ruTests,
        achievements: ruAchievements,
        assistant: ruAssistant,
        dictionary: ruDictionary,
        profile: ruProfile,
        leaderboard: ruLeaderboard,
        events: ruEvents,
        notifications: ruNotifications,
        aiChat: ruAiChat,
      },
      kz: {
        navbar: kzNavbar,
        auth: kzAuth,
        home: kzHome,
        map: kzMap,
        dashboard: kzDashboard,
        folklore: kzFolklore,
        admin: kzAdmin,
        lessons: kzLessons,
        tests: kzTests,
        achievements: kzAchievements,
        assistant: kzAssistant,
        dictionary: kzDictionary,
        profile: kzProfile,
        leaderboard: kzLeaderboard,
        events: kzEvents,
        notifications: kzNotifications,
        aiChat: kzAiChat,
      },
    },
    ns: [
      "navbar",
      "auth",
      "home",
      "map",
      "dashboard",
      "folklore",
      "admin",
      "achievements",
      "lessons",
      "tests",
      "assistant",
      "dictionary",
      "profile",
      "leaderboard",
      "events",
      "notifications",
      "aiChat",
    ],
    defaultNS: "home",
  });

export default i18n;
