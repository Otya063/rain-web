<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
    import { scrollToElm } from '$utils/client';

    const articleData = $LL.manual['article'].register['discord'];
    const { 1: discord } = articleData.section;
</script>

<h1>{articleData.title()}</h1>

<div class="outline_contents" data-title={$LL.manual['dataTitle']()}>
    <ul>
        {#each Object.entries(articleData.outlineContents) as [data_target, text]}
            <li>
                <button onclick={(e) => scrollToElm(e)} data-target={data_target}>{text()}</button>
            </li>
        {/each}
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">{@html articleData.articleMemo()}</p>
</div>

<section id="discord">
    <h2>{discord.subtitle()}</h2>

    <ul>
        {#each Object.entries(discord.centerBox) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>

                {#each Object.values(img) as src}
                    <p class="center_box_img"><img src="/img/{$locale}/articles/register/discord/{src()}.png" alt={src()} /></p>
                {/each}
            </li>
        {/each}
    </ul>
</section>
