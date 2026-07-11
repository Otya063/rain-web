<script lang="ts">
    import type { RainServerProps } from '$types';
    import CreateRainServer from './CreateRainServer.svelte';
    import RainServerMain from './RainServerMain.svelte';

    let { createdRainServer, rainServerAddMode = $bindable(), isMobile }: RainServerProps = $props();
</script>

{#if rainServerAddMode}
    <CreateRainServer {createdRainServer} bind:rainServerAddMode {isMobile} />
{:else}
    <RainServerMain bind:rainServerAddMode {isMobile} />
{/if}
