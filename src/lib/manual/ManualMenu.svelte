<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
    import { toggleMenuSel, loadArticle, slideOpen } from '$ts/main';
    import { onMount } from 'svelte';

    // selected menu auto decoration
    let path1: string;
    let path2: string;
    onMount(() => {
        const pathname: string = location.pathname;
        [, , path1, path2] = pathname.split('/').filter(Boolean);
        const btn = document.getElementById(path1) as HTMLButtonElement;
        const side_cat = btn.nextElementSibling as HTMLUListElement;
        slideOpen(side_cat);
    });
</script>

<ul class="categories">
    {#each Object.entries($LL.side_menu) as [maindir, { title, contents }]}
        <li class="category">
            <button id={maindir} class="category_title" class:open={path1 === maindir} on:click={toggleMenuSel}>
                <span class="mark" />
                {title()}
            </button>
            <ul class="sub_categories">
                <li class="sub_categories_list">
                    {#each Object.entries(contents) as [subdir, content]}
                        <button class="sub_category" class:tab_active={path2 === subdir} on:click={() => loadArticle($locale, 'manual/', `${maindir}/`, `${subdir}/`)}>
                            {content()}
                        </button>
                    {/each}
                </li>
            </ul>
        </li>
    {/each}
</ul>
