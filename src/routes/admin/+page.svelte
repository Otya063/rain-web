<script lang="ts">
    import { page } from '$app/stores';
    import LauncherSystem from '$lib/common/LauncherSystem.svelte';
    import LauncherInformation from '$lib/common/LauncherInformation.svelte';
    import '$scss/style_admin.scss';
    import { onMount } from 'svelte';

    let tabParam: string = '';
    const tabInfoHandler = (value: string) => {
        // tab handling
        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        tabParam = currentURL.searchParams.get('tab')!;
    };

    onMount(() => {
        const currentURL = $page.url;
        const statusParam = currentURL.searchParams.get('status');
        console.log(statusParam)
    });

    export let data;
    const system = data.launcher_system;
    const important_info_data = data.important;
    const defects_and_troubles_info_data = data.defects_and_troubles;
    const management_and_service_info_data = data.management_and_service;
    const ingame_events_info_data = data.ingame_events;
    const updates_and_maintenance_info_data = data.updates_and_maintenance;
</script>

<h1>Admin Only</h1>

<div class="saving_overlay">Saving...</div>

<section class="console_body">
    <ul class="console_menu_list">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('system')}>Launcher System</li>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="console_menu_list_item" on:click={() => tabInfoHandler('info')}>Launcher Information</li>
    </ul>

    {#if tabParam === '' || tabParam === 'system'}
        <LauncherSystem {system} />
    {:else if tabParam === 'info'}
        <LauncherInformation {important_info_data} {defects_and_troubles_info_data} {management_and_service_info_data} {ingame_events_info_data} {updates_and_maintenance_info_data} />
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
