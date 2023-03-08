<script lang="ts">
    import { scrollToTop } from '$ts/main';
    import Menu from '$lib/common/Menu.svelte';
    import BottomNav from '$lib/common/BottomNav.svelte';

    export let data;
    const { article } = data;
</script>

<svelte:head>
    <title>{article.head_title}</title>
    <meta property="og:title" content={article.head_title} />
    <meta name="twitter:title" content={article.head_title} />
</svelte:head>

<div class="bg">
    <main class="main_inner">
        <!-- side_menu -->
        <nav class="side_menu slidable_on_mobile">
            <Menu />
        </nav>

        <!-- article -->
        <article class="contents">
            <h1>{article.title}</h1>
            {@html article.content}
        </article>
    </main>
</div>

<button on:click={scrollToTop} id="scroll_to_top" />

<!-- bottom_navigation -->
<nav class="bottom_navigations">
    <BottomNav />
</nav>
