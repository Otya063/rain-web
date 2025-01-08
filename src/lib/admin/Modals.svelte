<script lang="ts">
    import type { ActionData } from '../../routes/(app)/admin/$types';
    import DeleteBnr from './modalContents/DeleteBnr.svelte';
    import DeleteChar from './modalContents/DeleteChar.svelte';
    import DeleteDistribution from './modalContents/DeleteDistribution.svelte';
    import DeleteInfo from './modalContents/DeleteInfo.svelte';
    import DistributionEditor from './modalContents/DistributionEditor.svelte';
    import DownloadBinary from './modalContents/DownloadBinary.svelte';
    import LinkDiscord from './modalContents/LinkDiscord.svelte';
    import RebuildClan from './modalContents/RebuildClan.svelte';
    import SuspendUser from './modalContents/SuspendUser.svelte';
    import { suspendUser, deleteInfo, deleteBnr, linkDiscord, deleteChar, rebuildClan, downloadBinary, deleteDistribution, distDescEditor, distTitleEditor } from '$utils/client';

    interface Props {
        form: ActionData;
    }
    let { form }: Props = $props();
</script>

{#if $suspendUser}
    <SuspendUser suspendedAccount={form?.suspendedAccount} />
{/if}

{#if $deleteInfo}
    <DeleteInfo />
{/if}

{#if $deleteBnr}
    <DeleteBnr />
{/if}

{#if $linkDiscord}
    <LinkDiscord newDiscord={form?.newDiscord} />
{/if}

{#if $deleteChar}
    <DeleteChar />
{/if}

{#if $rebuildClan}
    <RebuildClan />
{/if}

{#if $downloadBinary}
    <DownloadBinary />
{/if}

{#if $deleteDistribution}
    <DeleteDistribution />
{/if}

{#if $distDescEditor}
    <DistributionEditor modalTitle={'Description Editor'} editorType={'description'} />
{/if}

{#if $distTitleEditor}
    <DistributionEditor modalTitle={'Title Editor'} editorType={'event_name'} />
{/if}
