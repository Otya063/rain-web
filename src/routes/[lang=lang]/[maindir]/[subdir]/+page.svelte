<script lang="ts">
    import Menu from '$lib/common/Menu.svelte';
    //import BottomNav from '$lib/articles/BottomNav.svelte';

    export let data;
    const { article } = data;
</script>

<svelte:head>
    <title>{article.head_title}</title>
</svelte:head>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <!-- article -->
            <h1>{article.title}</h1>
            {@html article.content}
        </article>
    </main>
</div>

<!-- <nav class="bottom_navigations">
</nav> -->
<!-- <BottomNav /> -->
