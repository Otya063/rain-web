<script lang="ts">
	//import Header from '../lib/Header.svelte';
	//import Menu from '../lib/Menu.svelte';
	//import BottomNav from '../lib/BottomNav.svelte';
	//import Footer from '../lib/Footer.svelte';
	const language = 'ja';
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

<body>
	<div class="wrapper">
		<header>
			<!-- <Header /> -->
		</header>

		<slot name="top_img" />

		<div class="bg">
			<main class="main_inner">
				<nav class="side_menu">
					<!-- <Menu /> -->
				</nav>

				<article class="contents">
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
	</div>
</body>
