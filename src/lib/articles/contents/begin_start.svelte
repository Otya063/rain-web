<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Original from '$lib/articles/contents/parts/Original.svelte';
    import HGE from '$lib/articles/contents/parts/HGE.svelte';
    import LL, { locale } from '$i18n/i18n-svelte';
    import { loadArticle, scrollToElm } from '$ts/main';

    const articleData = $LL.articles['begin'].start;
    const { 1: spec, 2: install, 3: launcher, 4: start, 5: option } = articleData.section;

    let activedElement: HTMLElement;
    let nowTarget: HTMLElement;
    let isDefault: boolean = true;
    const tabInfoHandler = (value: string, e: MouseEvent) => {
        // tab handling
        const currentURL = $page.url;
        currentURL.searchParams.set('tab', value);
        window.history.pushState({ path: currentURL.href }, '', currentURL.href);
        const param = currentURL.searchParams.get('tab');
        isDefault = param === 'original';

        // class handling
        nowTarget = e.target as HTMLElement;
        activedElement && activedElement.classList.remove('active');
        nowTarget.classList.add('active');
        activedElement = nowTarget;
    };

    // default class set
    onMount(() => {
        const defaultActive = document.querySelectorAll('.table_tabs_item')[0] as HTMLParagraphElement;
        defaultActive.classList.add('active');
        activedElement = defaultActive;
    });
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

<section id="spec">
    <h2>{spec.subtitle()}</h2>

    <div class="check_contents">
        <ul class="check_contents_list">
            {#each Object.values(spec.check_contents) as text}
                <li class="check_contents_list_text">{text()}</li>
            {/each}
        </ul>
    </div>

    <div class="table_tabs">
        {#each Object.entries(spec.table_data['tab_name']) as [arg, text]}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p class="table_tabs_item pointer no_select" on:click={(e) => tabInfoHandler(arg, e)}>{text()}</p>
        {/each}
    </div>

    {#if isDefault}
        <table class="table_contents">
            <Original />
        </table>
    {:else}
        <table class="table_contents">
            <HGE />
        </table>
    {/if}
    <div class="spec_notes">
        {#each Object.values(spec.spec_notes) as text}
            <p>■{text()}</p>
        {/each}
    </div>
</section>

<section id="install">
    <h2>{install.subtitle()}</h2>

    <ul>
        {#each Object.entries(install.center_box) as [number, { text, img }]}
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
        <p class="intro_box_text">{launcher.intro_box['text']()}</p>
        <p class="intro_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.intro_box['img']()}.png" alt={launcher.intro_box['img']()} /></p>
    </div>

    <!-- login area -->
    <h3>{launcher.h3[1].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{@html launcher.h3[1].text()}</p>
        <p style="width: 250%;" class="half_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.h3[1].img()}.png" alt={launcher.h3[1].img()} /></p>
    </div>

    <ul>
        <li class="center_box_no_number">
            <p style="font-weight: 700;" class="center_box_no_number_text">{launcher.h3[1].center_box['text1']()}</p>
            <p class="center_box_no_number_img"><img src="/img/common/{launcher.h3[1].center_box['img']()}.webp" alt={launcher.h3[1].center_box['img']()} /></p>
            <p style="padding-top: 1%;" class="center_box_no_number_text">{launcher.h3[1].center_box['text2']()}</p>
        </li>
    </ul>

    <!-- preferences -->
    <h3>{launcher.h3[2].title()}</h3>
    <div class="half_box">
        <p class="half_box_text">{launcher.h3[2].text()}</p>
        <p style="width: 250%;" class="half_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.h3[2].img()}.png" alt={launcher.h3[2].img()} /></p>
    </div>

    <ul>
        {#each Object.values(launcher.h3[2].center_box) as { text, img, img_desc }}
            <li class="center_box_no_number">
                <p style="font-weight: 700; font-size: 1.6rem;" class="center_box_no_number_text">{text()}</p>
                <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/{img()}.png" alt={img()} /></p>
                <ul class="img_desc_section">
                    {#each Object.values(img_desc) as { item_title, item_text }}
                        <li class="img_desc_section_item">
                            {item_title()}
                            <p class="img_desc_section_text">{@html item_text()}</p>
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>

    <!-- side_contents -->
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
                <p class="check_contents_list_text">{start.check_contents['text']()}</p>
                <div class="check_contents_list_arrow_group">
                    <span class="check_contents_list_arrow">＞</span>
                    <span class="check_contents_list_arrow">＞</span>
                </div>
                <!-- svelte-ignore a11y-missing-attribute -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <a on:click={() => loadArticle($locale, 'manual/', 'begin/', 'multiple/')} class="check_contents_list_link">{start.check_contents['link']()}</a>
            </li>
        </ul>
    </div>

    <ul>
        <li class="half_box">
            <p style="text-indent: -2.5em;" class="half_box_text half_box_text_adj">{start.half_box['text']()}</p>
            <p style="max-width: 120px;" class="half_box_img">
                <img src="/img/{$locale}/articles/begin/start/{start.half_box['img']()}.png" alt={start.half_box['img']()} />
            </p>
        </li>

        {#each Object.entries(start.center_box) as [number, { text, img }]}
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
        {#each Object.entries(option[1].center_box) as [number, { text, img }]}
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
        <p class="half_box_text">{option[2].half_box['text']()}</p>
        <p class="half_box_img">
            <img src="/img/{$locale}/articles/begin/start/{option[2].half_box['img']()}.png" alt={option[2].half_box['img']()} />
        </p>
    </div>

    <div class="center_box_no_number">
        <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/{option[2].center_box['img']()}.png" alt={option[2].center_box['img']()} /></p>
        <ul class="img_desc_section">
            {#each Object.values(option[2].center_box['img_desc']) as { item_title, item_text }}
                <li class="img_desc_section_item">
                    {item_title()}
                    <ul class="img_desc_section_text">
                        {#each Object.values(item_text) as { head, content }}
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
