<script lang="ts">
    import type { SideMenuProps } from '$types';
    import { adminTabValue } from '$utils/client';

    let { closeMobileMenu }: SideMenuProps = $props();
    const menuList: Record<string, { [key: string]: string }> = {
        system: {
            text: 'Launcher System',
            icon: 'tune',
        },
        // information: {
        //     text: 'Information',
        //     icon: 'info',
        // },
        user: {
            text: 'User',
            icon: 'person',
        },
        banner: {
            text: 'Banner',
            icon: 'ad_group',
        },
        clan: {
            text: 'Clan & Alliance',
            icon: 'groups',
        },
        distribution: {
            text: 'Distribution',
            icon: 'package_2',
        },
    }; // メニューリスト
</script>

<div class="console_menu_list">
    {#each Object.entries(menuList) as [type, { text, icon }]}
        <button
            class="console_menu_list_item"
            class:active={type === $adminTabValue}
            onclick={() => {
                adminTabValue.set(type);
                closeMobileMenu(true);
            }}
        >
            <p class="console_menu_list_link">
                <span class="material-symbols-outlined">{icon}</span>
                <span class="console_menu_list_text">{text}</span>
            </p>
        </button>
    {/each}
</div>
