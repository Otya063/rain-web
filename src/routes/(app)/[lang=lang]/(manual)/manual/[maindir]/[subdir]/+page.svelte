<script lang="ts">
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';
    import Menu from '$lib/manual/Menu.svelte';
    import { scrollToTop, sideMenuSwitch } from '$lib/utils';

    export let data: PageData;
    const { article } = data;
    const { url } = data;
    const pathname = url.pathname;
</script>

<button class="menu_btn" on:click={() => sideMenuSwitch()}>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
</button>

<div class="bg">
    <main class="main_inner">
        <!-- side_menu -->
        <nav class="side_menu slidable_on_mobile">
            <Menu {pathname} />
        </nav>

        <!-- article -->
        <article class="contents">
            {#await import(`../../../../../../../lib/manual/articles/contents/${article.maindir}_${article.subdir}.svelte`)}
                <p class="article_loader">Loading</p>
            {:then component}
                <svelte:component this={component.default} />
            {:catch error}
                <p style="color: red">{error}</p>
            {/await}
        </article>
    </main>
</div>

<!-- scroll to top button for PC -->
<button on:click={scrollToTop} id="scroll_to_top" />

<svelte:head>
    <title>{article.metaTitle} | {$LL.manual['manualLabel']()}</title>
    <meta name="description" content={$LL.manual['description']()} />
    <meta property="og:title" content="{article.metaTitle} | {$LL.manual['manualLabel']()}" />
    <meta property="og:description" content={$LL.manual['description']()} />
</svelte:head>
