<script lang="ts">
    import { page } from '$app/stores';
    import { locales, baseLocale } from '$i18n/i18n-util';
    import { replaceLocaleInUrl } from '$lib/utils';
</script>

{#each locales as l}
    <link rel="alternate" hreflang={l} href={`${replaceLocaleInUrl($page.url, l, true)}`} />
{/each}
<link rel="alternate" hreflang="x-default" href={`${replaceLocaleInUrl($page.url, baseLocale, true)}`} />
