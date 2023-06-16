<script lang="ts">
    import AdminMenu from '$lib/admin/AdminMenu.svelte';
    import AdminContents from '$lib/admin/AdminContents.svelte';
    import { tweened } from 'svelte/motion';
    import { slide } from 'svelte/transition';
    import type { ActionData, PageData } from './$types';
    import { Timeout } from '$ts/main';
    import '$scss/style_admin.scss';

    // status messages
    interface StatusMsg {
        info_created: string;
        info_updated: string;
        info_deleted: string;
        system_updated: string;
        user_updated: string;
        user_banned: string;
        removed_ban: string;
    }
    const success_msg: StatusMsg = {
        info_created: 'The information has been successfully created.',
        info_updated: 'The information has been successfully updated.',
        info_deleted: 'The information has been successfully deleted.',
        system_updated: 'The system mode has been successfully updated.',
        user_updated: 'The user data has been successfully updated.',
        user_banned: 'The user has been banned.',
        removed_ban: 'The ban against the user has been removed.',
    };

    // data from the server
    export let data: PageData;
    export let form: ActionData;
    let success: boolean = form?.success;
    let error: boolean = form?.error;
    const status: keyof StatusMsg = form?.status;
    const msg_details: string = form?.msg_details;

    // close the message display manually
    const closeMsgDisplay = () => {
        success = error = false;
    };

    // message display timer bar
    let t: Timeout | null = null;
    let timerPause: boolean = false;
    let msg_details_status: boolean = false;
    const width = tweened(100);
    if (success || error) {
        width.set(0, { duration: 5000 });
        t = new Timeout(() => {
            success = error = false;
        }, 5000);
    }

    // toggle error details message
    const toggleErrDetail = () => {
        if (t) {
            if (timerPause) {
                msg_details_status = false;
                timerPause = false;
                t.run();
                width.set(0, { duration: t.getRestTime() });
            } else {
                msg_details_status = true;
                timerPause = true;
                t.pause();
                width.set($width, { duration: 0 });
            }
        }
    };
</script>

<header>
    <div class="header_inner">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="header_platform" />
    </div>
</header>

<div class="background_img" />

{#if success || error}
    <div transition:slide class="msg_display">
        {#if success}
            {success_msg[status]}
        {:else if error}
            An error occurred.
            <button on:click={() => toggleErrDetail()} class="error_view_btn">View Details</button>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => closeMsgDisplay()} class="msg_close_btn" />
        <div class="bar" style={`width: ${$width}%; background: red; height: 5px; position: absolute; left: 0; bottom: 0;`} />
    </div>
    {#if msg_details_status}
        <div transition:slide class="msg_detail">
            Message Details:
            <p>{msg_details}</p>
        </div>
    {/if}
{/if}

<main class="console_body">
    <nav class="console_menu">
        <AdminMenu />
    </nav>

    <article class="console_article">
        <h1>Admin Console</h1>
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
</svelte:head>
