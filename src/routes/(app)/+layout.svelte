<script lang="ts">
    import type { Snippet } from 'svelte';
    import Analytics from '$lib/common/Analytics.svelte';

    interface Props {
        children: Snippet;
    }
    let { children }: Props = $props();
</script>

<Analytics />

{@render children()}
