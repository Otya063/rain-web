<script lang="ts">
    import LL, { locale } from '$i18n/i18n-svelte';
</script>

<h1>{$LL.articles['signup'].discord['title']()}</h1>

<div class="outline_contents" data-title={$LL.articles['data_title']()}>
    <ul>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="signup_discord">{$LL.articles['signup'].discord['table_contents']()}</a>
        </li>
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">{@html $LL.articles['signup'].discord['article_memo']()}</p>
</div>

<section id="signup_discord">
    <h2>{$LL.articles['signup'].discord['subtitle']()}</h2>

    <ul>
        {#each Object.entries($LL.articles['signup'].discord['center_box']) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>
                {#each Object.values(img) as src}
                    <p class="center_box_img"><img src="/img/{$locale}/articles/signup/discord/{src()}.png" alt={src()} /></p>
                {/each}
            </li>
        {/each}
    </ul>
</section>
