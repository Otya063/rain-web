<script lang="ts">
    import type { LayoutData } from './$types';
    import { setLocale } from '$i18n/i18n-svelte';
    import LL from '$i18n/i18n-svelte';
    import Alternate from '$lib/common/Alternate.svelte';

    export let data: LayoutData;
    setLocale(data.locale);
</script>

<slot />

<svelte:head>
    <!-- ogp -->
    <meta property="og:url" content="https://online-manual.rain-server.workers.dev/" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content={$LL.articles['description']()} />
    <meta property="og:site_name" content="Rain Server" />
    <meta property="og:image" content="https://online-manual.rain-server.workers.dev/img/common/sns_share.webp" />
    <!-- twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <!-- favicon -->
    <link rel="icon" href="/img/common/rain_favicon.ico?v=1" />
    <link rel="apple-touch-icon" sizes="180x180" href="/img/common/rain_apple_icon.png?v=1" />
    <link rel="manifest" href="/manifest.webmanifest?v=1" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
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
