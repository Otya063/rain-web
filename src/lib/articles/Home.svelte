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
        <button class="news_more" on:click={() => loadArticle($locale)}>{$LL.articles["home"].news_more()}</button>
    </div>
</section>

<section class="featured">
    <h2>{$LL.articles["home"].featured_title()}</h2>
    <ul class="featured_list">
        <li>
            <button on:click={() => loadArticle($locale, "entry/", "acccreate/")}>
                <dl class="featured_items">
                    <dt class="featured_img first">
                        <img src="/img/{$locale}/featured/featured_first_chara.webp" alt="初めに" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_first()}</dd>
                </dl>
            </button>
        </li>
        <li>
            <button on:click={() => loadArticle($locale)}>
                <dl class="featured_items">
                    <dt class="featured_img utahime">
                        <img src="/img/{$locale}/featured/featured_utahime_chara.webp" alt="歌姫狩衛戦・真説" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_utahime()}</dd>
                </dl>
            </button>
        </li>
        <li>
            <button on:click={() => loadArticle($locale)}>
                <dl class="featured_items">
                    <dt class="featured_img lavi">
                        <img src="/img/{$locale}/featured/featured_lavi_chara.webp" alt="ラヴィエンテ" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_lavi()}</dd>
                </dl>
            </button>
        </li>
        <li>
            <button on:click={() => loadArticle($locale)}>
                <dl class="featured_items">
                    <dt class="featured_img tenrou">
                        <img src="/img/{$locale}/featured/featured_tenrou_chara.webp" alt="天廊遠征録" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_tenrou()}</dd>
                </dl>
            </button>
        </li>
        <li>
            <button on:click={() => loadArticle($locale)}>
                <dl class="featured_items">
                    <dt class="featured_img road">
                        <img src="/img/{$locale}/featured/featured_road_chara.webp" alt="狩煉道" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_road()}</dd>
                </dl>
            </button>
        </li>
        <li>
            <button on:click={() => loadArticle($locale)}>
                <dl class="featured_items">
                    <dt class="featured_img return">
                        <img src="/img/{$locale}/featured/featured_return_chara.webp" alt="復帰区" />
                    </dt>
                    <dd class="featured_text">{@html $LL.articles["home"].featured_return()}</dd>
                </dl>
            </button>
        </li>
    </ul>
</section>
