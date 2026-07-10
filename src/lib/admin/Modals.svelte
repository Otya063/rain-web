<script lang="ts">
    import DeleteBanner from './ModalComp/_DeleteBanner.svelte';
    import DeleteCharacter from './ModalComp/DeleteCharacter.svelte';
    import DeleteDistribution from './ModalComp/_DeleteDistribution.svelte';
    import DeleteInformation from './ModalComp/_DeleteInformation.svelte';
    import DeleteUsers from './ModalComp/DeleteUsers.svelte';
    import SuspendUsers from './ModalComp/SuspendUsers.svelte';
    import DistributionEditor from './ModalComp/DistributionEditor.svelte';
    import DownloadBinary from './ModalComp/DownloadBinary.svelte';
    import LinkDiscord from './ModalComp/LinkDiscord.svelte';
    import DeleteAlliance from './ModalComp/DeleteAlliance.svelte';
    import DeleteClans from './ModalComp/DeleteClans.svelte';
    import RebuildClans from './ModalComp/RebuildClans.svelte';
    import { modalStates } from '$utils/client';
</script>

{#if $modalStates.deleteInformation}
    <DeleteInformation />
{/if}

{#if $modalStates.deleteBanner}
    <DeleteBanner />
{/if}

{#if $modalStates.linkDiscord}
    <LinkDiscord />
{/if}

{#if $modalStates.deleteCharacter}
    <DeleteCharacter />
{/if}

{#if $modalStates.rebuildClan}
    <RebuildClans />
{/if}

{#if $modalStates.deleteClans}
    <DeleteClans />
{/if}

{#if $modalStates.downloadBinary}
    <DownloadBinary />
{/if}

{#if $modalStates.deleteDistribution}
    <DeleteDistribution />
{/if}

{#if $modalStates.distributionEditor}
    <DistributionEditor />
{/if}

{#if $modalStates.deleteUsers}
    <DeleteUsers />
{/if}

{#if $modalStates.suspendUsers}
    <SuspendUsers />
{/if}

{#if $modalStates.deleteAlliance}
    <DeleteAlliance />
{/if}
