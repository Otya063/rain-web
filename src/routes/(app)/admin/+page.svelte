<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import DeleteBnr from '$lib/admin/modalContents/DeleteBnr.svelte';
    import DeleteChar from '$lib/admin/modalContents/DeleteChar.svelte';
    import DeleteInfo from '$lib/admin/modalContents/DeleteInfo.svelte';
    import LinkDiscord from '$lib/admin/modalContents/LinkDiscord.svelte';
    import SuspendUser from '$lib/admin/modalContents/SuspendUser.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import { suspendUser, deleteInfo, deleteBnr, linkDiscord, deleteChar, loadArticle, Timeout, msgClosed, errDetailMode, onSubmit, closeMsgDisplay, toggleMsgDetail, timeOut } from '$lib/utils';
    import _ from 'lodash';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import '$scss/style_admin.scss';

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    const { url } = data;
    const origin = url.origin;
    let width: Tweened<number>;

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
    $: if ($onSubmit && $timeOut) {
        closeMsgDisplay($timeOut);
    }
</script>

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
        <span class="left_side_bar" />
        {#if form?.success}
            <span class="material-icons-outlined">check_circle</span>
            <p style="padding-top: 0.3%;">{form?.message}</p>
        {:else if form?.error}
            <span class="material-icons-outlined">warning</span>
            <p style="padding-top: 0.3%;">Error occurred.</p>
            <button id="error_view_btn" class="error_view_btn" on:click={(e) => toggleMsgDetail(e, $timeOut, width)}>View Details</button>
        {/if}
        <button id="msg_close_btn" class="msg_close_btn" on:click={() => closeMsgDisplay($timeOut)} />
        <div class="timer_bar" style={`width: ${$width}%;`} />
    </div>
    {#if $errDetailMode}
        <div transition:slide class="msg_detail">
            Message Details:
            <p>{form?.message}</p>
        </div>
    {/if}
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
    <LinkDiscord createdDiscord={form?.createdDiscord} />
{/if}

{#if $deleteChar}
    <DeleteChar />
{/if}

<main class="console_body">
    <nav class="console_menu">
        <AdminMenu />
    </nav>

    <article class="console_article">
        <h1>
            <span class="material-symbols-outlined">admin_panel_settings</span>
            Admin Console
        </h1>
        <AdminContents {data} {form} />
    </article>
</main>

<footer class="admin_footer">
    <div class="footer_note">
        <p>
            * Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. <br />This community is based on the cooperation of numerous volunteers, and no revenue of any sort is
            generated through this community.
        </p>
    </div>
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
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <!-- font -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="true" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Open+Sans:wght@400;700;800&family=Roboto:wght@400;700;900&display=swap" />
    <!-- icon -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons%7CMaterial+Icons+Outlined" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
</svelte:head>
