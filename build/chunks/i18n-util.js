import { i18n as i18n$1 } from "typesafe-i18n";
import { detectLocale as detectLocale$1 } from "typesafe-i18n/detectors";
const baseLocale = "en";
const locales = [
  "en",
  "ja"
];
const isLocale = (locale) => locales.includes(locale);
const loadedLocales = {};
const loadedFormatters = {};
const i18n = () => i18n$1(loadedLocales, loadedFormatters);
const detectLocale = (...detectors) => detectLocale$1(baseLocale, locales, ...detectors);
export {
  loadedLocales as a,
  locales as b,
  baseLocale as c,
  i18n as d,
  detectLocale as e,
  isLocale as i,
  loadedFormatters as l
};
