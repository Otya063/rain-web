<script lang="ts">
    import LauncherSystem from '$lib/common/LauncherSystem.svelte';
    import LauncherInformation from '$lib/common/LauncherInformation.svelte';
    import Users from '$lib/common/Users.svelte';
    import { tweened } from 'svelte/motion';
    import { slide } from 'svelte/transition';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { ActionData, PageData } from './$types';
    import '$scss/style_admin.scss';

    let tabParam: string = '';
    const tabInfoHandler = (value: string) => {
        // tab handling
        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        tabParam = currentURL.searchParams.get('tab')!;
    };

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

    export let data: PageData;
    const system_data = data.launcher_system;
    const important_info_data = data.important;
    const defects_and_troubles_info_data = data.defects_and_troubles;
    const management_and_service_info_data = data.management_and_service;
    const ingame_events_info_data = data.ingame_events;
    const updates_and_maintenance_info_data = data.updates_and_maintenance;
    const users_data = data.users;
    const characters_data = data.charactersWithoutBytes;
    const banned_users_data = data.banned_users;

    export let form: ActionData;
    const status: keyof StatusMsg = form?.status;
    let success: boolean = form?.success;
    let error: boolean = form?.error;
    const error_msg: string = form?.error_msg;

    // close the message display manually
    const closeMsgDisplay = () => {
        success = error = false;
    };

    // message display timer bar
    const width = tweened(100);
    width.set(0, { duration: 5000 });
    onMount(() => {
        (success || error) &&
            window.setTimeout(function () {
                success = error = false;
            }, 5000);
    });
</script>

<header>
    <div class="header_inner">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="header_platform" />
    </div>
</header>

<div transition:slide class="msg_display">
    An error occurred.
    <button class="error_view_btn">View Details</button>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span on:click={() => closeMsgDisplay()} class="msg_close_btn" />
    <div class="bar" style={`width: ${$width}%; background: red; height: 5px; position: absolute; left: 0; bottom: 0;`} />
</div>

{#if success || error}
    <div transition:slide class="msg_display">
        {#if success}
            {success_msg[status]}
        {:else if error}
            An error occurred.
            <button class="error_view_btn">View Details</button>
        {/if}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => closeMsgDisplay()} class="msg_close_btn" />
        <div class="bar" style={`width: ${$width}%; background: red; height: 5px; position: absolute; left: 0; bottom: 0;`} />
    </div>
{/if}

<section class="console_body">
    <ul class="console_menu_list">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('system')}>
            <p class="console_menu_list_link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-adjustments-alt"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 8h4v4h-4z" />
                    <path d="M6 4l0 4" />
                    <path d="M6 12l0 8" />
                    <path d="M10 14h4v4h-4z" />
                    <path d="M12 4l0 10" />
                    <path d="M12 18l0 2" />
                    <path d="M16 5h4v4h-4z" />
                    <path d="M18 4l0 1" />
                    <path d="M18 9l0 11" />
                </svg>
                <span class="console_menu_list_text">Launcher System</span>
            </p>
        </li>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('info')}>
            <p class="console_menu_list_link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-file-info"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    <path d="M11 14h1v4h1" />
                    <path d="M12 11h.01" />
                </svg>
                <span class="console_menu_list_text">Launcher Information</span>
            </p>
        </li>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('users')}>
            <p class="console_menu_list_link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-users"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                </svg>
                <span class="console_menu_list_text">Users</span>
            </p>
        </li>
    </ul>

    <ul class="console_contents">
        {#if tabParam === '' || tabParam === 'system'}
            <LauncherSystem {system_data} />
        {:else if tabParam === 'info'}
            <LauncherInformation {important_info_data} {defects_and_troubles_info_data} {management_and_service_info_data} {ingame_events_info_data} {updates_and_maintenance_info_data} />
        {:else if tabParam === 'users'}
            <Users {users_data} {characters_data} {banned_users_data} />
        {/if}
    </ul>
</section>

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
</svelte:head>
