<script lang="ts">
    import { loadArticle } from '$ts/main';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { onMount } from 'svelte';

    // allow users to change language while displaying articles
    let maindir: string = '';
    let subdir: string = '';
    onMount(() => {
        const pathname: string = location.pathname;
        let path1: string;
        let path2: string;

        // when the path is [lang]/manual/
        const arr: string[] = ([, , path1 = '', path2 = ''] = pathname.split('/').filter(Boolean));

        // when the path is [lang]/manual/[maincat]/[subcat]
        if (arr.length > 2) {
            maindir = path1.concat('/');
            subdir = path2.concat('/');
        }
    });
</script>

<dl class="language_selectArea_list">
    {#each Object.entries($LL.header['lang_sel']) as [lang_code, { main_name, sub_name }]}
        <button on:click={() => loadArticle(lang_code, 'manual/', maindir, subdir)} class="language_names" class:lang_selected={lang_code === $locale}>
            <span class="language_mainName">
                {main_name()}
            </span>
            <span class="language_subName">
                {sub_name()}
            </span>
        </button>
    {/each}
</dl>
