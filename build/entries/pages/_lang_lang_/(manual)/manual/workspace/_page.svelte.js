import { c as create_ssr_component, v as validate_component } from "../../../../../../chunks/index2.js";
import { M as Menu } from "../../../../../../chunks/Menu.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1qvvz74_START -->${$$result.title = `<title>Workspace</title>`, ""}<!-- HEAD_svelte-1qvvz74_END -->`, ""}

<div class="${"bg"}"><main class="${"main_inner"}"><nav class="${"side_menu slidable_on_mobile"}"><!-- side_menu -->
            ${validate_component(Menu, "Menu").$$render($$result, {}, {}, {})}</nav>

        <article class="${"contents"}"><!-- article --></article></main></div>`;
});
export {
  Page as default
};
