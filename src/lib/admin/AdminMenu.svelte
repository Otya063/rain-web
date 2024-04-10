<script lang="ts">
    import { adminTabValue } from '$lib/utils';
    import { onMount } from 'svelte';

    // added "active" class to the first list item when first loaded
    onMount(() => {
        const firstListItem = document.getElementsByClassName('console_menu_list_item')[0] as HTMLLIElement;
        firstListItem.classList.add('active');
    });

    // menu list items for looping
    const menuList: Record<string, { [key: string]: string }> = {
        system: {
            text: 'Launcher System',
            icon: 'tune',
        },
        info: {
            text: 'Launcher Information',
            icon: 'info',
        },
        users: {
            text: 'Manage Users',
            icon: 'person',
        },
        bnr: {
            text: 'Launcher Banner',
            icon: 'ad_group',
        },
        clan: {
            text: 'Manage Clans',
            icon: 'diversity_3',
        },
    };
</script>

<ul class="console_menu_list">
    {#each Object.entries(menuList) as [type, { text, icon }]}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li class="console_menu_list_item" class:active={type === $adminTabValue} on:click={() => adminTabValue.set(type)}>
            <p class="console_menu_list_link">
                <span class="material-symbols-outlined">{icon}</span>
                <span class="console_menu_list_text">{text}</span>
            </p>
        </li>
    {/each}
</ul>
