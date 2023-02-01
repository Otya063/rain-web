<script lang="ts">
    import LL from "$i18n/i18n-svelte";

    export let data;
    const { article } = data;
</script>

<svelte:head>
    <title>{article.head_title}</title>
    <meta name="description" content={$LL.articles["home"].description()} />
    <meta name="keywords" content={$LL.articles["home"].keywords()} />
</svelte:head>

<slot>
    <h1>{article.title}</h1>
    {@html article.content}
</slot>
