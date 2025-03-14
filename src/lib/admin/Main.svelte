<script lang="ts">
    import type { ActionData, PageData } from '../../routes/(app)/admin/$types';
    import Clans from '$lib/admin/Clans.svelte';
    import Distribution from '$lib/admin/DistributionComp/Distribution.svelte';
    import LauncherBanner from '$lib/admin/LauncherBanner.svelte';
    import Information from '$lib/admin/InformationComp/Information.svelte';
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import Users from '$lib/admin/Users.svelte';
    import { adminTabValue, allDistributionData, allInformationData, armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson } from '$utils/client';

    interface Props {
        data: PageData;
        form: ActionData;
        infoAddMode: boolean;
        bnrAddMode: boolean;
        isMobile: boolean;
        distAddMode: boolean;
    }
    let { data, form, infoAddMode = $bindable(), bnrAddMode = $bindable(), isMobile, distAddMode = $bindable() }: Props = $props(); // bindableにしないと動かない
    const systemData = data.launcherSystem;
    const bannerData = data.banners;
    const charactersIdName = data.charIdNamePair;

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

    // ストア変数初期化
    allInformationData.set(data.information);
    allDistributionData.set(data.distributions);
</script>

{#if $adminTabValue === '' || $adminTabValue === 'system'}
    <LauncherSystem {systemData} />
{:else if $adminTabValue === 'info'}
    <Information bind:infoAddMode createdInformation={form?.createdInformation} {isMobile} />
{:else if $adminTabValue === 'users'}
    <Users searchResult={form?.searchResult} {isMobile} />
{:else if $adminTabValue === 'banner'}
    <LauncherBanner bind:bnrAddMode createdBnr={form?.createdBnr} {bannerData} {isMobile} />
{:else if $adminTabValue === 'clan'}
    <Clans
        paginatedClans={form?.paginatedClans}
        paginationClanMeta={form?.paginationClanMeta}
        paginatedAlliances={form?.paginatedAlliances}
        paginationAllianceMeta={form?.paginationAllianceMeta}
        clanNames={form?.nameArr}
        updatedAllianceData={form?.updatedAllianceData}
        {isMobile}
    />
{:else if $adminTabValue === 'distribution'}
    <Distribution {charactersIdName} {isMobile} updatedContentsData={form?.updatedContentsData} bind:distAddMode createdDistribution={form?.createdDistribution} />
{/if}
