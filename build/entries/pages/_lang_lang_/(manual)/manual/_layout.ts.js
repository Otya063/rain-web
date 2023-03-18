import { l as loadLocaleAsync } from "../../../../../chunks/i18n-util.async.js";
import { s as setLocale, L as LL } from "../../../../../chunks/i18n-svelte.js";
import { g as get_store_value } from "../../../../../chunks/index2.js";
const load = async ({ data: { locale } }) => {
  await loadLocaleAsync(locale);
  setLocale(locale);
  get_store_value(LL);
  return { locale };
};
export {
  load
};
