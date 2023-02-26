<script lang="ts">
    const toggleNav = () => {
        const html = document.documentElement as HTMLElement;
        const bottom_menu = document.querySelector('.side_menu') as HTMLElement;
        const btn = document.querySelector('.openbtn');
        html.classList.toggle('fixed');
        bottom_menu.classList.toggle('open');
        btn?.classList.toggle('selected');
    };
</script>

<ul>
    <!-- アイコン1つ目-->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class="openbtn" on:click={toggleNav}>
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
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 4h6v6h-6z" />
            <path d="M14 4h6v6h-6z" />
            <path d="M4 14h6v6h-6z" />
            <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        </svg>
        メニュー
    </li>

    <!-- アイコン2つ目-->
    <li class="openbtn" on:click={toggleNav}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon icon-tabler icon-tabler-world"
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
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M3.6 9l16.8 0" />
            <path d="M3.6 15l16.8 0" />
            <path d="M11.5 3a17 17 0 0 0 0 18" />
            <path d="M12.5 3a17 17 0 0 1 0 18" />
        </svg>
        言語選択
    </li>
</ul>
