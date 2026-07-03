<script lang="ts">
    import type { BannerProps } from '$types';
    import BannerMain from './BannerMain.svelte';
    import CreateBanner from './CreateBanner.svelte';

    let { createdBanner, bnrAddMode = $bindable(), isMobile }: BannerProps = $props();
</script>

{#if bnrAddMode}
    <CreateBanner {createdBanner} bind:bnrAddMode {isMobile} />
{:else}
    <BannerMain bind:bnrAddMode {isMobile} />
{/if}
