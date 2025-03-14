<script lang="ts">
    import type { ActionData } from '../../routes/(app)/admin/$types';
    import DeleteBnr from './ModalComp/DeleteBnr.svelte';
    import DeleteChar from './ModalComp/DeleteChar.svelte';
    import DeleteDistribution from './ModalComp/DeleteDistribution.svelte';
    import DeleteInfo from './ModalComp/DeleteInfo.svelte';
    import DeleteUser from './ModalComp/DeleteUser.svelte';
    import DistributionEditor from './ModalComp/DistributionEditor.svelte';
    import DownloadBinary from './ModalComp/DownloadBinary.svelte';
    import LinkDiscord from './ModalComp/LinkDiscord.svelte';
    import RebuildClan from './ModalComp/RebuildClan.svelte';
    import SuspendUser from './ModalComp/SuspendUser.svelte';
    import { modalStates } from '$utils/client';

    interface Props {
        form: ActionData;
    }
    let { form }: Props = $props();
</script>

{#if $modalStates.suspendUser}
    <SuspendUser suspendedAccount={form?.suspendedAccount} />
{/if}

{#if $modalStates.deleteInfo}
    <DeleteInfo />
{/if}

{#if $modalStates.deleteBnr}
    <DeleteBnr />
{/if}

{#if $modalStates.linkDiscord}
    <LinkDiscord />
{/if}

{#if $modalStates.deleteCharacter}
    <DeleteChar />
{/if}

{#if $modalStates.rebuildClan}
    <RebuildClan />
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

{#if $modalStates.deleteUser}
    <DeleteUser />
{/if}
