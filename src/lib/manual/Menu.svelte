<script lang="ts">
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$lib/utils';
    import { slide } from 'svelte/transition';

    // selected menu auto decoration
    export let pathname: string;
    let catTypes: { [maindir: string]: boolean } = {
        register: pathname.includes('/register/'),
        begin: pathname.includes('/begin/'),
        server: pathname.includes('/server/'),
        event: pathname.includes('/event/'),
    };
</script>

<ul class="categories">
    {#each Object.entries($LL.manual['sideMenu']) as [maindir, { title, contents }]}
        <li class="category">
            <button id={maindir} class="category_title" class:open={catTypes[maindir]} on:click={() => (catTypes[maindir] = !catTypes[maindir])}>
                <span class="mark" />
                {title()}
            </button>

            {#if catTypes[maindir]}
                <ul transition:slide class="sub_categories">
                    <li class="sub_categories_list">
                        {#each Object.entries(contents) as [subdir, content]}
                            <button class="sub_category" class:tab_active={pathname.includes(`/${subdir}/`)} on:click={(e) => loadArticle(e, $page.url, $locale, `manual/${maindir}/${subdir}/`)}>
                                {content()}
                            </button>
                        {/each}
                    </li>
                </ul>
            {/if}
        </li>
    {/each}
</ul>
