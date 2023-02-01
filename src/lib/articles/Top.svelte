<script lang="ts">
    import { locale } from "$i18n/i18n-svelte";
    import { loadArticle } from "$ts/main";
    import LL from "$i18n/i18n-svelte";
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
        <button class="news_more" on:click={() => loadArticle()}>{$LL.articles["home"].news_more()}</button>
    </div>
</section>
