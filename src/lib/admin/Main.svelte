<script lang="ts">
    import type { ActionData, PageData } from '../../routes/(app)/admin/$types';
    import Banner from '$lib/admin/BannerComp/Banner.svelte';
    import Distribution from '$lib/admin/DistributionComp/Distribution.svelte';
    // import Information from '$lib/admin/InformationComp/Information.svelte';
    import User from '$lib/admin/UserComp/User.svelte';
    import Clan from '$lib/admin/ClanComp/Clan.svelte';
    import LauncherSystem from '$lib/admin/LauncherSystem.svelte';
    import {
        adminTabValue,
        allBannerData,
        allDistributionData,
        allRainServerData,
        // allInformationData,
        armJson,
        chestJson,
        headJson,
        itemJson,
        legJson,
        meleeJson,
        poogieJson,
        rangedJson,
        waistJson,
    } from '$utils/client';

    interface Props {
        data: PageData;
        form: ActionData;
        infoAddMode: boolean;
        bnrAddMode: boolean;
        isMobile: boolean;
        distAddMode: boolean;
        rainServerAddMode: boolean;
    }
    let { data, form, infoAddMode = $bindable(), bnrAddMode = $bindable(), isMobile, distAddMode = $bindable(), rainServerAddMode = $bindable() }: Props = $props(); // bindableにしないと動かない
    const systemData = data.launcherSystem;
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
    // allInformationData.set(data.information);
    allDistributionData.set(data.distributions);
    allBannerData.set(data.banners);
    allRainServerData.set(data.rainServers);
</script>

{#if $adminTabValue === 'system'}
    <LauncherSystem {systemData} {isMobile} createdRainServer={form?.createdRainServer} bind:rainServerAddMode />
<!-- {:else if $adminTabValue === 'information'}
    <Information bind:infoAddMode createdInformation={form?.createdInformation} {isMobile} /> -->
{:else if $adminTabValue === 'user'}
    <User searchedUsers={form?.searchedUsers} {isMobile} />
{:else if $adminTabValue === 'banner'}
    <Banner bind:bnrAddMode createdBanner={form?.createdBanner} {isMobile} />
{:else if $adminTabValue === 'clan'}
    <Clan {isMobile} />
{:else if $adminTabValue === 'distribution'}
    <Distribution {charactersIdName} {isMobile} updatedContentsData={form?.updatedContentsData} bind:distAddMode createdDistribution={form?.createdDistribution} />
{/if}

<!-- scroll-hint用cssインポート -->
<svelte:head>
    {#if isMobile}
        <link rel="stylesheet" href="https://unpkg.com/scroll-hint@latest/css/scroll-hint.css" />
    {/if}
</svelte:head>
