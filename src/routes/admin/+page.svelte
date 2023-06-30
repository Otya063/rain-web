<script lang="ts">
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import { tweened, type Tweened } from 'svelte/motion';
    import { slide, fade } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
    import { Timeout, success, error, err_details, notice, clicked_submit } from '$ts/main';
    import '$scss/style_admin.scss';

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    let status: keyof StatusMsg;
    let info_id: number;
    let dup_title: string;
    let dup_url: string;
    form?.status ? (status = form?.status) : (status = '');
    form?.info_id ? (info_id = form?.info_id) : (info_id = 0);
    form?.success ? success.set(form!.success) : success.set(false);
    form?.error ? (error.set(form!.error), err_details.set(form!.err_details)) : (error.set(false), err_details.set(''));
    /* form?.dup_errors ? err_details.set(form.dup_errors['dup_title']) : (dup_title = '');
    form?.dup_errors ? err_details.set(form.dup_errors['dup_url']) : (dup_url = ''); */
    clicked_submit.set(false);
    notice.set(false);

    // status messages
    interface StatusMsg {
        [key: string]: string;
    }
    const success_msg: StatusMsg = {
        system_updated: 'The system mode has been successfully updated.',
        maint_all_updated: 'All maintenance modes have been successfully updated.',
        info_created: 'The information has been successfully created.',
        info_updated: `The information (ID: ${info_id}) has been successfully updated.`,
        info_deleted: `The information (ID: ${info_id}) has been successfully deleted.`,
        user_updated: 'The user data has been successfully updated.',
        user_banned: 'The user has been banned.',
        removed_ban: 'The ban against the user has been removed.',
    };

    // message display timer bar
    let t: Timeout | null = null;
    let timerPause: boolean = false;
    let active_err_details: boolean = false;
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
            info_id;
            width.set(100, { duration: 0 });
        }, 5000);
    }

    // toggle error details message
    const toggleErrDetail = () => {
        if (t) {
            if (timerPause) {
                active_err_details = false;
                timerPause = false;
                t.run();
                width.set(0, { duration: t.getRestTime() });
            } else {
                active_err_details = true;
                timerPause = true;
                t.pause();
                width.set($width, { duration: 0 });
            }
        }
    };

    // close the message display manually
    const closeMsgDisplay = () => {
        status = '';
        active_err_details = false;
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
            <p style="padding-top: 0.3%;">An error occurred.</p>
            <button on:click={() => toggleErrDetail()} class="error_view_btn">View Details</button>
        {:else if $notice}
            <span class="material-icons-outlined">notification_important</span>
            <p style="padding-top: 0.3%;">Unauthorized operation detected.</p>
            <button on:click={() => toggleErrDetail()} class="error_view_btn">View Details</button>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => closeMsgDisplay()} class="msg_close_btn" />
        <div class="timer_bar" style={`width: ${$width}%;`} />
    </div>
    {#if active_err_details}
        <div transition:slide class="msg_detail">
            Message Details:
            <p>{$err_details}</p>
        </div>
    {/if}
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
        <AdminContents {data} />
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
