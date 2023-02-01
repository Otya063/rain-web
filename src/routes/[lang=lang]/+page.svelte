<script lang="ts">
    import TestTop from "$lib/articles/TestTop.svelte";
    import LL from "$i18n/i18n-svelte";
    import { locale } from "$i18n/i18n-svelte";
</script>

<svelte:head>
    <title>{$LL.articles["home"].head_title()}</title>
    <meta name="description" content={$LL.articles["home"].description()} />
    <meta name="keywords" content={$LL.articles["home"].keywords()} />
</svelte:head>

<p>{$LL.test()}</p>
<p>now lang : {$locale}</p>
<TestTop />
