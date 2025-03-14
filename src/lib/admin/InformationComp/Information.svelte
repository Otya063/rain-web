<script lang="ts">
    import { type Information } from '$types';
    import CreateInformation from './CreateInformation.svelte';
    import InformationMain from './InformationMain.svelte';

    interface Props {
        createdInformation: Information;
        infoAddMode: boolean;
        isMobile: boolean;
    }
    let { createdInformation, infoAddMode = $bindable(false), isMobile }: Props = $props();
</script>

{#if infoAddMode}
    <CreateInformation {createdInformation} bind:infoAddMode {isMobile} />
{:else}
    <InformationMain bind:infoAddMode {isMobile} />
{/if}
