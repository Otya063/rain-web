<script lang="ts">
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle } from '$utils/client';
</script>

<h1>{$LL.manual['article'].home['title']()}</h1>

<section class="news">
    <h2 class="news_title">{$LL.manual['article'].home['newsTitle']()}</h2>
    <div class="news_content">
        <ul class="content_list">
            <li class="news_date">
                <span>
                    {$LL.manual['article'].home['newsDate']()}
                </span>
            </li>

            <li class="news_text">
                {@html $LL.manual['article'].home['newsText']()}
            </li>
        </ul>

        <button class="news_more">
            <span>&#9650;</span>
            {$LL.manual['article'].home['newsMore']()}
        </button>
    </div>
</section>

<section class="featured">
    <h2>{$LL.manual['article'].home['featuredTitle']()}</h2>

    <ul class="featured_list">
        {#each Object.entries($LL.manual['article'].home['featuredContents']) as [item, { maindir, subdir, alt, text }]}
            <li>
                <button onclick={(e) => loadArticle(e, $page.url, $locale, `${maindir()}${subdir()}`)}>
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
    <h2>{$LL.manual['article'].home['extlinkTitle']()}</h2>

    <ul class="extlink_list">
        {#each Object.entries($LL.manual['article'].home['extlinkContents']) as [item, { title, alt, target, rel, href, imgChara }]}
            <li class="extlink_items">
                <a href={href()} class="extlink_items_link {item}" target={target()} rel={rel()}>
                    <figure class="extlink_frame">
                        <img src="/img/common/extlink/extlink_frame.webp" alt="" />
                    </figure>

                    <div class="extlink_text_adj">
                        <div class="extlink_text_content">
                            <p class="extlink_text_title">{title()}</p>
                        </div>
                    </div>

                    <figure class="extlink_chara">
                        <img src="/img/common/extlink/{imgChara()}.webp" alt={alt()} />
                    </figure>
                </a>
            </li>
        {/each}
    </ul>
</section>
