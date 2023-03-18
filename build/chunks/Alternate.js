import { h as getContext, c as create_ssr_component, b as subscribe, f as each, d as add_attribute } from "./index2.js";
import { b as locales, c as baseLocale } from "./i18n-util.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    updated: stores.updated
  };
};
const page = {
  /** @param {(value: any) => void} fn */
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const replaceLocaleInUrl = (url, locale, full = false) => {
  const [, , ...rest] = url.pathname.split("/");
  const new_pathname = `/${[locale, ...rest].join("/")}`;
  if (!full) {
    return `${new_pathname}${url.search}`;
  }
  const newUrl = new URL(url.toString());
  newUrl.pathname = new_pathname;
  return newUrl.toString();
};
const Alternate = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `${each(locales, (l) => {
    return `<link rel="${"alternate"}"${add_attribute("hreflang", l, 0)}${add_attribute("href", `${replaceLocaleInUrl($page.url, l, true)}`, 0)}>`;
  })}
<link rel="${"alternate"}" hreflang="${"x-default"}"${add_attribute("href", `${replaceLocaleInUrl($page.url, baseLocale, true)}`, 0)}>`;
});
export {
  Alternate as A
};
