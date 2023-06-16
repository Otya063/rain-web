<script lang="ts">
    import type { PageData } from './$types';
    import Menu from '$lib/common/ManualMenu.svelte';
    import Home from '$lib/articles/Home.svelte';
    import LL from '$i18n/i18n-svelte';

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
