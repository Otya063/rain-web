<script lang="ts">
    import LauncherSystem from '$lib/common/LauncherSystem.svelte';
    import LauncherInformation from '$lib/common/LauncherInformation.svelte';
    import Users from '$lib/common/Users.svelte';
    import { slide } from 'svelte/transition';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { ActionData } from './$types';
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
    }
    const status_msg: StatusMsg = {
        info_created: 'The information has been successfully created.',
        info_updated: 'The information has been successfully updated.',
        info_deleted: 'The information has been successfully deleted.',
        system_updated: 'The system mode has been successfully updated.',
        user_updated: 'The user data has been successfully updated.',
        user_banned: 'The user has been banned.',
    };

    export let form: ActionData;
    const status: keyof StatusMsg = form?.status;
    let success: boolean = form?.success;
    let error: boolean = form?.error;

    export let data;
    const system_data = data.launcher_system;
    const important_info_data = data.important;
    const defects_and_troubles_info_data = data.defects_and_troubles;
    const management_and_service_info_data = data.management_and_service;
    const ingame_events_info_data = data.ingame_events;
    const updates_and_maintenance_info_data = data.updates_and_maintenance;
    const users_data = data.users;
    const characters_data = data.charactersWithoutBytes ;

    onMount(() => {
        (success || error) &&
            window.setTimeout(function () {
                success = error = false;
            }, 5000);
    });
</script>

<h1>Admin Only</h1>

{#if success}
    <span transition:slide class="status_display">{status_msg[status]}</span>
{/if}

{#if form?.error}
    <span transition:slide class="status_display">{form?.error_data}</span>
{/if}

<section class="console_body">
    <ul class="console_menu_list">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('system')}>Launcher System</li>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('info')}>Launcher Information</li>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('users')}>Users</li>
    </ul>

    {#if tabParam === '' || tabParam === 'system'}
        <LauncherSystem {system_data} />
    {:else if tabParam === 'info'}
        <LauncherInformation {important_info_data} {defects_and_troubles_info_data} {management_and_service_info_data} {ingame_events_info_data} {updates_and_maintenance_info_data} />
    {:else if tabParam === 'users'}
        <Users {users_data} {characters_data} />
    {/if}
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
