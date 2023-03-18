import { b as locales, a as loadedLocales, l as loadedFormatters, d as i18n, i as isLocale, e as detectLocale } from "./i18n-util.js";
import { i as initFormatters } from "./formatters.js";
import en from "./index3.js";
import ja from "./index4.js";
import { initAcceptLanguageHeaderDetector } from "typesafe-i18n/detectors";
const localeTranslations = {
  en,
  ja
};
const loadLocale = (locale) => {
  if (loadedLocales[locale])
    return;
  loadedLocales[locale] = localeTranslations[locale];
  loadFormatters(locale);
};
const loadAllLocales = () => locales.forEach(loadLocale);
const loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters());
loadAllLocales();
const L = i18n();
const handle = async ({ event, resolve }) => {
  const [, lang] = event.url.pathname.split("/");
  if (!lang) {
    const locale2 = getPreferredLocale(event);
    return new Response(null, {
      status: 302,
      headers: { Location: `/${locale2}/manual` }
    });
  }
  const locale = isLocale(lang) ? lang : getPreferredLocale(event);
  const LL = L[locale];
  event.locals.locale = locale;
  event.locals.LL = LL;
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", locale)
  });
};
const getPreferredLocale = ({ request }) => {
  const acceptLanguageDetector = initAcceptLanguageHeaderDetector(request);
  return detectLocale(acceptLanguageDetector);
};
export {
  handle
};
