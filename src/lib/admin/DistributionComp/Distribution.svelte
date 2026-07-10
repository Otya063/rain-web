<script lang="ts">
    import type { DistributionProps } from '$types';
    import CreateDistribution from './CreateDistribution.svelte';
    import DistributionMain from './DistributionMain.svelte';

    let { charactersIdName, isMobile, updatedContentsData, distAddMode = $bindable(false), createdDistribution }: DistributionProps = $props();
</script>

{#if distAddMode}
    <CreateDistribution {charactersIdName} {isMobile} bind:distAddMode {createdDistribution} />
{:else}
    <DistributionMain {charactersIdName} {isMobile} {updatedContentsData} bind:distAddMode />
{/if}
