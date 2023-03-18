import { c as create_ssr_component, b as subscribe, v as validate_component, e as escape, d as add_attribute } from "../../../../../../../chunks/index2.js";
import { M as Menu } from "../../../../../../../chunks/Menu.js";
import { L as LL } from "../../../../../../../chunks/i18n-svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $LL, $$unsubscribe_LL;
  $$unsubscribe_LL = subscribe(LL, (value) => $LL = value);
  let { data } = $$props;
  const { article } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_LL();
  return `<div class="${"bg"}"><main class="${"main_inner"}"><!-- side_menu -->
        <nav class="${"side_menu slidable_on_mobile"}">${validate_component(Menu, "Menu").$$render($$result, {}, {}, {})}</nav>

        <!-- article -->
        <article class="${"contents"}"><h1>${escape(article?.title)}</h1>
            <!-- HTML_TAG_START -->${article?.content}<!-- HTML_TAG_END --></article></main></div>

${$$result.head += `<!-- HEAD_svelte-1d0wz4h_START -->${$$result.title = `<title>${escape(article?.head_title)}</title>`, ""}<meta name="${"description"}"${add_attribute("content", $LL.articles["description"](), 0)}><meta name="${"keywords"}"${add_attribute("content", $LL.articles["keywords"](), 0)}><meta property="${"og:title"}"${add_attribute("content", article?.head_title, 0)}><!-- HEAD_svelte-1d0wz4h_END -->`, ""}`;
});
export {
  Page as default
};
