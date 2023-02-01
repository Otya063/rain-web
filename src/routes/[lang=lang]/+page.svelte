<script lang="ts">
    import Menu from "$lib/common/Menu.svelte";
    import Top from "$lib/articles/Top.svelte";
    import LL from "$i18n/i18n-svelte";
    import type { PageData } from "./$types";

    // random select for top images (1 ≦ rad ≦ 4)
    export let data: PageData;
    const rad: number = data.r;
</script>

<svelte:head>
    <title>{$LL.articles["home"].head_title()}</title>
</svelte:head>

<div class="top_images">
    <picture>
        <source srcset="../../static/img/common/bg{rad}_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img class="top_img" src="../../static/img/common/bg{rad}.webp" alt="top_pc" />
    </picture>
</div>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <!-- article -->
            <Top />
        </article>
    </main>
</div>
