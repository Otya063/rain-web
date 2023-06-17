<script lang="ts">
    import { page } from '$app/stores';
    import { tabParam } from '$ts/main';
    import { onMount } from 'svelte';

    // added "active" class to the first list item when first loaded
    onMount(() => {
        const first_list_item = document.getElementsByClassName('console_menu_list_item')[0] as HTMLLIElement;
        first_list_item.classList.add('active');
    });

    // menu list items for looping
    const menu_list_item = {
        system: {
            text: 'Launcher System',
            svg: 'tune',
        },
        info: {
            text: 'Launcher Information',
            svg: 'info',
        },
        users: {
            text: 'Users',
            svg: 'group',
        },
    };

    // switch the display content according to the query param
    const queryParamsHandler = (value: string) => {
        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        tabParam.set(currentURL.searchParams.get('tab')!);
    };
</script>

<ul class="console_menu_list">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    {#each Object.entries(menu_list_item) as [type, { text, svg }]}
        <li class="console_menu_list_item" class:active={type === $tabParam} on:click={() => queryParamsHandler(type)}>
            <p class="console_menu_list_link">
                <span class="material-symbols-outlined">{svg}</span>
                <span class="console_menu_list_text">{text}</span>
            </p>
        </li>
    {/each}
</ul>
