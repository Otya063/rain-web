<script lang="ts">
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import LauncherInformation from '$lib/admin/LauncherInformation.svelte';
    import Users from '$lib/admin/Users.svelte';
    import { tab_param } from '$ts/main';

    export let data;
    const system_data = data.launcher_system;
    const important_info_data = data.important;
    const defects_and_troubles_info_data = data.defects_and_troubles;
    const management_and_service_info_data = data.management_and_service;
    const ingame_events_info_data = data.ingame_events;
    const updates_and_maintenance_info_data = data.updates_and_maintenance;
    const users_data = data.users;
    const characters_data = data.charactersWithoutBytes;
    const banned_users_data = data.banned_users;
</script>

{#if $tab_param === '' || $tab_param === 'system'}
    <LauncherSystem {system_data} />
{:else if $tab_param === 'info'}
    <LauncherInformation {important_info_data} {defects_and_troubles_info_data} {management_and_service_info_data} {ingame_events_info_data} {updates_and_maintenance_info_data} />
{:else if $tab_param === 'users'}
    <Users {users_data} {characters_data} {banned_users_data} />
{/if}
