<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import Original from '$lib/articles/contents/parts/Original.svelte';
    import HGE from '$lib/articles/contents/parts/HGE.svelte';
    import { locale } from '$i18n/i18n-svelte';

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

<h1>ゲームの始め方</h1>

<div class="outline_contents" data-title="コンテンツ">
    <ul>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="spec">動作環境</a>
        </li>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="installation ">インストール</a>
        </li>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="launcher">ランチャー画面</a>
        </li>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="start">ログイン・ゲーム開始</a>
        </li>
        <li>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="scroll" data-target="hge_setting">High Grade Editionの設定方法</a>
        </li>
    </ul>
</div>

<div class="article_memo" data-title="COMMENT">
    <p class="inner_text">
        「モンスターハンター フロンティア オンライン」には通常の画質で手軽な環境でもプレイいただけるオリジナル版と、高画質で迫力のある狩猟を体験いただけるHigh Grade Editionがあります。<br />
        ここでは、その動作環境やダウンロード・インストール方法といったゲームにおける基本事項についてご紹介いたします。
    </p>
</div>

<div class="check_contents">
    <ul class="check_contents_list">
        <li class="check_contents_list_text">・ご利用のパソコン環境に合わせ「オリジナル版」「High Grade Edition」のどちらかを選んでMHFをプレイすることが可能です 。</li>
        <li class="check_contents_list_text">・動作環境を満たしているパソコンでも、パーツ構成などにより、ゲームが正常に起動しない場合があります。予めご了承ください。</li>
    </ul>
</div>

<section id="spec">
    <h2>動作環境</h2>

    <div class="table_tabs">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p class="table_tabs_item pointer no_select" on:click={(e) => tabInfoHandler('tab', 'original', e)}>オリジナル版の動作環境</p>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p class="table_tabs_item pointer no_select" on:click={(e) => tabInfoHandler('tab', 'hge', e)}>High Grade Editionの動作環境</p>
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
        <p>■必要、推奨動作環境を満たしているパソコンであっても、パーツ構成等により、ゲームが正常に起動しない場合があります。</p>
        <p>■本ゲームは64bitネイティブ対応ではないため、64bit版Windows OS上でゲームを起動したとしても、システム性能が32bit版と比較して向上することはありません。</p>
        <p>■グラフィックカードには製造元の公式サイトで提供されている最新のドライバをご使用ください。</p>
        <p>■OSのサービスパックやグラフィックスボードのドライバについては、ご自身の責任において最新のものをご利用ください。</p>
    </div>
</section>

<section id="installation">
    <h2>インストール</h2>

    <ul>
        <li class="center_box">
            <p class="center_box_text">
                （1）メンバーサイトにある「ゲームダウンロード」ボタンをクリックし、セットアップインストーラー「mhfSetup_ZZ_v○.exe」をダウンロードします。<br
                />※「v○」にはインストーラーのバージョン（例: v1.2）が表示されます。
            </p>
            <p class="center_box_img">
                <img src="" alt="install_1" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">
                （2）インストーラーを実行し、言語を選択します。<br />インストールされるゲームタイトルおよびゲームフォルダー名はここで選択した言語に依存します。
            </p>
            <p class="center_box_img">
                <img src="" alt="install_2" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（3）インストール前に表示される重要情報を必ずご確認ください。</p>
            <p class="center_box_img">
                <img src="" alt="install_3" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（4）インストール先フォルダが表示されます。基本的にはデフォルトのままで問題ありませんが、ご自身の環境に合わせて、フォルダを任意で変更することも可能です。</p>
            <p class="center_box_img">
                <img src="" alt="install_4" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">
                （5）インストールするゲーム内言語およびゲームパッドボタンアイコンを選択します。<br />ゲームパッドを使用しない場合であっても、アイコンタイプは必ずどちらかご選択いただく必要があります。
            </p>
            <p class="center_box_img">
                <img src="" alt="install_5" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（6）「インストール」ボタンをクリックすると、インストールが開始されます。</p>
            <p class="center_box_img">
                <img src="" alt="install_6" />
            </p>
        </li>
        <li class="center_box">
            <p class="center_box_text">（7）以下画像が表示されれば、インストール完了です。</p>
            <p class="center_box_img">
                <img src="" alt="install_7" />
            </p>
        </li>
    </ul>
</section>

<section id="launcher">
    <h2>ランチャー画面</h2>

    <ul>
        <li class="section_inrto_box">
            <p class="intro_box_text">ランチャー画面とは、「MHF」起動後に表示される画面のことです。ここでは、ゲームへのログインやキャラクターの追加・削除、アップデート、環境設定等を行なえます。</p>
            <p class="intro_box_img"><img src="/img/{$locale}/articles/begin/start/launcher_0.png" alt="launcher_0" /></p>
        </li>
    </ul>

    <h3>ランチャー画面の環境設定</h3>
    <p class="h3_under_text">
        ランチャー画面の環境設定では、ゲーム画面の起動時のサイズや音声など、パソコン側の設定を行うことができます。 <br />また、High Grade Editionへの切替もここで可能です。
    </p>

    <ul>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【設定】タブ</p>
            <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/launcher_1.png" alt="launcher_1" /></p>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【表示】タブ</p>
            <p class="center_box_no_number_img"><img src="" alt="launcher_2" /></p>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【音声】タブ</p>
            <p class="center_box_no_number_img"><img src="" alt="launcher_3" /></p>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【接続】タブ</p>
            <p class="center_box_no_number_img"><img src="" alt="launcher_4" /></p>
        </li>
    </ul>
