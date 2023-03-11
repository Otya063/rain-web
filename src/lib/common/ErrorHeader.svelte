<script lang="ts">
    import { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$ts/main';
</script>

<div class="header_inner">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="header_platform" />
    <p class="header_logo">
        <button class="header_logo_button" on:click={() => loadArticle($locale)} />
    </p>
</div>
