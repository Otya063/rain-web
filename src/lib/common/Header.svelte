<script lang="ts">
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$lib/utils';
    import LangSelectArea from './LangSelectArea.svelte';

    interface Props {
        pathname: string;
    }
    let { pathname }: Props = $props();
    let list = $state(false);
</script>

<div class="header_inner">
    <label class="header_platform" for=""></label>

    <p class="header_logo">
        <button class="header_logo_button" aria-label="Back to Home" onclick={(e) => loadArticle(e, $page.url, $locale, pathname.includes('/manual/') ? 'manual/' : 'root')}></button>
    </p>

    <button
        id="sel_btn"
        onclick={() => {
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
        }}
        class="header_language_selector"
    >
        <span class="global_mark material-symbols-outlined">public</span>
        
        <span class="current_language">
            {$LL.header['currentLang']()}
        </span>

        <span class="lang_arrow material-symbols-outlined">expand_more</span>

        {#if list}
            <LangSelectArea />
        {/if}
    </button>
</div>
