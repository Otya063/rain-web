<script lang="ts">
    import _ from 'lodash';
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import SuspendUser from '$lib/admin/modalContents/SuspendUser.svelte';
    import DeleteInfo from '$lib/admin/modalContents/DeleteInfo.svelte';
    import DeleteBnr from '$lib/admin/modalContents/DeleteBnr.svelte';
    import LinkDiscord from '$lib/admin/modalContents/LinkDiscord.svelte';
    import DeleteChar from '$lib/admin/modalContents/DeleteChar.svelte';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
    import { loadArticle, Timeout, success, error, err_details, errDetailMode, notice, clicked_submit } from '$ts/main';
    import '$scss/style_admin.scss';

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    let status: keyof StatusMsg;
    let targetNumber: number;
    let targetString: string;
    form?.status ? (status = form.status) : (status = '');
    form?.targetNumber ? (targetNumber = form.targetNumber) : (targetNumber = 0);
    form?.targetString ? (targetString = form.targetString) : (targetString = '');
    form?.success ? success.set(form.success) : success.set(false);
    form?.error ? (error.set(form.error), err_details.set(form.err_details)) : (error.set(false), err_details.set(''));
    clicked_submit.set(false);
    notice.set(false);

    // status messages
    interface StatusMsg {
        [key: string]: string;
    }
    const success_msg: StatusMsg = {
        system_updated: 'The system mode has been successfully updated.',
        maint_all_updated: 'All maintenance modes have been successfully updated.',
        info_created: 'The information data has been successfully created.',
        info_updated: `The information data (ID: ${targetNumber}) has been successfully updated.`,
        info_deleted: `The information data (ID: ${targetNumber}) has been successfully deleted.`,
        user_updated: `The user data (Data Column: ${targetString}) has been successfully updated.`,
        suspend_user: `The user account (Username: ${targetString}) was successfully suspended. (Restorable)`,
        permanently_suspend_user: `The user account (Username: ${targetString}) was successfully suspended. (Not Restorable)`,
        unsuspend_user: `The user account (Username: ${targetString}) was successfully unsuspended.`,
        bnr_created: `The banner data (Banner Name: ${targetString}) was successfully created.`,
        bnr_updated: `The banner data (ID: ${targetNumber} / Banner Name: ${targetString}) has been successfully updated.`,
        bnr_deleted: `The banner data (ID: ${targetNumber} / Banner Name: ${targetString}) has been successfully deleted.`,
        link_discord: 'The linking process has been successfully completed.',
        unlink_discord: 'The unlinking process has been successfully completed.',
        delete_character: `The character data (Character Name: ${targetString}) has been successfully deleted. (Restorable)`,
        permanently_delete_character: `The character data (Character Name: ${targetString}) has been successfully deleted. (Not Restorable)`,
        restore_character: `The character data (Character Name: ${targetString}) has been successfully restored.`,
    };

    // message display timer bar
    let t: Timeout | null = null;
    let timerPause: boolean = false;
    let width: Tweened<number>;
    $: if ($success || $error || $notice) {
        width = tweened(100);
        width.set(-1, { duration: 5000 });
        t = new Timeout(() => {
            status = '';
            success.set(false);
            error.set(false);
            notice.set(false);
            err_details.set('');
            targetNumber = 0;
            targetString = '';
            width.set(100, { duration: 0 });
        }, 5000);
    }

    // toggle error details message
    const toggleErrDetail = (e: Event) => {
        // prevent repeatedly pressing btn
        const target = e.target as HTMLButtonElement;
        target.disabled = true;
        target.classList.add('disabled_btn');

        setTimeout(() => {
            // after 1.5s, enable btn
            target.disabled = false;
            target.classList.remove('disabled_btn');
        }, 1500);

        if (t) {
            if (timerPause) {
                errDetailMode.set(false);
                timerPause = false;
                t.run();
                width.set(0, { duration: t.getRestTime() });
            } else {
                errDetailMode.set(true);
                timerPause = true;
                t.pause();
                width.set($width, { duration: 0 });
            }
        }
    };

    // close the message display manually
    const closeMsgDisplay = () => {
        // the message is not closed when the error details are open.
        if ($errDetailMode) {
            return false;
        }

        status = '';
        success.set(false);
        error.set(false);
        notice.set(false);
        width.set(0, { duration: 0 });
        t!.stop();
    };
</script>

<header>
    <div class="header_inner">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="header_platform" />
        <p class="header_logo">
            <button class="header_logo_button" on:click={() => loadArticle('none', 'admin/')} />
        </p>
    </div>
</header>

{#if $clicked_submit}
    <div class="saving_overlay">
        <div class="loader" />
        <p class="saving_overlay_text">Saving...</p>
    </div>
{/if}

<div class="background_img" />

{#if $success || $error || $notice}
    <div transition:fade class="msg_display" class:success={$success} class:error={$error} class:notice={$notice}>
        <span class="left_side_bar" />
        {#if $success}
            <span class="material-icons-outlined">check_circle</span>
            <p style="padding-top: 0.3%;">{success_msg[status]}</p>
        {:else if $error}
            <span class="material-icons-outlined">warning</span>
            <p style="padding-top: 0.3%;">Error occurred.</p>
            <button on:click={(e) => toggleErrDetail(e)} class="error_view_btn">View Details</button>
        {:else if $notice}
            <span class="material-icons-outlined">notification_important</span>
            <p style="padding-top: 0.3%;">Unauthorized operation detected.</p>
            <button on:click={(e) => toggleErrDetail(e)} class="error_view_btn">View Details</button>
        {/if}
        <button on:click={() => closeMsgDisplay()} class="msg_close_btn" />
        <div class="timer_bar" style={`width: ${$width}%;`} />
    </div>
    {#if $errDetailMode}
        <div transition:slide class="msg_detail">
            Message Details:
            <p>{$err_details}</p>
        </div>
    {/if}
{/if}

<SuspendUser />

<DeleteInfo />

<DeleteBnr />

<LinkDiscord />

<DeleteChar />

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

<footer>
    <div class="footer_note">
        <p>
            * Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated
            through this project.
        </p>
    </div>
</footer>

<svelte:head>
    <title>Admin Console</title>
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="description" content="Console page for administrators only." />
    <!-- favicon -->
    <link rel="icon" href="/img/common/rain_favicon.ico?v=1" />
    <link rel="apple-touch-icon" sizes="180x180" href="/img/common/rain_apple_icon.png?v=1" />
    <link rel="manifest" href="/manifest.webmanifest?v=1" />
    <!-- mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
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
