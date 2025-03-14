<script lang="ts">
    import { type Distribution } from '$types';
    import CreateDistribution from './CreateDistribution.svelte';
    import DistributionMain from './DistributionMain.svelte';

    interface Props {
        charactersIdName: string[];
        isMobile: boolean;
        updatedContentsData: string;
        distAddMode: boolean;
        createdDistribution: Distribution;
    }
    let { charactersIdName, isMobile, updatedContentsData, distAddMode = $bindable(false), createdDistribution }: Props = $props();
</script>

{#if distAddMode}
    <CreateDistribution {charactersIdName} {isMobile} bind:distAddMode {createdDistribution} />
{:else}
    <DistributionMain {charactersIdName} {isMobile} {updatedContentsData} bind:distAddMode />
{/if}
