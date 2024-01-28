<script lang="ts">
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';
    import Home from '$lib/manual/articles/Home.svelte';
    import Menu from '$lib/manual/Menu.svelte';
    import { scrollToTop, sideMenuSwitch } from '$lib/utils';

    // random select for top images (1 ≦ rad ≦ 4)
    export let data: PageData;
    const rad: number = data.r;
    const { url } = data;
    const pathname = url.pathname;
</script>

<div class="top_images">
    <picture>
        <source srcset="/img/common/bg{rad}_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img class="top_img" src="/img/common/bg{rad}.webp" alt="top_pc" />
    </picture>
</div>

<button class="menu_btn" on:click={() => sideMenuSwitch()}>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
</button>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu">
            <!-- side_menu -->
            <Menu {pathname} />
        </nav>

        <article class="contents">
            <!-- article -->
            <Home />
        </article>
    </main>
</div>

<!-- scroll to top button for PC -->
<button on:click={scrollToTop} id="scroll_to_top" />

<svelte:head>
    <title>{$LL.manual['manualLabel']()} | {$LL.serverTitle()}</title>
    <meta name="description" content={$LL.manual['description']()} />
    <meta property="og:title" content="{$LL.manual['manualLabel']()} | {$LL.serverTitle()}" />
    <meta property="og:description" content={$LL.manual['description']()} />
</svelte:head>
