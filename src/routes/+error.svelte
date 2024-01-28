<script lang="ts">
    import type { LayoutData } from './$types';
    import LL, { setLocale } from '$i18n/i18n-svelte';
    import { onMount } from 'svelte';
    import '$scss/style_error.scss';

    export let data: LayoutData;
    const { url } = data;
    const origin = url.origin;
    setLocale(data.locale);

    // break out of the application-side layout
    onMount(() => {
        const wrapper = document.getElementById('wrapper');
        wrapper?.classList.add('disable_default_wrapper');
    });
</script>

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

<svelte:head>
    <title>{$LL.E404['title']()}</title>
    <meta name="robots" content="noindex,nofollow" />
    <!-- ogp -->
    <meta property="og:image" content="{origin}/img/common/sns_share.webp" />
    <!-- twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <!-- favicon -->
    <link rel="icon" href="/rain-favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
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
