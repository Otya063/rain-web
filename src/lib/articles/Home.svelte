<script lang="ts">
    import { locale } from "$i18n/i18n-svelte";
    import { loadArticle } from "$ts/main";
    import LL from "$i18n/i18n-svelte";
    import { articles } from "./article_data";
</script>

<p>
    now_lang is "{$locale}"
</p>

<h1>{$LL.articles["home"].title()}</h1>

<section class="news">
    <h2 class="news_title">{$LL.articles["home"].news_title()}</h2>
    <div class="news_content">
        <ul class="content_list">
            <li class="news_date">
                <span>{$LL.articles["home"].news_date()}</span>
                <span>{$LL.articles["home"].news_ver()}</span>
            </li>
            <li class="news_text">
                {@html $LL.articles["home"].news_text()}
            </li>
        </ul>
        <button class="news_more" on:click={() => loadArticle($locale)}>{$LL.articles["home"].news_more()}</button>
    </div>
</section>

<section class="featured">
    <h2>{$LL.articles["home"].featured_title()}</h2>
    <ul class="featured_list">
        {#each Object.entries($LL.articles["home"].featured_contents) as [item, { maindir, subdir, alt, text }]}
            <li>
                <button on:click={() => loadArticle($locale, maindir(), subdir())}>
                    <dl class="featured_items">
                        <dt class="featured_img {item}">
                            <img src="/img/{$locale}/featured/featured_{item}_chara.webp" alt={alt()} />
                        </dt>
                        <dd class="featured_text">{@html text()}</dd>
                    </dl>
                </button>
            </li>
        {/each}
    </ul>
</section>

<section class="extlink">
    <h2>{$LL.articles["home"].extlink_title()}</h2>
</section>
