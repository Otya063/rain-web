<script lang="ts">
    import type { LayoutData } from '../$types';
    import type { Snippet } from 'svelte';
    import Analytics from '$lib/common/Analytics.svelte';

    interface Props {
        data: LayoutData;
        children: Snippet;
    }
    let { data, children }: Props = $props();
</script>

<Analytics />

{@render children()}

<svelte:head>
    <title>Admin Console</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="description" content="This page is for Rain Server administrators only." />
    <!-- ogp -->
    <meta property="og:title" content="Admin Console | Rain Server" />
    <meta property="og:description" content="This page is for Rain Server administrators only." />
    <meta property="og:image" content="{data.url.origin}/img/common/sns_share.webp" />
    <meta property="og:url" content={String(data.url)} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Rain Server" />
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
    <meta name="mobile-web-app-capable" content="yes" />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <!-- icon -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0..1,0" rel="stylesheet" />
</svelte:head>