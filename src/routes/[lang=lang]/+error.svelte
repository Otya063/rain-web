<script lang="ts">
    import { page } from '$app/stores';
    import ErrorHeader from '$lib/common/ErrorHeader.svelte';
    import LL from '$i18n/i18n-svelte';
    import '$scss/style_error.scss';
</script>

<svelte:head>
    <title>{$LL.E404['title']()}</title>
    <meta name="robots" content="noindex,nofollow" />
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
</svelte:head>

<header>
    <!-- header -->
    <ErrorHeader />
</header>

<main class="main_inner_error">
        <img class="ouch_cat" alt="">
        <h1>{$LL.E404['h1']()}</h1>
        <p class="inner_text">{@html $LL.E404['main_text']()}</p>

</main>
