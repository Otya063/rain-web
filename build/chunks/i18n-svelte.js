import { initI18nSvelte } from "typesafe-i18n/svelte";
import { a as loadedLocales, l as loadedFormatters } from "./i18n-util.js";
const { locale, LL, setLocale } = initI18nSvelte(loadedLocales, loadedFormatters);
export {
  LL as L,
  locale as l,
  setLocale as s
};
