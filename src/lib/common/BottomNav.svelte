<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import LL from '$i18n/i18n-svelte';

    // bottom navigation scroll event
    let hide_judge = false;
    const handleHide = () => {
        const hide_true = window.pageYOffset > 150;
        hide_true !== hide_judge && (hide_judge = hide_true);
    };
    onMount(() => {
        window.addEventListener('scroll', handleHide);
    });
    $: if (browser) document.querySelector('.bottom_navigations')!.classList.toggle('nav_hide', hide_judge);
</script>

<ul>
    {#each Object.entries($LL.bottom_nav) as [id, { svg_path, text }]}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li {id} class="btm_nav_item">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-category"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                {@html svg_path()}
            </svg>
            {text()}
        </li>
    {/each}
</ul>
