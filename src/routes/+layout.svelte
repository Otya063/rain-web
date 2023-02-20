<script lang="ts">
    import type { LayoutData } from './$types';
    import { setLocale } from '$i18n/i18n-svelte';
    import LL from '$i18n/i18n-svelte';
    import Header from '$lib/common/Header.svelte';
    import Alternate from '$lib/common/Alternate.svelte';
    import Footer from '$lib/common/Footer.svelte';
    import '$scss/style.scss';

    export let data: LayoutData;
    setLocale(data.locale);
</script>

<svelte:head>
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
    <!-- favicon -->
    <link rel="icon" type="image/png" href="/img/common/favicon.ico" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="apple-touch-icon-precomposed" href="/img/common/favicon_sp.png" />
    <!-- alternate -->
    <Alternate />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="true" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
    {#if data.locale === 'ja'}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
    {:else}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    {/if}
</svelte:head>

<header>
    <!-- header -->
    <Header />
</header>

<!-- menu + article = page.svelte -->
<slot />

<footer>
    <!-- footer -->
    <Footer />
</footer>
