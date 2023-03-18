import { c as create_ssr_component, b as subscribe, f as each, d as add_attribute, e as escape } from "./index2.js";
import { L as LL, l as locale } from "./i18n-svelte.js";
const Menu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  let $$unsubscribe_locale;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_locale = subscribe(locale, (value) => value);
  let path1;
  let path2;
  $$unsubscribe_LL();
  $$unsubscribe_locale();
  return `<ul class="${"categories"}">${each(Object.entries($LL.side_menu), ([maindir, { title, contents }]) => {
    return `<li class="${"category"}"><button${add_attribute("id", maindir, 0)} class="${["category_title", path1 === maindir ? "open" : ""].join(" ").trim()}"><span class="${"mark"}"></span>
                ${escape(title())}</button>
            <ul class="${"sub_categories"}"><li class="${"sub_categories_list"}">${each(Object.entries(contents), ([subdir, content]) => {
      return `<button class="${["sub_category", path2 === subdir ? "tab_active" : ""].join(" ").trim()}">${escape(content())}
                        </button>`;
    })}
                </li></ul>
        </li>`;
  })}</ul>`;
});
export {
  Menu as M
};
