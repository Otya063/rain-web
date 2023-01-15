<script lang="ts">
    import { cached_lang } from "../lang/i18n";
    import { jaTrans, enTrans } from "../lang/translation";

    let language: string;
    cached_lang.subscribe((e) => (language = e));
    $: translator = () => (language == "ja" ? jaTrans.article : enTrans.article);
</script>

<h1>{translator()["/"].title}</h1>

<section class="news">
    <h2 class="news_title">{translator()["/"].news_title}</h2>
    <div class="news_content">
        <ul class="content_list">
            <li class="news_date">
                <span>{translator()["/"].news_date}</span>
                <span>{translator()["/"].news_ver}</span>
            </li>
            <li class="news_text">
                {@html translator()["/"].news_text}
            </li>
        </ul>
        <a class="news_more" on:click={() => console.log("clicked")}>{translator()["/"].news_more}</a>
    </div>
</section>

<section class="featured">
    <h2>{translator()["/"].featured_title}</h2>
    <ul class="featured_list">
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img first">
                        <img src="/img/{language}/featured/featured_first_chara.webp" alt="初めに" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_first}</dd>
                </dl>
            </a>
        </li>
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img utahime">
                        <img src="/img/{language}/featured/featured_utahime_chara.webp" alt="歌姫狩衛戦・真説" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_utahime}</dd>
                </dl>
            </a>
        </li>
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img lavi">
                        <img src="/img/{language}/featured/featured_lavi_chara.webp" alt="ラヴィエンテ" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_lavi}</dd>
                </dl>
            </a>
        </li>
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img tenrou">
                        <img src="/img/{language}/featured/featured_tenrou_chara.webp" alt="天廊遠征録" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_tenrou}</dd>
                </dl>
            </a>
        </li>
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img road">
                        <img src="/img/{language}/featured/featured_road_chara.webp" alt="狩煉道" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_road}</dd>
                </dl>
            </a>
        </li>
        <li>
            <a on:click={() => console.log("clicked")}>
                <dl class="featured_items">
                    <dt class="featured_img return">
                        <img src="/img/{language}/featured/featured_return_chara.webp" alt="復帰区" />
                    </dt>
                    <dd class="featured_text">{@html translator()["/"].featured_return}</dd>
                </dl>
            </a>
        </li>
    </ul>
</section>

<section class="extlink">
    <h2>{translator()["/"].extlink_title}</h2>
    <ul class="extlink_list">
        <li class="extlink_items">
            <a href="discord://discord.com/channels/937230168223789066/1034385867764150332" class="extlink_items_link beginner_guide">
                <figure class="extlink_frame">
                    <img src="/img/common/extlink/extlink_frame.webp" alt="" />
                </figure>
                <div class="extlink_text_adj">
                    <div class="extlink_text_content">
                        <p class="extlink_text_title">{translator()["/"].extlink_beginner}</p>
                    </div>
                </div>
                <figure class="extlink_chara">
                    <img src="/img/common/extlink/extlink_beginner_chara.webp" alt="初心者ガイド" />
                </figure>
            </a>
        </li>
        <li class="extlink_items">
            <a href="discord://discord.com/channels/937230168223789066/1040529566298550292" class="extlink_items_link faq">
                <figure class="extlink_frame">
                    <img src="/img/common/extlink/extlink_frame.webp" alt="" />
                </figure>
                <div class="extlink_text_adj">
                    <div class="extlink_text_content">
                        <p class="extlink_text_title">{translator()["/"].extlink_faq}</p>
                    </div>
                </div>
                <figure class="extlink_chara">
                    <img src="/img/common/extlink/extlink_faq_chara.webp" alt="よくある質問" />
                </figure>
            </a>
        </li>
    </ul>
</section>

<aside class="notes">
    <p>
        {@html translator()["/"].notes}
    </p>
</aside>
