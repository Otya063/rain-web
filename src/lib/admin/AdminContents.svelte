<script lang="ts">
    import type { ActionData, PageData } from '../../routes/(app)/admin/$types';
    import LauncherBanner from '$lib/admin/LauncherBanner.svelte';
    import LauncherInformation from '$lib/admin/LauncherInformation.svelte';
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import Users from '$lib/admin/Users.svelte';
    import { adminTabValue } from '$lib/utils';

    export let data: PageData;
    export let form: ActionData;
    export let addBnrMode: (enable: boolean) => void;
    export let addInfoMode: (enable: boolean) => void;
    export let infoAddMode: boolean;
    export let bnrAddMode: boolean;
    const systemData = data.launcherSystem;
    const informationData = data.launcherInformation;
    const launcherBanner = data.launcherBanner;
</script>

{#if $adminTabValue === '' || $adminTabValue === 'system'}
    <LauncherSystem {systemData} />
{:else if $adminTabValue === 'info'}
    <LauncherInformation bind:addInfoMode bind:infoAddMode createdInfo={form?.createdInfo} updatedInfo={form?.updatedInfo} {informationData} />
{:else if $adminTabValue === 'users'}
    <Users paginatedUsers={form?.paginatedUsers} paginationMeta={form?.paginationMeta} />
{:else if $adminTabValue === 'bnr'}
    <LauncherBanner bind:addBnrMode bind:bnrAddMode createdBnr={form?.createdBnr} {launcherBanner} />
{/if}
