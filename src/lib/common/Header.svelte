<script lang="ts">
    import LangSelectArea from './LangSelectArea.svelte';
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$lib/utils';

    export let pathname: string;
    let list = false;

    const onClickLangSel = () => {
        const btn = document.getElementById('sel_btn') as HTMLButtonElement;

        btn.disabled = true;
        btn.classList.toggle('lang_arrow_open');

        if (list) {
            setTimeout(() => {
                btn.disabled = false;
            }, 1000);
            list = false;
        } else {
            setTimeout(() => {
                list = true;
                btn.disabled = false;
            }, 700);
        }
    };
</script>

<div class="header_inner">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="header_platform" />
    <p class="header_logo">
        <button class="header_logo_button" on:click={(e) => loadArticle(e, $page.url, $locale, pathname.includes('/manual/') ? 'manual/' : 'root')} />
    </p>
    <button id="sel_btn" on:click={() => onClickLangSel()} class="header_language_selector">
        <span class="global_mark material-icons">public</span>
        <span class="current_language">
            {$LL.header['currentLang']()}
        </span>
        <span class="lang_arrow material-symbols-outlined">expand_more</span>

        {#if list}
            <LangSelectArea />
        {/if}
    </button>
</div>
