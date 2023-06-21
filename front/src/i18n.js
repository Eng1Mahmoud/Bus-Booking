import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dataAr from "./langs/ar.json";
import dataEn from "./langs/en.json";
i18n
  .use(initReactI18next)

  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      en: {
        translation:dataEn
      },
      ar: {
        translation:dataAr
      }
    }
  });

export default i18n;