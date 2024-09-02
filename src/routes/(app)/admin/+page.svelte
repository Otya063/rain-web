<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import DeleteBnr from '$lib/admin/modalContents/DeleteBnr.svelte';
    import DeleteChar from '$lib/admin/modalContents/DeleteChar.svelte';
    import DeleteInfo from '$lib/admin/modalContents/DeleteInfo.svelte';
    import DownloadBinary from '$lib/admin/modalContents/DownloadBinary.svelte';
    import LinkDiscord from '$lib/admin/modalContents/LinkDiscord.svelte';
    import RebuildClan from '$lib/admin/modalContents/RebuildClan.svelte';
    import SuspendUser from '$lib/admin/modalContents/SuspendUser.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import {
        suspendUser,
        deleteInfo,
        deleteBnr,
        linkDiscord,
        deleteChar,
        loadArticle,
        Timeout,
        msgClosed,
        errDetailMode,
        onSubmit,
        closeMsgDisplay,
        toggleMsgDetail,
        timeOut,
        adminTabValue,
        rebuildClan,
        downloadBinary,
    } from '$lib/utils';
    import _ from 'lodash';
    import { onMount } from 'svelte';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import { register } from 'swiper/element/bundle';
    import '$scss/style_admin.scss';

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    const { url } = data;
    const origin = url.origin;
    let width: Tweened<number>;
    let loaded = false;
    let isMobile: boolean;

    onMount(() => {
        loaded = true;
        const regex = /iphone;|(android|nokia|blackberry|bb10;).+mobile|android.+fennec|opera.+mobi|windows phone|symbianos/i;
        isMobile = regex.test(navigator.userAgent);
        isMobile && register();
    });

    // message display timer bar
    $: if (form?.success || form?.error) {
        width = tweened(100);
        width.set(0, { duration: 5000 });
        timeOut.set(
            new Timeout(() => {
                msgClosed.set(true);
            }, 5000)
        );
    }

    // reset display when on:submit is performed while a message is being displayed
    $: if ($onSubmit && $timeOut && $timeOut.time !== 0) {
        msgClosed.set(true);
        $timeOut.stop();
    }

    let addBnrMode: (enable: boolean) => void;
    let addInfoMode: (enable: boolean) => void;
    let infoAddMode: boolean;
    let bnrAddMode: boolean;
</script>

{#if !loaded}
    <div transition:fade class="mount_overlay"></div>
{/if}

<header>
    <div class="header_inner">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="header_platform" />
        <p class="header_logo">
            <button class="header_logo_button" on:click={(e) => loadArticle(e, url, 'en', 'root')} />
        </p>
    </div>
</header>

{#if $onSubmit}
    <div class="saving_overlay">
        <div class="loader" />
        <p class="saving_overlay_text">Saving...</p>
    </div>
{/if}

<div class="background_img" />

{#if !$msgClosed}
    <div transition:fade class="msg_display" class:success={form?.success} class:error={form?.error}>
        <div class="msg_display_contents">
            <span class="msg_display_left_bar" />
            {#if form?.success}
                <span class="msg_display_icon material-icons-outlined">check_circle</span>
                <p class="msg_display_status">{form?.message}</p>
            {:else if form?.error}
                <span class="msg_display_icon material-icons-outlined">warning</span>
                <p class="msg_display_status">Error occurred.</p>
                <button id="error_view_btn" class="error_view_btn material-icons-outlined" class:open={$errDetailMode} on:click={(e) => toggleMsgDetail(e, $timeOut, width)}>expand_more</button>
            {/if}
            <button id="msg_close_btn" class="msg_close_btn material-icons-outlined" on:click={() => closeMsgDisplay($timeOut)}>highlight_off</button>
            <div class="timer_bar" style={`width: ${$width}%;`} />
        </div>

        {#if $errDetailMode}
            <div transition:slide class="msg_detail">
                Message Details:
                <p>{@html form?.message}</p>
            </div>
        {/if}
    </div>
{/if}

{#if $suspendUser}
    <SuspendUser suspendedAccount={form?.suspendedAccount} />
{/if}

{#if $deleteInfo}
    <DeleteInfo />
{/if}

{#if $deleteBnr}
    <DeleteBnr />
{/if}

{#if $linkDiscord}
    <LinkDiscord newDiscord={form?.newDiscord} />
{/if}

{#if $deleteChar}
    <DeleteChar />
{/if}

{#if $rebuildClan}
    <RebuildClan />
{/if}

{#if $downloadBinary}
    <DownloadBinary />
{/if}

<main class="console_body">
    {#if isMobile}
        <swiper-container class="console_menu_swiper" direction={'horizontal'} dir="rtl">
            <swiper-slide>
                <div class="console_menu_arrow"></div>
            </swiper-slide>
            <swiper-slide>
                <nav class="console_menu" dir="ltr">
                    <AdminMenu />
                </nav>
            </swiper-slide>
        </swiper-container>
    {:else}
        <nav class="console_menu">
            <AdminMenu />
        </nav>
    {/if}

    <article class="console_article">
        <h1>
            <span class="material-symbols-outlined">admin_panel_settings</span>
            Admin Console

            {#if $adminTabValue === 'bnr' && !bnrAddMode}
                <button class="green_btn" on:click={() => addBnrMode(true)}>
                    <span class="btn_icon material-icons">add</span>
                    <span class="btn_text">Add Banner</span>
                </button>
            {:else if $adminTabValue === 'info' && !infoAddMode}
                <button class="green_btn" type="button" on:click={() => addInfoMode(true)}>
                    <span class="btn_icon material-icons">add</span>
                    <span class="btn_text">Add Information</span>
                </button>
            {/if}
        </h1>

        <AdminContents bind:addBnrMode bind:addInfoMode bind:infoAddMode bind:bnrAddMode {data} {form} />
    </article>
</main>

<footer class="admin_footer">
    <section class="footer_inner">
        <p class="footer_text">
            Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. <br />This community is based on the cooperation of numerous volunteers, and no revenue of any sort is
            generated through this community.
        </p>
    </section>
</footer>

<svelte:head>
    <title>Admin Console</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="description" content="This page is for Rain Server administrators only." />
    <!-- ogp -->
    <meta property="og:title" content="Admin Console | Rain Server" />
    <meta property="og:description" content="This page is for Rain Server administrators only." />
    <meta property="og:image" content="{origin}/img/common/sns_share.webp" />
    <meta property="og:url" content={String(url)} />
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
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="true" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <!-- icon -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons%7CMaterial+Icons+Outlined" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0..1,0" />
</svelte:head>
