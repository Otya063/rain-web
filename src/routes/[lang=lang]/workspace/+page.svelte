<script lang="ts">
    import ManualHeader from '$lib/common/ManualHeader.svelte';
    import Menu from '$lib/common/Menu.svelte';
    import BottomNav from '$lib/common/BottomNav.svelte';
    import LandscapeMode from '$lib/common/LandscapeMode.svelte';
    import ManualFooter from '$lib/common/ManualFooter.svelte';
    import '$scss/style_manual.scss';
</script>

<svelte:head>
    <title>Workspace</title>
</svelte:head>

<header>
    <!-- header -->
    <ManualHeader />
</header>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu slidable_on_mobile">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <!-- article -->
        </article>
    </main>
</div>

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
