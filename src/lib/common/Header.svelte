<script lang="ts">
    import { locale } from '$i18n/i18n-svelte';
    import { toggleLangSel, loadArticle } from '$ts/main';
    import LangSelectArea from './LangSelectArea.svelte';
    import LL from '$i18n/i18n-svelte';
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
                    <span class="current_language">
                        {$LL.header['now_lang']()}
                    </span>
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
