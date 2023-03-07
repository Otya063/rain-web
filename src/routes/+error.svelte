<script lang="ts">
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
</script>

<div class="bg">
    <main class="main_inner">
        <h1>{$LL.e404()}</h1>
        <img src="https://http.cat/{$page.status}" alt="{$page.status}_cat" />
    </main>
</div>

<style>
    .main_inner {
        flex-direction: column;
    }

    h1 {
        padding: 3.7% 2%;
    }
</style>
