<script lang="ts">
    import { page } from '$app/stores';
    import { tabParam } from '$ts/main';

    const queryParamsHandler = (value: string) => {
        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        tabParam.set(currentURL.searchParams.get('tab')!);
    };
</script>

<ul class="console_menu_list">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class="console_menu_list_item" on:click={() => queryParamsHandler('system')}>
        <p class="console_menu_list_link">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-adjustments-alt"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8h4v4h-4z" />
                <path d="M6 4l0 4" />
                <path d="M6 12l0 8" />
                <path d="M10 14h4v4h-4z" />
                <path d="M12 4l0 10" />
                <path d="M12 18l0 2" />
                <path d="M16 5h4v4h-4z" />
                <path d="M18 4l0 1" />
                <path d="M18 9l0 11" />
            </svg>
            <span class="console_menu_list_text">Launcher System</span>
        </p>
    </li>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class="console_menu_list_item" on:click={() => queryParamsHandler('info')}>
        <p class="console_menu_list_link">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-file-info"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M11 14h1v4h1" />
                <path d="M12 11h.01" />
            </svg>
            <span class="console_menu_list_text">Launcher Information</span>
        </p>
    </li>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class="console_menu_list_item" on:click={() => queryParamsHandler('users')}>
        <p class="console_menu_list_link">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-users"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
            </svg>
            <span class="console_menu_list_text">Users</span>
        </p>
    </li>
</ul>
