<script lang="ts">
    import { onMount } from 'svelte';
    import { adminTabValue } from '$lib/utils';

    interface Props {
        closeMenu: () => void;
    }
    let { closeMenu }: Props = $props();
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
        distribution: {
            text: 'Manage Distributions',
            icon: 'package_2',
        },
    }; // メニューリスト

    // 初回ロード時に最初のリスト項目にactiveクラスを追加
    onMount(() => {
        const firstListItem = document.getElementsByClassName('console_menu_list_item')[0] as HTMLLIElement;
        firstListItem.classList.add('active');
    });
</script>

<div class="console_menu_list">
    {#each Object.entries(menuList) as [type, { text, icon }]}
        <button
            class="console_menu_list_item"
            class:active={type === $adminTabValue}
            onclick={() => {
                adminTabValue.set(type);
                closeMenu();
            }}
        >
            <p class="console_menu_list_link">
                <span class="material-symbols-outlined">{icon}</span>
                <span class="console_menu_list_text">{text}</span>
            </p>
        </button>
    {/each}
</div>
