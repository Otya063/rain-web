<script lang="ts">
    import TestTop from "$lib/articles/TestTop.svelte";
    import LL from "$i18n/i18n-svelte";
    import { locale } from "$i18n/i18n-svelte"
</script>

<p>{$LL.HI()}</p>
<p>now lang : {$locale}</p>
<TestTop />
