<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
    import { scrollToElm } from '$ts/main';

    const articleData = $LL.articles['signup'].discord;
    const { 1: discord } = articleData.section;
</script>

<h1>{articleData.title()}</h1>

<div class="outline_contents" data-title={$LL.articles['data_title']()}>
    <ul>
        {#each Object.entries(articleData.outline_contents) as [data_target, text]}
            <li>
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <a on:click={(e) => scrollToElm(e)} data-target={data_target}>{text()}</a>
            </li>
        {/each}
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">{@html articleData.article_memo()}</p>
</div>

<section id="discord">
    <h2>{discord.subtitle()}</h2>

    <ul>
        {#each Object.entries(discord.center_box) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>
                {#each Object.values(img) as src}
                    <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/{src()}.png" alt={src()} /></p>
                {/each}
            </li>
        {/each}
    </ul>
</section>
