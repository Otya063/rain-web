<script lang="ts">
    import Menu from '$lib/common/Menu.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    const { bcrypted } = data;
</script>

<svelte:head>
    <title>Workspace</title>
</svelte:head>

<div class="bg">
    <main class="main_inner">
        <nav class="side_menu slidable_on_mobile">
            <!-- side_menu -->
            <Menu />
        </nav>

        <article class="contents">
            <p>{bcrypted}</p>
            <!-- article -->
        </article>
    </main>
</div>
