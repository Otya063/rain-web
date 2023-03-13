<script lang="ts">
    import type { LayoutData } from './$types';
    import { setLocale } from '$i18n/i18n-svelte';
    import LL from '$i18n/i18n-svelte';
    import Alternate from '$lib/common/Alternate.svelte';

    export let data: LayoutData;
    setLocale(data.locale);
</script>

<svelte:head>
    <title>{$LL.E404['title']()}</title>
    <meta name="robots" content="noindex,nofollow" />
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
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

<div class="error_wrapper">
    <main class="main_inner_error">
        <p class="ouch_cat">
            <img src="/img/common/ouch_cat.webp" alt="" />
        </p>
        <h1 class="error_h1">{$LL.E404['h1']()}</h1>
        <div class="inner_text">
            <p>{$LL.E404['inner_text1']()}</p>
            <ul class="error_cause">
                {#each Object.entries($LL.E404['error_cause']) as [number, cause]}
                    <li>{cause()}</li>
                {/each}
            </ul>
            <p>{$LL.E404['inner_text2']()}</p>
        </div>
        <button class="btn" on:click={() => (location.href = '/')}>{$LL.E404['btn_name']()}</button>
    </main>
    <footer>
        <section class="error_footer">
            <img class="footer_logo" src="/img/common/rain_textlogo.webp" alt="rain_textlogo" />
            <p class="footer_text">{@html $LL.E404['footer_text']()}</p>
        </section>
    </footer>
</div>

<style lang="scss">
    @import '$scss/style_error.scss';
</style>
