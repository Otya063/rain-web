<script lang="ts">
    import { locale } from '$i18n/i18n-svelte';
    import { toggleLangSel, loadArticle } from '$ts/main';
    import LangSelectArea from './LangSelectArea.svelte';
    import LL from '$i18n/i18n-svelte';
</script>

<div class="header_inner">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="header_platform" />
    <p class="header_logo">
        <button class="header_logo_button" on:click={() => loadArticle($locale)} />
    </p>
    <aside class="header_language">
        <ul>
            <button on:click={toggleLangSel} class="header_language_selector">
                <p>
                    <span class="current_language">
                        {$LL.header['now_lang']()}
                    </span>
                </p>
            </button>
            <li class="lang_sel_judge">
                <ul class="language_selectArea slidable_on_mobile">
                    <LangSelectArea />
                </ul>
            </li>
        </ul>
    </aside>
</div>
