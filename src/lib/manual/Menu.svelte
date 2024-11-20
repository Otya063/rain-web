<script lang="ts">
    import { slide } from 'svelte/transition';
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$utils/client';

    interface Props {
        pathname: string;
    }
    let { pathname }: Props = $props();

    let catTypes: { [maindir: string]: boolean } = $state({
        register: pathname.includes('/register/'),
        begin: pathname.includes('/begin/'),
        server: pathname.includes('/server/'),
        event: pathname.includes('/event/'),
    }); // パスに応じたメニューのクラス切替
</script>

<ul class="categories">
    {#each Object.entries($LL.manual['sideMenu']) as [maindir, { title, contents }]}
        <li class="category">
            <button id={maindir} class="category_title" class:open={catTypes[maindir]} onclick={() => (catTypes[maindir] = !catTypes[maindir])}>
                <span class="mark"></span>
                {title()}
            </button>

            {#if catTypes[maindir]}
                <ul transition:slide class="sub_categories">
                    <li class="sub_categories_list">
                        {#each Object.entries(contents) as [subdir, content]}
                            <button class="sub_category" class:tab_active={pathname.includes(`/${subdir}/`)} onclick={(e) => loadArticle(e, $page.url, $locale, `manual/${maindir}/${subdir}/`)}>
                                {content()}
                            </button>
                        {/each}
                    </li>
                </ul>
            {/if}
        </li>
    {/each}
</ul>
