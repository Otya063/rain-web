<script lang="ts">
    import type { PageData } from './$types';
    import { scrollToTop } from '$ts/main';
    import ManualHeader from '$lib/common/ManualHeader.svelte';
    import Menu from '$lib/common/Menu.svelte';
    import Home from '$lib/articles/Home.svelte';
    import BottomNav from '$lib/common/BottomNav.svelte';
    import LandscapeMode from '$lib/common/LandscapeMode.svelte';
    import ManualFooter from '$lib/common/ManualFooter.svelte';
    import LL from '$i18n/i18n-svelte';
    import '$scss/style_manual.scss';

    // random select for top images (1 ≦ rad ≦ 4)
    export let data: PageData;
    const rad: number = data.r;
</script>

<svelte:head>
    <title>{$LL.articles['home'].head_title()}</title>
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
    <meta property="og:title" content={$LL.articles['home'].head_title()} />
</svelte:head>

<header>
    <!-- header -->
    <ManualHeader />
</header>

<div class="top_images">
    <picture>
        <source srcset="/img/common/bg{rad}_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img class="top_img" src="/img/common/bg{rad}.webp" alt="top_pc" />
    </picture>
</div>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu slidable_on_mobile">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <!-- article -->
            <Home />
        </article>
    </main>
</div>

<button on:click={scrollToTop} id="scroll_to_top" />

<!-- bottom_navigation -->
<nav class="bottom_navigations">
    <BottomNav />
</nav>

<!-- landscape_mode_overlay -->
<LandscapeMode />

<footer>
    <!-- footer -->
    <ManualFooter />
</footer>
