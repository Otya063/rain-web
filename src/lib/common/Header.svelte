<script lang="ts">
    import { locale } from "$i18n/i18n-svelte";
    import { toggleLangSel, loadArticle } from "$ts/testFunctions";
    import { cached_lang } from "$lang/i18n";
    import { jaTrans, enTrans } from "$lang/translation";
    import { onMount } from "svelte";
    import LangSelectArea from "./LangSelectArea.svelte";
    import LL from "$i18n/i18n-svelte";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.header : enTrans.header);

    // select for languages
    const langSelect = (lang: "ja" | "en") => {
        //location.reload(); // reload to reset style of selected language name
        //just update global state on click, and reload current page
        //cached_lang.set(lang);
    };

    // style of selected language
    onMount(async () => {
        const lang_code: string = document.documentElement.lang;
        const now_lang = document.getElementById(lang_code) as HTMLLIElement;
        now_lang.classList.add("selected");
    });
</script>

<div class="header_inner">
    <picture class="header_platform">
        <source srcset="/img/common/platform_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img src="/img/common/platform_pc.webp" alt="pc" />
    </picture>
    <p class="header_logo">
        <button class="header_logo_button" on:click={() => loadArticle($locale)} />
    </p>
    <aside class="header_language">
        <ul>
            <button on:click={toggleLangSel} class="header_language_selector pointer">
                <p>
                    <span class="current_language">{$LL.header["label"]()}</span>
                </p>
            </button>
            <li class="lang_sel_judge">
                <ul class="language_selectArea">
                    <LangSelectArea />
                </ul>
            </li>
        </ul>
    </aside>
</div>
