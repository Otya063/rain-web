<script lang="ts">
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import LauncherInformation from '$lib/admin/LauncherInformation.svelte';
    import Users from '$lib/admin/Users.svelte';
    import LauncherBanner from '$lib/admin/LauncherBanner.svelte';
    import { tab_param } from '$ts/main';
    import type { ActionData, PageData } from '../../routes/admin/$types';

    export let data: PageData;
    export let form: ActionData;
    const systemData = data.launcherSystem;
    const importantInfoData = data.important;
    const defectsAndTroublesInfoData = data.defectsAndTroubles;
    const managementAndServiceInfoData = data.managementAndService;
    const ingameEventsInfoData = data.ingameEvents;
    const updatesAndMaintenanceInfoData = data.updatesAndMaintenance;
    const launcherBanner = data.launcherBanner;
</script>

{#if $tab_param === '' || $tab_param === 'system'}
    <LauncherSystem {systemData} />
{:else if $tab_param === 'info'}
    <LauncherInformation {importantInfoData} {defectsAndTroublesInfoData} {managementAndServiceInfoData} {ingameEventsInfoData} {updatesAndMaintenanceInfoData} />
{:else if $tab_param === 'users'}
    <Users {form} />
{:else if $tab_param === 'bnr'}
    <LauncherBanner {launcherBanner} />
{/if}
