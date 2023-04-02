<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';

    const articleData = $LL.articles['signup'].discord;
    const sectionData = articleData.section;
</script>

<h1>{articleData.title()}</h1>

<div class="outline_contents" data-title={$LL.articles['data_title']()}>
    <ul>
        {#each Object.entries(articleData.outline_contents) as [data_target, text]}
            <li>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="scroll" data-target={data_target}>{text()}</a>
            </li>
        {/each}
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">{@html articleData.article_memo()}</p>
</div>

<section id="signup_discord">
    <h2>{sectionData["1"].subtitle()}</h2>

    <ul>
        {#each Object.entries(sectionData["1"].contents) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>
                {#each Object.values(img) as src}
                    <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/{src()}.png" alt={src()} /></p>
                {/each}
            </li>
        {/each}
    </ul>
</section>
