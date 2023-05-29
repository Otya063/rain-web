<script lang="ts">
    import LauncherSystem from '$lib/common/LauncherSystem.svelte';
    import LauncherInfo from '$lib/common/LauncherInfo.svelte';

    export let data;
    const { maint_jp, maint_us, maint_eu, update } = data.launcher_system!;
</script>

<h1>Admin Only</h1>

<LauncherSystem {maint_jp} {maint_us} {maint_eu} {update} />

<LauncherInfo />
