<script lang="ts">
    import type { Distribution } from '$types';
    import DistributionList from './DistributionList.svelte';

    interface Props {
        distributions: Distribution[];
        charactersIdName: string[];
        isMobile: boolean;
        updatedContentsData: string;
    }
    let { distributions, charactersIdName, isMobile, updatedContentsData }: Props = $props();
</script>

<DistributionList title="Common" helpText="Shows what was distributed to all characters." {distributions} {charactersIdName} {isMobile} {updatedContentsData} />

<DistributionList
    title="Individual"
    helpText="Shows what was distributed for each character.<br />(Filter by character-id, excluding Common distributions.)"
    {distributions}
    {charactersIdName}
    showCharacterId={true}
    {isMobile}
    {updatedContentsData}
/>
