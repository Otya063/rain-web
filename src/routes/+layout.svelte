<script lang="ts">
  import { browser } from '$app/environment';
  import { cached_lang } from '$lang/i18n';
  import Header from '$lib/common/Header.svelte';
  import Menu from '$lib/common/Menu.svelte';
  //import BottomNav from '../lib/common/BottomNav.svelte';
  //import Footer from '../lib/common/Footer.svelte';
  import '/static/sass/style.scss';
  import LL from '$i18n/i18n-svelte';

  /*
  ------------------------------------------------------------
  ------------------------------------------------------------
        Initialize The Web Language and Translation
  ------------------------------------------------------------
  ------------------------------------------------------------
  */
  //take value of lang and subscribe it according to global state
  let language: string; //this is local state
  // chached lang is global state
  cached_lang.subscribe((e) => {
    //change local state same as global
    language = e;
    if (browser) {
      //change html tag
      document.documentElement.lang = e;
      //update the local cache
      localStorage.setItem('lang', e);
    }
  });

  // random numbers for selecting background images (1 ≦ randNum ≦ 4)
  const randNum: number = Math.floor(Math.random() * 4) + 1;
  let pathname: string;
  if (browser) {
    pathname = window.location.pathname;
  }
</script>

<svelte:head>
  <title>title</title>
  <meta name="description" content="desc" />
  <meta name="keywords" content="keywords" />
  <!-- favicon -->
  <link rel="icon" type="image/png" href="/static/img/common/favicon.ico" />
  <!-- mobile -->
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
  />
  <meta name="format-detection" content="telephone=no" />
  <link
    rel="apple-touch-icon-precomposed"
    href="/static/img/common/favicon_sp.png"
  />
  <!-- font -->
  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
    crossOrigin="true"
  />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  {#if language === 'ja'}
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap"
    />
  {:else}
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap"
    />
  {/if}
</svelte:head>

<header>
  <Header />
</header>

{#if pathname === '/'}
  <div class="top_images">
    <picture>
      <source
        srcset="/img/common/bg{randNum}_sp.webp"
        media="(max-width: 899px)"
        type="image/webp"
      />
      <img class="top_img" src="/img/common/bg{randNum}.webp" alt="top_pc" />
    </picture>
  </div>
{/if}

<div class="bg">
  <main class="main_inner">
    <nav class="side_menu">
      <Menu />
    </nav>

    <article class="contents">
      <p>{$LL.testText()}</p>
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
