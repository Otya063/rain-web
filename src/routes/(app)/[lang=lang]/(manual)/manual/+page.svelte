<script lang="ts">
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';
    import Home from '$lib/manual/articles/Home.svelte';
    import Menu from '$lib/manual/Menu.svelte';
    import { scrollToTop, sideMenuSwitch } from '$lib/utils';

    interface Props {
        data: PageData;
    }
    let { data }: Props = $props();
    const rad: number = data.r; // トップ画像をランダム選択 (１から４)
    const { url } = data;
    const pathname = url.pathname;
</script>

<div class="top_images">
    <picture>
        <source srcset="/img/common/bg{rad}_sp.webp" media="(max-width: 899px)" type="image/webp" />
        <img class="top_img" src="/img/common/bg{rad}.webp" alt="top_pc" />
    </picture>
</div>

<button class="menu_btn" aria-label="Side Menu Btn" onclick={() => sideMenuSwitch()}>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
    <span class="menu_btn_line"></span>
</button>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu">
            <Menu {pathname} />
        </nav>

        <article class="contents">
            <Home />
        </article>
    </main>
</div>

<!-- PC用上まで戻るボタン -->
<button onclick={scrollToTop} id="scroll_to_top" aria-label="Scroll to Top"></button>

<svelte:head>
    <title>{$LL.manual['manualLabel']()} | {$LL.serverTitle()}</title>
    <meta name="description" content={$LL.manual['description']()} />
    <meta property="og:title" content="{$LL.manual['manualLabel']()} | {$LL.serverTitle()}" />
    <meta property="og:description" content={$LL.manual['description']()} />
</svelte:head>
