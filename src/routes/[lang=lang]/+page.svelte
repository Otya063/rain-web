<script lang="ts">
    import type { PageData } from './$types';
    import { scrollToTop } from '$ts/main';
    import Menu from '$lib/common/Menu.svelte';
    import Home from '$lib/articles/Home.svelte';
    import BottomNav from '$lib/common/BottomNav.svelte';
    import LL from '$i18n/i18n-svelte';

    // random select for top images (1 ≦ rad ≦ 4)
    export let data: PageData;
    const rad: number = data.r;
</script>

<svelte:head>
    <title>{$LL.articles['home'].head_title()}</title>
    <meta property="og:title" content={$LL.articles['home'].head_title()} />
    <meta name="twitter:title" content={$LL.articles['home'].head_title()} />
</svelte:head>

<div class="top_images">
    <picture>
        <source srcset="/img/common/bg{rad}_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img class="top_img" src="/img/common/bg{rad}.webp" alt="top_pc" />
    </picture>
</div>

<div class="bg">
    <main class="main_inner">
        <!-- side_menu -->
        <nav class="side_menu slidable_on_mobile">
            <Menu />
        </nav>

        <!-- article -->
        <article class="contents">
            <Home />
        </article>
    </main>
</div>

<button on:click={scrollToTop} id="scroll_to_top" />

<!-- bottom_navigation -->
<nav class="bottom_navigations">
    <BottomNav />
</nav>
