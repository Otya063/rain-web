<script lang="ts">
	import { browser } from '$app/environment';
	import { cached_lang } from '../lang/i18n';
	import Header from '../lib/common/Header.svelte';
	import TestMenu from '../lib/common/TestMenu.svelte';
	//import BottomNav from '../lib/common/BottomNav.svelte';
	//import Footer from '../lib/common/Footer.svelte';
	import '../../static/sass/style.scss';

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
</script>

<svelte:head>
	<title>title</title>
	<meta name="description" content="desc" />
	<meta name="keywords" content="keywords" />
	<!-- favicon -->
	<link rel="icon" type="image/png" href="/img/common/favicon.ico" />
	<!-- mobile -->
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
	/>
	<meta name="format-detection" content="telephone=no" />
	<link rel="apple-touch-icon-precomposed" href="/img/common/favicon_sp.png" />
	<!-- font -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
	{#if language === 'ja'}
		<link
			href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;500;700&display=swap"
			rel="stylesheet"
		/>
	{:else}
		<link
			href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap"
			rel="stylesheet"
		/>
	{/if}
</svelte:head>

<header>
	<Header />
</header>

<slot name="top_img" />

<div class="bg">
	<main class="main_inner">
		<nav class="side_menu">
			<TestMenu />
		</nav>

		<article class="contents">
			<p>Visit "<a href="/">Home</a>" to go back root page.</p>
			<slot name="article" />
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
