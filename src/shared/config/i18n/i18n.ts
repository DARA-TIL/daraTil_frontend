import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          homePage: {
            home: 'Home'
          },
          mapPage:{
            map: 'Map'
          }
        }
      },
      ru: {
        translation: {
          homePage: {
            home: 'Главная'
          },
          mapPage:{
            map: 'Карта'
          }
        }
      },
      kz: {
        translation: {
          homePage: {
            home: 'Басты бет'
          },
          mapPage:{
            map: 'Карта'
          }
        }
      }
    }
  });

export default i18n;