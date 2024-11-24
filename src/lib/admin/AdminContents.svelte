<script lang="ts">
    import type { ActionData, PageData } from '../../routes/(app)/admin/$types';
    import Clans from '$lib/admin/Clans.svelte';
    import Distribution from '$lib/admin/Distribution.svelte';
    import LauncherBanner from '$lib/admin/LauncherBanner.svelte';
    import LauncherInformation from '$lib/admin/LauncherInformation.svelte';
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import Users from '$lib/admin/Users.svelte';
    import { adminTabValue, armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson } from '$utils/client';

    interface Props {
        data: PageData;
        form: ActionData;
        infoAddMode: boolean;
        bnrAddMode: boolean;
        isMobile: boolean;
    }
    let { data, form, infoAddMode = $bindable(), bnrAddMode = $bindable(), isMobile = $bindable() }: Props = $props(); // bindableにしないと動かない
    const systemData = data.launcherSystem;
    const informationData = data.launcherInformation;
    const launcherBanner = data.launcherBanner;
    const distributions = data.distributions;
    const charactersIdName = data.charactersIdName;

    // 各種アセットデータをjsonからストアへ格納
    headJson.set(data.r2JsonData.head);
    chestJson.set(data.r2JsonData.chest);
    armJson.set(data.r2JsonData.arm);
    waistJson.set(data.r2JsonData.waist);
    legJson.set(data.r2JsonData.leg);
    meleeJson.set(data.r2JsonData.melee);
    rangedJson.set(data.r2JsonData.ranged);
    itemJson.set(data.r2JsonData.item);
    poogieJson.set(data.r2JsonData.poogie);
</script>

{#if $adminTabValue === '' || $adminTabValue === 'system'}
    <LauncherSystem {systemData} />
{:else if $adminTabValue === 'info'}
    <LauncherInformation bind:infoAddMode createdInfo={form?.createdInfo} updatedInfo={form?.updatedInfo} {informationData} bind:isMobile />
{:else if $adminTabValue === 'users'}
    <Users paginatedUsers={form?.paginatedUsers} paginationMeta={form?.paginationMeta} bind:isMobile />
{:else if $adminTabValue === 'bnr'}
    <LauncherBanner bind:bnrAddMode createdBnr={form?.createdBnr} {launcherBanner} bind:isMobile />
{:else if $adminTabValue === 'clan'}
    <Clans
        paginatedClans={form?.paginatedClans}
        paginationClanMeta={form?.paginationClanMeta}
        paginatedAlliances={form?.paginatedAlliances}
        paginationAllianceMeta={form?.paginationAllianceMeta}
        clanNames={form?.nameArr}
        updatedAllianceData={form?.updatedAllianceData}
    />
{:else if $adminTabValue === 'distribution'}
    <Distribution {distributions} {charactersIdName} />
{/if}
