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
            <a class="scroll" data-target="installation">インストール</a>
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

<section id="spec">
    <h2>動作環境</h2>

    <div class="check_contents">
        <ul class="check_contents_list">
            <li class="check_contents_list_text">・ご利用のパソコン環境に合わせ「オリジナル版」「High Grade Edition」のどちらかを選んでMHFをプレイすることが可能です。</li>
            <li class="check_contents_list_text">・動作環境を満たしているパソコンでも、パーツ構成などにより、ゲームが正常に起動しない場合があります。予めご了承ください。</li>
        </ul>
    </div>

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
    <div class="center_box_no_number">
        <p style="font-weight: 500;" class="center_box_no_number_text">
            ランチャー画面の環境設定では、ゲーム画面の起動時のサイズや音声など、パソコン側の設定を行うことができます。 <br />また、High Grade Editionへの切替もここで可能です。
        </p>
    </div>

    <ul>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【設定】タブ</p>
            <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/launcher_1.png" alt="launcher_1" /></p>
            <ul class="img_desc_section">
                <li class="img_desc_section_item">
                    ①設定スライダ
                    <p class="img_desc_section_text">
                        表示タブおよび音声タブの設定に対してプリセット3種（「高」「中」「低」）から一つ選択できます。<br
                        />詳細設定ボタンをオンにした際は選択不可となり、プリセット表記は「カスタム」と表示されます。
                    </p>
                </li>
                <li class="img_desc_section_item">
                    ②詳細設定ボタン
                    <p class="img_desc_section_text">
                        オンにすると、表示タブおよび音声タブにて設定を自由に変更することができます。<br />カスタム設定有効時には、設定スライダ内のプリセット表記が「カスタム」となります。
                    </p>
                </li>
                <li class="img_desc_section_item">
                    ③HGEチェックボックス
                    <p class="img_desc_section_text">チェックを入れると、「High Grade Edition」が有効になります。</p>
                </li>
            </ul>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【表示】タブ</p>
            <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/launcher_2.png" alt="launcher_2" /></p>
            <ul class="img_desc_section">
                <li class="img_desc_section_item">
                    ①画面サイズ設定
                    <p class="img_desc_section_text">
                        「起動モード」にてゲーム開始時の画面モードを、「ウィンドウモード」もしくは「フルスクリーンモード」から選択し、「画面サイズ」にて各画面モードでの画面サイズの指定ができます。
                    </p>
                </li>
                <li class="img_desc_section_item">
                    ②圧縮テクスチャ
                    <p class="img_desc_section_text">
                        DXTC（画像圧縮技術）の有効もしくは無効を選択します。<br />「有効」では、画像処理は速くなる一方、画像細部が粗くなります。<br
                        />「無効」では、画像処理は遅くなる一方、画像細部が高精細になります。
                    </p>
                </li>
            </ul>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【音声】タブ</p>
            <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/launcher_3.png" alt="launcher_3" /></p>
            <ul class="img_desc_section">
                <li class="img_desc_section_item">
                    ①音量設定
                    <p class="img_desc_section_text">3種のゲームウィンドウ（「通常（アクティブ時）」「非アクティブ時」「最小化時」）それぞれに応じて、各音量をスライダにより調節することができます。</p>
                </li>
                <li class="img_desc_section_item">
                    ②サンプリングレート
                    <p class="img_desc_section_text">
                        ご使用のサウンドカードに合わせてサンプリングレートおよびバッファサイズを設定できます。<br
                        />サンプリングレートとは、音声等のアナログ信号をデジタル信号へ変換するために必要となる標本化を実行する単位時間あたりの処理回数を表す値の事です。一般的に、この値が高くなるにつれ、音質の向上が見込まれるものの、その分データ量も増加するため、ストレージや帯域幅に影響を与えます。一方、値が極度に低くなれば、音質の低下や不自然な音を引き起こす可能性があります。<br
                        />バッファサイズとは、一時的に先読みさせておいたデータを保存する領域の大きさの事を指します。値が大きいと、音声再生までの待ち時間が長くなる一方、音飛びが発生しづらくなります。値が小さいと、音声再生までの待ち時間が短くなる一方、音飛びが発生しやすくなります。
                    </p>
                </li>
            </ul>
        </li>
        <li class="center_box_no_number">
            <p class="center_box_no_number_text">【接続】タブ</p>
            <p class="center_box_no_number_img"><img src="/img/{$locale}/articles/begin/start/launcher_4.png" alt="launcher_4" /></p>
            <ul class="img_desc_section">
                <li class="img_desc_section_item">
                    ①プロキシ設定
                    <p class="img_desc_section_text">
                        「ダウンロードにプロキシを使用」にチェックを入れると、プロキシサーバーを経由してゲームへ接続することができます。<br
                        />※現在、日本語版では利用不可、英語版およびフランス語版でのみ利用可能です。
                    </p>
                </li>
            </ul>
        </li>
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
