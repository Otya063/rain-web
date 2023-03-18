import { c as create_ssr_component, b as subscribe, e as escape, f as each, d as add_attribute, v as validate_component } from "../../../../../chunks/index2.js";
import { M as Menu } from "../../../../../chunks/Menu.js";
import { L as LL, l as locale } from "../../../../../chunks/i18n-svelte.js";
const Home = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  let $locale, $$unsubscribe_locale;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_locale = subscribe(locale, (value) => $locale = value);
  $$unsubscribe_LL();
  $$unsubscribe_locale();
  return `<h1>${escape($LL.articles["home"].title())}</h1>

<section class="${"news"}"><h2 class="${"news_title"}">${escape($LL.articles["home"].news_title())}</h2>
    <div class="${"news_content"}"><ul class="${"content_list"}"><li class="${"news_date"}"><span>${escape($LL.articles["home"].news_date())}</span></li>
            <li class="${"news_text"}"><!-- HTML_TAG_START -->${$LL.articles["home"].news_text()}<!-- HTML_TAG_END --></li></ul>
        <button class="${"news_more"}"><span>▲</span>
            ${escape($LL.articles["home"].news_more())}</button></div></section>

<section class="${"featured"}"><h2>${escape($LL.articles["home"].featured_title())}</h2>
    <ul class="${"featured_list"}">${each(Object.entries($LL.articles["home"].featured_contents), ([item, { maindir, subdir, alt, text }]) => {
    return `<li><button><dl class="${"featured_items"}"><dt class="${"featured_img " + escape(item, true)}"><img src="${"/img/" + escape($locale, true) + "/featured/featured_" + escape(item, true) + "_chara.webp"}"${add_attribute("alt", alt(), 0)}>
                        </dt><dd class="${"featured_text"}"><!-- HTML_TAG_START -->${text()}<!-- HTML_TAG_END --></dd></dl></button>
            </li>`;
  })}</ul></section>

<section class="${"extlink"}"><h2>${escape($LL.articles["home"].extlink_title())}</h2>
    <ul class="${"extlink_list"}">${each(Object.entries($LL.articles["home"].extlink_contents), ([item, { title, alt, target, rel, href, img_chara }]) => {
    return `<li class="${"extlink_items"}"><a${add_attribute("href", href(), 0)} class="${"extlink_items_link " + escape(item, true)}"${add_attribute("target", target(), 0)}${add_attribute("rel", rel(), 0)}><figure class="${"extlink_frame"}"><img src="${"/img/common/extlink/extlink_frame.webp"}" alt="${""}"></figure>
                    <div class="${"extlink_text_adj"}"><div class="${"extlink_text_content"}"><p class="${"extlink_text_title"}">${escape(title())}</p>
                        </div></div>
                    <figure class="${"extlink_chara"}"><img src="${"/img/common/extlink/" + escape(img_chara(), true) + ".webp"}"${add_attribute("alt", alt(), 0)}>
                    </figure></a>
            </li>`;
  })}</ul></section>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let { data } = $$props;
  const rad = data.r;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_LL();
  return `${$$result.head += `<!-- HEAD_svelte-loo7fd_START -->${$$result.title = `<title>${escape($LL.articles["home"].head_title())}</title>`, ""}<meta name="${"description"}"${add_attribute("content", $LL.articles["description"](), 0)}><meta name="${"keywords"}"${add_attribute("content", $LL.articles["keywords"](), 0)}><meta property="${"og:title"}"${add_attribute("content", $LL.articles["home"].head_title(), 0)}><!-- HEAD_svelte-loo7fd_END -->`, ""}

<div class="${"top_images"}"><picture><source srcset="${"/img/common/bg" + escape(rad, true) + "_sp.webp"}" media="${"(max-width: 899px)"}" type="${"image/webp"}">
        <img class="${"top_img"}" src="${"/img/common/bg" + escape(rad, true) + ".webp"}" alt="${"top_pc"}"></picture></div>

<div class="${"bg"}"><main class="${"main_inner"}"><nav class="${"side_menu slidable_on_mobile"}"><!-- side_menu -->
            ${validate_component(Menu, "Menu").$$render($$result, {}, {}, {})}</nav>

        <article class="${"contents"}"><button>→Go Workspace←</button>
            <!-- article -->
            ${validate_component(Home, "Home").$$render($$result, {}, {}, {})}</article></main></div>`;
});
export {
  Page as default
};
