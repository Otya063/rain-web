<script lang="ts">
    import Menu from '$lib/common/ManualMenu.svelte';
    import LL from '$i18n/i18n-svelte';

    export let data;
    const { article } = data;
</script>

<div class="bg">
    <main class="main_inner">
        <!-- side_menu -->
        <nav class="side_menu slidable_on_mobile">
            <Menu />
        </nav>

        <!-- article -->
        <article class="contents">
            {#await import(`../../../../../../lib/articles/contents/${article.maindir}_${article.subdir}.svelte`)}
                <p class="article_loader">Loading</p>
            {:then value}
                <svelte:component this={value.default} />
            {:catch}
                <p style="color: red">{$LL.E404['h1']()}</p>
            {/await}
        </article>
    </main>
</div>

<svelte:head>
    <title>{article?.head_title}</title>
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
    <meta property="og:title" content={article?.head_title} />
</svelte:head>
