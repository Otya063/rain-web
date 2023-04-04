<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Original from '$lib/articles/contents/parts/Original.svelte';
    import HGE from '$lib/articles/contents/parts/HGE.svelte';
    import LL, { locale } from '$i18n/i18n-svelte';

    const articleData = $LL.articles['begin'].start;
    const { 1: spec, 2: install, 3: launcher } = articleData.section;

    let activedElement: HTMLElement;
    let nowTarget: HTMLElement;
    let isDefault = true;
    const tabInfoHandler = (key: string, value: string, e: MouseEvent) => {
        // tab handling
        const currentURL = $page.url;
        currentURL.searchParams.set(key, value);
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
                <a class="scroll" data-target={data_target}>{text()}</a>
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
                <li class="check_contents_list_text">・{text()}</li>
            {/each}
        </ul>
    </div>

    <div class="table_tabs">
        {#each Object.entries(spec.table_data['tab_name']) as [arg, text]}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <p class="table_tabs_item pointer no_select" on:click={(e) => tabInfoHandler('tab', arg, e)}>{text()}</p>
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

    <ul>
        <li class="section_inrto_box">
            <p class="intro_box_text">{launcher.intro_box['text']()}</p>
            <p class="intro_box_img"><img src="/img/{$locale}/articles/begin/start/{launcher.intro_box['img']()}.png" alt={launcher.intro_box['img']()} /></p>
        </li>
    </ul>

    <h3>{launcher.h3_title()}</h3>
    <div class="center_box_no_number">
        <p style="font-weight: 500;" class="center_box_no_number_text">{launcher.h3_text()}</p>
    </div>

    <ul>
        {#each Object.values(launcher.center_box) as { text, img, img_desc }}
            <li class="center_box_no_number">
                <p class="center_box_no_number_text">{text()}</p>
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
</section>

<section id="start">
    <h2>ログイン・ゲーム開始</h2>

    <div class="check_contents_with_link">
        <ul class="check_contents_with_link_list">
            <li class="check_contents_with_link_list_item">
                <p class="check_contents_list_text">マルチコアプロセッサーを搭載したパソコンでは、1台のパソコンでゲームプログラムを2つ起動してプレイすることができます。</p>
                <!-- svelte-ignore a11y-missing-attribute -->
                ＞＞<a class="check_contents_list_link">ゲームの多重起動</a>
            </li>
        </ul>
    </div>

    <ul>
        <li class="center_box">
            <p class="center_box_text">（1）デスクトップ上にある「モンスターハンター フロンティア オンライン」のアイコンをクリックします。</p>
        </li>
        <li class="center_box">
            <p class="center_box_text">
                （2）ランチャー画面が起動します。<br />
                赤枠内にユーザー名とパスワードを入力し、「ログイン」ボタンをクリックするとログインが行なわれ、アップデートが開始されます。
            </p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/start_2.png" alt="start_2" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">
                （3）キャラクターを選択し、「ゲームスタート」を押すとMHFが起動します。<br />初期状態では下図のように「<span style="color: blue;">狩人申請可能</span>」のみが表示されます。
            </p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/start_3.png" alt="start_3" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（4）ゲームのタイトル画面では、Enterキーを押す、もしくは画面をクリックすると、タイトルメニューが表示されます。</p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/start_4.png" alt="start_4" />
            </p>
        </li>
    </ul>
</section>

<section id="hge_setting">
    <h2>High Grade Editionの設定方法</h2>

    <ul>
        <li class="center_box">
            <p class="center_box_text">（1）ランチャー画面で「環境設定」をクリックします。</p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/hge_1.png" alt="hge_1" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">
                （2）設定画面が表示されます。<br />設定タブ内の「High Grade Editionを有効にする」にチェックを入れ、OKをクリックします。
            </p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/hge_2.png" alt="hge_2" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（3）ログイン後、タイトル画面で「High Grade Edition」と表示されているとHigh Grade Editionでプレイ可能となります。</p>
            <p class="center_box_img">
                <img src="/img/{$locale}/articles/begin/start/hge_3.png" alt="hge_3" />
            </p>
        </li>
    </ul>

    <h3 class="head_dia">オプション調整</h3>
    <div class="half_box">
        <p class="half_box_text">メニューを開き、［オプション］＞［表示（グラフィック）］でグラフィックの調整が可能です。ご自身のパソコン環境に合わせて調整してみましょう。</p>
        <p class="half_box_img">
            <img src="/img/{$locale}/articles/begin/start/hge_4.png" alt="hge_4" />
        </p>
    </div>

    <div class="center_box_no_number">
        <p class="center_box_no_number_text">表示（グラフィック）</p>
        <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/hge_5.png" alt="hge_5" /></p>
        <ul class="img_desc_section">
            <li class="img_desc_section_item">
                ①プリセット
                <ul class="img_desc_section_text">
                    <li>最高画質：全ての項目をONにした、最高設定にします。<span class="img_desc_section_text_part" /></li>
                    <li>グラフィック優先：グラフィックを優先した、高画質設定にします。<span class="img_desc_section_text_part" /></li>
                    <li>パフォーマンス優先：操作性を優先した、不可処理の少ない設定にします。<span class="img_desc_section_text_part" /></li>
                    <li>カスタム：各種項目を自由に設定することができます。<span class="img_desc_section_text_part" /></li>
                </ul>
            </li>
            <li class="img_desc_section_item">
                ②各種項目
                <ul class="img_desc_section_text">
                    <li>リアルシャドウ（ロビー）：ロビーでのハンター、NPCの影処理の実影表現のON/OFFを設定します。<span class="img_desc_section_text_part" /></li>
                    <li>リアルシャドウ（クエスト）：クエストでのハンター、モンスター等に対する実影処理のON/OFFを設定します。<span class="img_desc_section_text_part" /></li>
                    <li>
                        被写界深度：カメラ等のレンズを通して対象物を撮影した際、ピントが合っている領域の前後にある範囲で、どれほどボケるかを表す指標の事です。ONでは、対象物にフォーカスが合った時に、その前後の範囲がボケるように描写され、より自然な距離感を感じることができます。OFFでは、対象物とその周囲の距離感があまり表現されず、映像がはっきりと表示されますが、現実世界で普段目にする風景とは異質に映り、多少の違和感を覚えるかもしれません。<span
                            class="img_desc_section_text_part"
                        />
                    </li>
                    <li>
                        ブルーム：光源から光が周囲に広がっていくエフェクトの事です。ONでは、よりリアルな光の表現が可能となります。OFFでは、ブルーム効果は表現されず、ややリアリティに欠けると感じるかもしれません。<span
                            class="img_desc_section_text_part"
                        />
                    </li>
                    <li>
                        SSAO：立体物の隙間や曲がり角等、実際に光が入り込みにくい場所にも陰影が生まれ、よりリアルな3D表現を実現できますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFにされることをお勧めいたします。ONでは、よりリアルな陰影が表現され、立体感のあるグラフィックスを楽しむことができます。OFFでは、陰影の表現は行われず、画面がよりシンプルな印象を受けます。<span
                            class="img_desc_section_text_part"
                        />
                    </li>
                    <li>
                        ゴッドレイ：光の差し込み、木漏れ日等、光が散乱して空気中に照り返す現象を可能にしますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFにされることをお勧めいたします。<span
                            class="img_desc_section_text_part"
                        />
                    </li>
                    <li>
                        アンチエイリアス：オブジェクトの輪郭線を滑らかにして、より自然な見た目を実現しますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFにされることをお勧めいたします。
                    </li>
                    <li>
                        ソフトパーティクル：オブジェクトの輪郭線を滑らかにして、より自然な見た目を実現しますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFにされることをお勧めいたします。<span
                            class="img_desc_section_text_part"
                        />
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</section>
