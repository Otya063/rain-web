<script lang="ts">
    import { page } from '$app/stores';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle, scrollToElm } from '$lib/utils';
    import HGE from './parts/HGE.svelte';
    import Original from './parts/Original.svelte';

    let activeTabValue = $state('original');
    const articleData = $LL.manual['article'].begin['start'];
    const { 1: spec, 2: install, 3: launcher, 4: start, 5: option } = articleData.section;
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

<section id="spec">
    <h2>{spec.subtitle()}</h2>

    <div class="check_contents">
        <ul class="check_contents_list">
            {#each Object.values(spec.checkContents) as text}
                <li class="check_contents_list_text">{text()}</li>
            {/each}
        </ul>
    </div>

    <div class="table_tabs">
        {#each Object.entries(spec.tableData['tabName']) as [arg, text]}
            <button class="table_tabs_item pointer no_select" class:active={activeTabValue === arg} onclick={() => (activeTabValue = arg)}>
                {text()}
            </button>
        {/each}
    </div>

    {#if activeTabValue === 'original'}
        <table class="table_contents">
            <Original />
        </table>
    {:else}
        <table class="table_contents">
            <HGE />
        </table>
    {/if}
    <div class="spec_notes">
        {#each Object.values(spec.specNotes) as text}
            <p>■{text()}</p>
        {/each}
    </div>
</section>

<section id="install">
    <h2>{install.subtitle()}</h2>

    <ul>
        {#each Object.entries(install.centerBox) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">
                    （{number}）{@html text()}
                </p>
                <p class="center_box_img">
                    <img src="/img/{$locale}/articles/begin/start/{img()}.png" alt={img()} />
                </p>
            </li>
        {/each}
    </ul>
</section>

<section id="launcher">
    <h2>{launcher.subtitle()}</h2>

    <div class="section_inrto_box">
        <p class="intro_box_text">{launcher.introBox['text']()}</p>
        <p class="intro_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.introBox['img']()}.png" alt={launcher.introBox['img']()} /></p>
    </div>

    <!-- ランチャーメインセクション -->
    <h3>{launcher.h3[1].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{@html launcher.h3[1].text()}</p>
        <p style="width: 250%;" class="half_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.h3[1].img()}.png" alt={launcher.h3[1].img()} /></p>
    </div>

    <ul>
        <li class="center_box_no_number">
            <p style="font-weight: 700;" class="center_box_no_number_text">{launcher.h3[1].centerBox['text1']()}</p>
            <p class="center_box_no_number_img"><img src="/img/common/{launcher.h3[1].centerBox['img']()}.webp" alt={launcher.h3[1].centerBox['img']()} /></p>
            <p style="padding-top: 1%;" class="center_box_no_number_text">{launcher.h3[1].centerBox['text2']()}</p>
        </li>
    </ul>

    <!-- 環境設定 -->
    <h3>{launcher.h3[2].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{launcher.h3[2].text()}</p>
        <p style="width: 250%;" class="half_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.h3[2].img()}.png" alt={launcher.h3[2].img()} /></p>
    </div>

    <ul>
        {#each Object.values(launcher.h3[2].centerBox) as { text, img, imgDesc }}
            <li class="center_box_no_number">
                <p style="font-weight: 700; font-size: 1.6rem;" class="center_box_no_number_text">{text()}</p>
                <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/{img()}.png" alt={img()} /></p>
                <ul class="img_desc_section">
                    {#each Object.values(imgDesc) as { itemTitle, itemText }}
                        <li class="img_desc_section_item">
                            {itemTitle()}
                            <p class="img_desc_section_text">{@html itemText()}</p>
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>

    <!-- ランチャーサイドコンテンツ -->
    <h3>{launcher.h3[3].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{launcher.h3[3].text()}</p>
        <p style="width: 250%;" class="half_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.h3[3].img()}.png" alt={launcher.h3[3].img()} /></p>
    </div>
</section>

<section id="start">
    <h2>{start.subtitle()}</h2>

    <div class="check_contents_with_link">
        <ul class="check_contents_with_link_list">
            <li class="check_contents_with_link_list_item">
                <p class="check_contents_list_text">{start.checkContents['text']()}</p>
                <div class="check_contents_list_arrow_group">
                    <span class="check_contents_list_arrow">＞</span>
                    <span class="check_contents_list_arrow">＞</span>
                </div>
                
                <button onclick={(e) => loadArticle(e, $page.url, $locale, 'manual/begin/multiple/')} class="check_contents_list_link">{start.checkContents['link']()}</button>
            </li>
        </ul>
    </div>

    <ul>
        <li class="half_box">
            <p style="text-indent: -2.5em;" class="half_box_text half_box_text_adj">{start.halfBox['text']()}</p>
            <p style="max-width: 120px;" class="half_box_img">
                <img src="/img/{$locale}/articles/begin/start/{start.halfBox['img']()}.png" alt={start.halfBox['img']()} />
            </p>
        </li>

        {#each Object.entries(start.centerBox) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>
                <p class="center_box_img">
                    <img src="/img/{$locale}/articles/begin/start/{img()}.png" alt={img()} />
                </p>
            </li>
        {/each}
    </ul>
</section>

<section id="option">
    <h2>{option.subtitle()}</h2>

    <h3 style="margin-top: 15%;">{option[1].title()}</h3>
    <ul>
        {#each Object.entries(option[1].centerBox) as [number, { text, img }]}
            <li class="center_box">
                <p class="center_box_text">（{number}）{@html text()}</p>
                <p class="center_box_img">
                    <img src="/img/{$locale}/articles/begin/start/{img()}.png" alt={img()} />
                </p>
            </li>
        {/each}
    </ul>

    <h3>{option[2].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{option[2].halfBox['text']()}</p>
        <p class="half_box_img">
            <img src="/img/{$locale}/articles/begin/start/{option[2].halfBox['img']()}.png" alt={option[2].halfBox['img']()} />
        </p>
    </div>

    <div class="center_box_no_number">
        <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/{option[2].centerBox['img']()}.png" alt={option[2].centerBox['img']()} /></p>
        <ul class="img_desc_section">
            {#each Object.values(option[2].centerBox['imgDesc']) as { itemTitle, itemText }}
                <li class="img_desc_section_item">
                    {itemTitle()}
                    <ul class="img_desc_section_text">
                        {#each Object.values(itemText) as { head, content }}
                            <li class="img_desc_section_text_list">
                                <span class="img_desc_section_text_list_title">{head()}</span>
                                <span>{@html content()}</span>
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    </div>
</section>
