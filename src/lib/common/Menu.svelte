<script lang="ts">
    import LL, { locale } from "$i18n/i18n-svelte";
    import { toggleMenuSel, loadArticle } from "$ts/main";
</script>

<ul class="categories">
    {#each Object.entries($LL.side_menu) as [maindir, { title, contents }]}
        <li class="category">
            <button on:click={toggleMenuSel} class="category_title" type="button">
                <span class="mark" />
                {title()}
            </button>
            <ul class="sub_categories">
                <li class="sub_categories_list">
                    {#each Object.entries(contents) as [subdir, content]}
                        <button class="sub_category" on:click={() => loadArticle(`${$locale}/`, `${maindir}/`, `${subdir}/`)}>
                            {content()}
                        </button>
                    {/each}
                </li>
            </ul>
        </li>
    {/each}
</ul>
