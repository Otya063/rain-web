<script lang="ts">
    import type { LayoutData } from './$types';
    import type { Snippet } from 'svelte';
    import LL, { setLocale } from '$i18n/i18n-svelte';
    import Alternate from '$lib/common/Alternate.svelte';
    import Footer from '$lib/common/Footer.svelte';
    import Header from '$lib/common/Header.svelte';
    import '$scss/style_manual.scss';

    interface Props {
        data: LayoutData;
        children: Snippet;
    }
    let { data, children }: Props = $props();
    const { url } = data;
    const pathname = url.pathname;
    const origin = url.origin;

    // ストアにアクセスする前と、レンダリングが行われる前にロケールを設定
    setLocale(data.locale);
</script>

<header>
    <Header {pathname} />
</header>

{@render children()}

<footer class="common_footer">
    <Footer />
</footer>

<svelte:head>
    <!-- ogp -->
    <meta property="og:image" content="{origin}/img/common/sns_share.webp" />
    <meta property="og:url" content={String(url)} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={$LL.serverTitle()} />
    <!-- twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <!-- favicon -->
    <link rel="icon" href="/rain-favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="mobile-web-app-capable" content="yes">
    <!-- alternate -->
    <Alternate />
    <link rel="canonical" href={String(url)} />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    {#if data.locale === 'ja'}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
    {:else}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    {/if}
    <!-- icon -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0..1,0" rel="stylesheet" />
</svelte:head>
