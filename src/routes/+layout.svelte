<script lang="ts">
    import type { LayoutData } from "./$types";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { setLocale } from "$i18n/i18n-svelte";
    import Alternate from "$lib/common/Alternate.svelte";
    import Header from "$lib/common/Header.svelte";
    import Menu from "$lib/common/Menu.svelte";
    //import BottomNav from '$lib/common/BottomNav.svelte';
    //import Footer from '$lib/common/Footer.svelte';
    import "$scss/style.scss";

    export let data: LayoutData;
    setLocale(data.locale);

    // random numbers for selecting background images (1 ≦ randNum ≦ 4)
    let r: number;
    onMount(async () => {
        r = Math.floor(Math.random() * 4) + 1;
    });
</script>

<svelte:head>
    <title>title</title>
    <meta name="description" content="desc" />
    <meta name="keywords" content="keywords" />
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
    {#if data.locale === "ja"}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap" />
    {:else}
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    {/if}
</svelte:head>

<header>
    <Header />
</header>

{#if $page.url.pathname === `/${data.locale}`}
    <div class="top_images">
        <picture>
            <source srcset="../../static/img/common/bg{r}_sp.webp" media="(max-width: 899px)" type="image/webp" />
            <img class="top_img" src="../../static/img/common/bg{r}.webp" alt="top_pc" />
        </picture>
    </div>
{/if}

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu">
            <Menu />
        </nav>

        <article class="contents">
            <slot />
        </article>
    </main>
</div>

<!-- <div on:click={scrollTop} class="pagetop" /> -->

<nav class="bottom_navigations">
    <!-- <BottomNav /> -->
</nav>

<footer>
    <!-- <Footer /> -->
</footer>
