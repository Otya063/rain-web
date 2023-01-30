<script lang="ts">
    import { loadArticle } from "$ts/testFunctions";
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import { setLocale, locale } from "$i18n/i18n-svelte";
    import type { Locales } from "$i18n/i18n-types";
    import { loadLocaleAsync } from "$i18n/i18n-util.async";
    import { replaceLocaleInUrl } from "../../utils";
    import LL from "$i18n/i18n-svelte";

    const switchLocale = async (newLocale: Locales, updateHistoryState = true) => {
        if (!newLocale || $locale === newLocale) return;

        // load new dictionary from server
        await loadLocaleAsync(newLocale);

        // select locale
        setLocale(newLocale);

        // update `lang` attribute
        document.querySelector("html")!.setAttribute("lang", newLocale);

        if (updateHistoryState) {
            // update url to reflect locale changes
            history.pushState({ locale: newLocale }, "", replaceLocaleInUrl($page.url, newLocale));
        }

        // run the `load` function again
        invalidateAll();
    };

    // update locale when navigating via browser back/forward buttons
    const handlePopStateEvent = async ({ state }: PopStateEvent) => switchLocale(state.locale, false);

    // update locale when page store changes
    $: if (browser) {
        const lang = $page.params.lang as Locales;
        switchLocale(lang, false);
        history.replaceState({ ...history.state, locale: lang }, "", replaceLocaleInUrl($page.url, lang));
    }
</script>

<svelte:window on:popstate={handlePopStateEvent} />

<dl class="language_selectArea_list">
    <button on:click={() => loadArticle("ja")} class="LANG language_names pointer" class:selected={"ja" === $locale}>
        <span class="language_mainName">{$LL.header["ja"].main_name()}</span>
        <span class="language_subName">{$LL.header["ja"].sub_name()}</span>
    </button>
    <button on:click={() => loadArticle("en")} class="LANG language_names pointer" class:selected={"en" === $locale}>
        <span class="language_mainName">{$LL.header["en"].main_name()}</span>
        <span class="language_subName">{$LL.header["en"].sub_name()}</span>
    </button>
</dl>
