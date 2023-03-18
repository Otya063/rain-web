import { i as initFormatters } from "./formatters.js";
import { l as loadedFormatters, a as loadedLocales } from "./i18n-util.js";
const localeTranslationLoaders = {
  en: () => import("./index3.js"),
  ja: () => import("./index4.js")
};
const updateDictionary = (locale, dictionary) => loadedLocales[locale] = { ...loadedLocales[locale], ...dictionary };
const importLocaleAsync = async (locale) => (await localeTranslationLoaders[locale]()).default;
const loadLocaleAsync = async (locale) => {
  updateDictionary(locale, await importLocaleAsync(locale));
  loadFormatters(locale);
};
const loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters());
export {
  loadLocaleAsync as l
};
