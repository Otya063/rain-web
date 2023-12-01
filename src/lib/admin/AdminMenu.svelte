<script lang="ts">
    import { page } from '$app/stores';
    import { tab_param, editMode, err_details, notice } from '$ts/main';
    import { onMount } from 'svelte';

    // added "active" class to the first list item when first loaded
    onMount(() => {
        const first_list_item = document.getElementsByClassName('console_menu_list_item')[0] as HTMLLIElement;
        first_list_item.classList.add('active');
    });

    interface ItemStuff {
        [key: string]: string;
    }
    // menu list items for looping
    const menu_list_item: Record<string, ItemStuff> = {
        system: {
            text: 'Launcher System',
            icon: 'tune',
        },
        info: {
            text: 'Launcher Information',
            icon: 'info',
        },
        users: {
            text: 'Users',
            icon: 'group',
        },
        bnr: {
            text: 'Launcher Banner',
            icon: 'ad_group',
        },
    };

    // switch the display content according to the query param
    const queryParamsHandler = (value: string) => {
        // check if editing is in progress
        if ($editMode) {
            notice.set(true);
            err_details.set('Edit mode still remains active. Page transitions can only be made after all editing has been completed.');
            return false;
        }

        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        tab_param.set(currentURL.searchParams.get('tab')!);
    };
</script>

<ul class="console_menu_list">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    {#each Object.entries(menu_list_item) as [type, { text, icon }]}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li class="console_menu_list_item" class:active={type === $tab_param} on:click={() => queryParamsHandler(type)}>
            <p class="console_menu_list_link">
                <span class="material-symbols-outlined">{icon}</span>
                <span class="console_menu_list_text">{text}</span>
            </p>
        </li>
    {/each}
</ul>
