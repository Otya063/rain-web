<script lang="ts">
    import ClanAllianceTable from './ClanAllianceTable.svelte';
    import type { ClansProps } from '$types';

    let { isMobile }: ClansProps = $props();
</script>

<h2>
    <span class="material-symbols-outlined">diversity_3</span>
    Clan List
</h2>

<div class="console_contents">
    <ClanAllianceTable {isMobile} />
</div>
