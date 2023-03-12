<script lang="ts">
    import ErrorFooter from '$lib/common/ErrorFooter.svelte';
    import LL from '$i18n/i18n-svelte';
    import '$scss/style_error.scss';
</script>

<svelte:head>
    <title>{$LL.E404['title']()}</title>
    <meta name="robots" content="noindex,nofollow" />
    <meta name="description" content={$LL.articles['description']()} />
    <meta name="keywords" content={$LL.articles['keywords']()} />
</svelte:head>

<div class="error_wrapper">
    <main class="main_inner_error">
        <p class="ouch_cat">
            <img src="/img/common/ouch_cat.webp" alt="" />
        </p>
        <h1 class="error_h1">{$LL.E404['h1']()}</h1>
        <div class="inner_text">
            <p>{$LL.E404['inner_text1']()}</p>
            <ul class="error_cause">
                {#each Object.entries($LL.E404['error_cause']) as [number, cause]}
                    <li>{cause()}</li>
                {/each}
            </ul>
            <p>{$LL.E404['inner_text2']()}</p>
        </div>
        <button class="btn" on:click={() => (location.href = '/')}>{$LL.E404['btn_name']()}</button>
    </main>
</div>

<footer>
    <ErrorFooter />
</footer>
