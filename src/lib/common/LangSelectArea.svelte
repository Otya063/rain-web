<script lang="ts">
    import { loadArticle } from "$ts/main";
    import LL, { locale } from "$i18n/i18n-svelte";
</script>

<dl class="language_selectArea_list">
    {#each Object.entries($LL.header["lang_sel"]) as [lang_code, {main_name, sub_name}]}
        <button on:click={() => loadArticle(`${lang_code}/`)} class="LANG language_names pointer" class:selected={lang_code === $locale}>
            <span class="language_mainName">{main_name()}</span>
            <span class="language_subName">{sub_name()}</span>
        </button>
    {/each}
</dl>
