import { c as create_ssr_component, b as subscribe, f as each, e as escape, v as validate_component, d as add_attribute } from "../../../../../chunks/index2.js";
import { L as LL, l as locale, s as setLocale } from "../../../../../chunks/i18n-svelte.js";
import { A as Alternate } from "../../../../../chunks/Alternate.js";
const LangSelectArea = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  let $locale, $$unsubscribe_locale;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_locale = subscribe(locale, (value) => $locale = value);
  $$unsubscribe_LL();
  $$unsubscribe_locale();
  return `<dl class="${"language_selectArea_list"}">${each(Object.entries($LL.header["lang_sel"]), ([lang_code, { main_name, sub_name }]) => {
    return `<button class="${["LANG language_names", lang_code === $locale ? "lang_selected" : ""].join(" ").trim()}"><span class="${"language_mainName"}">${escape(main_name())}</span>
            <span class="${"language_subName"}">${escape(sub_name())}</span>
        </button>`;
  })}</dl>`;
});
const ManualHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_locale;
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_locale = subscribe(locale, (value) => value);
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_locale();
  $$unsubscribe_LL();
  return `<div class="${"header_inner"}"><!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="${"header_platform"}"></label>
    <p class="${"header_logo"}"><button class="${"header_logo_button"}"></button></p>
    <aside class="${"header_language"}"><ul><button class="${"header_language_selector"}"><p><span class="${"current_language"}">${escape($LL.header["now_lang"]())}</span></p></button>
            <li class="${"lang_sel_judge"}"><ul class="${"language_selectArea slidable_on_mobile"}">${validate_component(LangSelectArea, "LangSelectArea").$$render($$result, {}, {}, {})}</ul></li></ul></aside></div>`;
});
const BottomNav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_LL();
  return `<ul>${each(Object.entries($LL.bottom_nav), ([id, { svg_path, text }]) => {
    return `<!-- svelte-ignore a11y-click-events-have-key-events -->
        <li${add_attribute("id", id, 0)} class="${"btm_nav_item"}"><svg xmlns="${"http://www.w3.org/2000/svg"}" class="${"icon icon-tabler icon-tabler-category"}" width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" stroke-width="${"2"}" stroke="${"currentColor"}" fill="${"none"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}"><!-- HTML_TAG_START -->${svg_path()}<!-- HTML_TAG_END --></svg>
            ${escape(text())}
        </li>`;
  })}</ul>`;
});
const LandscapeMode = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let landscape;
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let innerWidth = 0;
  let innerHeight = 0;
  landscape = innerWidth > innerHeight;
  $$unsubscribe_LL();
  return `

<div class="${["landscape_mode", landscape ? "detected" : ""].join(" ").trim()}"><span class="${"rotate_text"}">${escape($LL.landscape_mode())}</span>
    <img src="${"/img/common/landscape/rotate_device.webp"}" alt="${"rotate"}" class="${"rotate_device"}">
    <div class="${"now_waiting"}"><img src="${"/img/common/landscape/now_waiting_N1.webp"}" alt="${"N"}">
        <img src="${"/img/common/landscape/now_waiting_O.webp"}" alt="${"O"}">
        <img src="${"/img/common/landscape/now_waiting_W1.webp"}" alt="${"W"}">
        <img src="${"/img/common/landscape/now_waiting_W2.webp"}" alt="${"W"}">
        <img src="${"/img/common/landscape/now_waiting_A.webp"}" alt="${"A"}">
        <img src="${"/img/common/landscape/now_waiting_I1.webp"}" alt="${"I"}">
        <img src="${"/img/common/landscape/now_waiting_T.webp"}" alt="${"T"}">
        <img src="${"/img/common/landscape/now_waiting_I2.webp"}" alt="${"I"}">
        <img src="${"/img/common/landscape/now_waiting_N2.webp"}" alt="${"N"}">
        <img src="${"/img/common/landscape/now_waiting_G.webp"}" alt="${"G"}"></div></div>`;
});
const ManualFooter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  $$unsubscribe_LL();
  return `<section class="${"footer_link"}"><ul class="${"footer_link_list"}">${each(Object.entries($LL.footer), ([img_src, { title, href, alt }]) => {
    return `<li><a${add_attribute("href", href(), 0)} class="${"footer_list_items"}"><figure class="${"footer_list_img"}"><img src="${"/img/common/footer/" + escape(img_src, true) + "_icon.webp"}"${add_attribute("alt", alt(), 0)}></figure>
                    <p class="${"footer_list_title"}"><!-- HTML_TAG_START -->${title()}<!-- HTML_TAG_END -->
                    </p></a>
            </li>`;
  })}</ul>
    <div class="${"footer_note"}"><p><!-- HTML_TAG_START -->${$LL.footer_note()}<!-- HTML_TAG_END --></p></div></section>`;
});
const style_manual = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let { data } = $$props;
  setLocale(data.locale);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_LL();
  return `<header><!-- header -->
    ${validate_component(ManualHeader, "ManualHeader").$$render($$result, {}, {}, {})}</header>

<!-- side_menu + article = page.svelte -->
${slots.default ? slots.default({}) : ``}

<!-- scroll to top button for PC -->
<button id="${"scroll_to_top"}"></button>

<!-- bottom_navigation -->
<nav class="${"bottom_navigations"}">${validate_component(BottomNav, "BottomNav").$$render($$result, {}, {}, {})}</nav>

<!-- landscape_mode_overlay -->
${validate_component(LandscapeMode, "LandscapeMode").$$render($$result, {}, {}, {})}

<footer><!-- footer -->
    ${validate_component(ManualFooter, "ManualFooter").$$render($$result, {}, {}, {})}</footer>

${$$result.head += `<!-- HEAD_svelte-1vtljo0_START --><!-- ogp --><meta property="${"og:url"}" content="${"https://online-manual.rain-server.workers.dev/"}"><meta property="${"og:type"}" content="${"website"}"><meta property="${"og:description"}"${add_attribute("content", $LL.articles["description"](), 0)}><meta property="${"og:site_name"}" content="${"Rain Server"}"><meta property="${"og:image"}" content="${"https://online-manual.rain-server.workers.dev/img/common/sns_share.webp"}"><!-- twitter --><meta name="${"twitter:card"}" content="${"summary_large_image"}"><!-- favicon --><link rel="${"icon"}" href="${"/img/common/rain_favicon.ico?v=1"}"><link rel="${"apple-touch-icon"}" sizes="${"180x180"}" href="${"/img/common/rain_apple_icon.png?v=1"}"><link rel="${"manifest"}" href="${"/manifest.webmanifest?v=1"}"><!-- mobile --><meta name="${"viewport"}" content="${"width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"}"><meta name="${"format-detection"}" content="${"telephone=no"}"><meta name="${"apple-mobile-web-app-status-bar-style"}" content="${"black"}"><meta name="${"apple-mobile-web-app-capable"}" content="${"yes"}"><!-- alternate -->${validate_component(Alternate, "Alternate").$$render($$result, {}, {}, {})}<!-- font --><link rel="${"preconnect"}" href="${"https://fonts.googleapis.com"}" crossorigin="${"true"}"><link rel="${"preconnect"}" href="${"https://fonts.gstatic.com"}" crossorigin="${"true"}">${data.locale === "ja" ? `<link rel="${"preload"}" as="${"style"}" href="${"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap"}">
        <link rel="${"stylesheet"}" href="${"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap"}">` : `<link rel="${"preload"}" as="${"style"}" href="${"https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap"}">
        <link rel="${"stylesheet"}" href="${"https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap"}">`}<!-- HEAD_svelte-1vtljo0_END -->`, ""}`;
});
export {
  Layout as default
};