</section>

<section id="29ae62f6121aa1cfa1b080fda4cd60f0">
    <h2>ログイン・ゲーム開始</h2>

    <p class="leadtxt">インストール後、ログインすることで『モンスターハンター フロンティアＺ』をプレイできます。</p>
    <div class="subsection">
        <h4 class="head_dia">ログインの手順</h4>
        <p><strong>（１）</strong>デスクトップ上にある「モンスターハンター フロンティアＺ」のアイコンをダブルクリックします。</p>
        <p class="notice check">マルチコアプロセッサーを搭載したパソコンでは、1台のパソコンでゲームプログラムを2つ起動してプレイすることができます。</p>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="click">ゲームの多重起動</a>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_19.jpg" alt="" />
            <p><strong>（２）</strong>nProtect GameGuardが自動的に設定されます。</p>
            <p>&nbsp;</p>
            <p class="notice check">
                ※nProtect GameGuardとは、ゲームを安全に遊んでいただくためのセキュリティソフトのことです。nProtect
                GameGuardはパソコンのタスクバーに常駐され、規約違反に該当する不正行為があるかをチェックしています。不正行為が発見された場合には、ゲームが強制的に終了されます。
            </p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" height="212" src="img/page18/19.jpg" alt="" />
            <p><strong>（３）</strong>ご使用のパソコンによっては、パソコンランチャーの起動前に「ユーザー アカウント制御」の画面が表示されます。ここでは、「許可」をクリックします。</p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_20.jpg" alt="" />
            <p>
                <strong>（４）</strong>ランチャー画面が起動します。<br />
                上記の図の赤枠内にCOG IDとパスワードを入力し、［ログイン］ボタンをクリックするとログインが行なわれ、アップデートが開始されます。
            </p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <p class="clear-l">&nbsp;</p>
            <p class="center"><img width="268" src="img/page18/18_21.jpg" alt="ランチャー画面" /></p>
            <p><strong>（５）</strong>ゲームスタートを押すとゲームにログインします。</p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" height="201" src="img/page18/18_22.jpg" alt="" />
            <p><strong>（６）</strong>ゲームのタイトル画面が表示されます。［Enter］キーを押す、または画面をクリックすると、メニューが出現します。</p>
        </div>
    </div>
</section>

<section id="255854d6cf8510c6c94f8efed221e618">
    <h2>High Grade Editionの設定方法</h2>

    <p class="leadtxt">High Grade Editionへの切替方法は以下の通りです。</p>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_23.jpg" alt="" />
            <p><strong>（１）</strong>ランチャー画面で「環境設定」をクリックします。</p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_3.jpg" alt="" />
            <p><strong>（２）</strong>設定画面が表示されます。設定タブ内の「High Grade　Editionを有効にする」にチェックを入れ、OKをクリックします。</p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_20.jpg" alt="ランチャー画面" />
            <p>&nbsp;</p>
            <p><strong>（３）</strong>ランチャー画面に戻り、左図の赤枠内にCOG IDとパスワードを入力し、［ログイン］ボタンをクリックし、タイトル画面に移動します。</p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox">
            <img width="268" src="img/page18/18_24.jpg" alt="" />
            <p><strong>（４）</strong>タイトル画面で「High Grade Edition」と表示されているとHigh Grade Editionでプレイ可能となります。</p>
        </div>
    </div>
    <div class="subsection">
        <h4 class="head_dia">ゲーム内での調整</h4>
        <div class="imgBox">
            <img width="217" alt="" src="img/page18/18_10.jpg" />
            <p>
                ゲームにログインし、メゼポルタ広場に降り立った後、[メニュー]-[オプション]-[表示（グラフィック）]でグラフィック機能の調整が可能です。ご自身のパソコン環境にあった調整をしてみましょう。
            </p>
        </div>
    </div>
    <div class="subsection">
        <div class="imgBox"><img width="500" alt="" src="img/page18/18_7.jpg" /></div>
        <h4 class="head_dia">表示（グラフィック）の詳細</h4>
        <h4>１．プリセットメニュー</h4>
        <p>・最高画質：すべての各種項目をONにした、最高設定にします。</p>
        <p>・グラフィック優先：グラフィックを優先した、高画質設定にします。</p>
        <p>・パフォーマンス優先：操作性を優先した、不可処理の少ない設定にします。</p>
        <p>・カスタム：各種項目を自由に設定することができます。</p>
        <br />
        <h4>２．各種項目</h4>
        <p>・リアルシャドウ(ロビー)：ロビーでのハンター、NPCの影処理の実影表現のON／OFFを設定します。</p>
        <p>・リアルシャドウ(クエスト)：クエストでのハンター、モンスター等の影処理の実影表現のON／OFFを設定します。</p>
        <p>・被写界深度：ぼかしだすことによって距離感を表現します。この機能のON／OFFを設定します。</p>
        <p>・ブルーム：光の表現をリアルに演出する機能のON／OFFを設定します。</p>
        <p>・SSAO：影の濃淡を自然な形で反映する機能のON／OFFを設定します。</p>
        <p>・ゴッドレイ：光の差し込み、木漏れ日の表現を行ないます。この機能のON／OFFを設定します。</p>
        <p>・アンチエイリアス：オブジェクトの輪郭を滑らかに表現する機能のON／OFFを設定します。</p>
        <p>・ソフトパーティクル：オブジェクトの輪郭を滑らかに表現する機能のON／OFFを設定します。</p>
    </div>
</section>
