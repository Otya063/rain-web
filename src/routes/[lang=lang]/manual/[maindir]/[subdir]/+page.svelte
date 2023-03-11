<script lang="ts">
    import { scrollToTop } from '$ts/main';
    import ManualHeader from '$lib/common/ManualHeader.svelte';
    import Menu from '$lib/common/Menu.svelte';
    import BottomNav from '$lib/common/BottomNav.svelte';
    import LandscapeMode from '$lib/common/LandscapeMode.svelte';
    import ManualFooter from '$lib/common/ManualFooter.svelte';
    import LL from '$i18n/i18n-svelte';
    import '$scss/style_manual.scss';

    export let data;
    const { article } = data;
</script>

<svelte:head>
    <title>{article.head_title}</title>
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
    <meta property="og:title" content={article.head_title} />
</svelte:head>

<header>
    <!-- header -->
    <ManualHeader />
</header>

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

<!-- landscape_mode_overlay -->
<LandscapeMode />

<footer>
    <!-- footer -->
    <ManualFooter />
</footer>
