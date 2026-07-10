<script lang="ts">
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';
    import Menu from '$lib/manual/Menu.svelte';
    import { scrollToTop, sideMenuSwitch } from '$utils/client';

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    const { article } = data;
    const { url } = data;
    const pathname = url.pathname;
</script>

<button class="menu_btn" aria-label="Side Menu Btn" onclick={() => sideMenuSwitch()}>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
</button>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu slidable_on_mobile">
            <Menu {pathname} />
        </nav>

        <article class="contents">
            {#await import(`../../../../../../../lib/manual/articles/contents/${article.maindir}_${article.subdir}.svelte`)}
                <p class="article_loader">Loading</p>
            {:then component}
                <component.default />
            {:catch error}
                <p style="color: red">{error}</p>
            {/await}
        </article>
    </main>
</div>

<!-- PC用上まで戻るボタン -->
<button onclick={scrollToTop} id="scroll_to_top" aria-label="Scroll to Top"></button>

<svelte:head>
    <title>{article.metaTitle} | {$LL.manual['manualLabel']()}</title>
    <meta name="description" content={$LL.manual['description']()} />
    <meta property="og:title" content="{article.metaTitle} | {$LL.manual['manualLabel']()}" />
    <meta property="og:description" content={$LL.manual['description']()} />
</svelte:head>
