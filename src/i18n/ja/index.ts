import type { Translation } from '../i18n-types';

const ja: Translation = {
    // Landscape Mode
    landscape_mode: '端末を縦向きにして閲覧してください。',

    // Error Page
    E404: {
        title: 'お探しのページが存在しません | レインサーバー',
        h1: 'お探しのページが存在しません',
        inner_text1: 'お探しのページは、次のような原因によりご覧になることができません。',
        error_cause: {
            cause1: 'ページファイルが存在しない。',
            cause2: 'ページが移動、または削除されている。',
            cause3: 'URLに誤りがある、もしくは更新されている。',
        },
        inner_text2: 'ウェブサイトに関して不具合を発見した際は、レインチームまでご連絡ください。',
        btn_name: 'トップページへ戻る',
        footer_text: 'レインサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。<br>当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生いたしません。',
    },

    // Sign Up Page
    signup: {
        signup_title: 'レインサーバー アカウント作成',
        username_label: 'ユーザー名',
        password_label: 'パスワード',
        signup_button: '登録する',
        already: '既に存在するユーザーです。',
    },

    // Header Language Selection
    header: {
        now_lang: '日本語',
        lang_sel: {
            ja: {
                main_name: '日本語',
                sub_name: '日本語',
            },
            en: {
                main_name: 'English',
                sub_name: '英語',
            },
        },
    },

    // Side Menu
    side_menu: {
        signup: {
            title: '会員登録',
            contents: {
                discord: '会員登録手順（Discord）',
                member: '会員登録手順（メンバーサイト）',
            },
        },
        begin: {
            title: 'ゲームを始めるまで',
            contents: {
                start: 'ゲームの始め方',
                menu: 'メニュー画面',
                character: 'キャラクタークリエイション',
                manage: 'キャラクターの追加・削除',
                world: 'ワールドを選ぼう',
                tutorial: 'チュートリアル',
                multiple: 'ゲームの多重起動',
                quit: 'ゲームの終了',
            },
        },
        server: {
            title: 'Discord内各種機能',
            contents: {
                bounty: 'バウンティシステム',
                gacha: 'ガチャシステム',
                market: 'マーケットプレイス',
                command: 'スラッシュコマンド',
            },
        },
        event: {
            title: 'ゲーム内イベント',
            contents: {
                road: '狩煉道',
                diva: '歌姫狩衛戦・真説',
                gslaying: '大討伐クエスト',
                huntfest: '狩人祭',
                skycorridor: '天廊遠征録（廃止）',
                voyage: 'パローネ大航祭（廃止）',
                anarchy: '極限征伐戦（廃止）',
                ascendant: '至天征伐戦（廃止）',
            },
        },
    },

    // Articles
    articles: {
        description: 'レインサーバー版モンスターハンターフロンティアの公式オンラインマニュアル',
        keywords: 'モンスターハンター フロンティア, モンスターハンター, モンハン, オンラインマニュアル, mhf, monster hunter frontier, オンラインゲーム',
        data_title: 'コンテンツ',

        // Home
        home: {
            head_title: 'MHF オンラインマニュアル',
            title: 'トップページ',
            news_title: '更新履歴',
            news_date: '2099年1月1日',
            news_text: 'オンラインマニュアルを開設いたしました。<br>旧公式オンラインマニュアルとの詳しい相違点及び更新内容は「詳細を見る」よりご確認いただけます。',
            news_more: '詳細を見る',

            // Featured Contents
            featured_title: '注目のコンテンツ',
            featured_contents: {
                first: {
                    maindir: 'entry/', // スラッシュ（ / ）が最後に必要
                    subdir: 'acccreate/', // スラッシュ（ / ）が最後に必要
                    alt: '初めに',
                    text: 'レインサーバーは初めてですが、<br>まずは何をすれば？',
                },
                utahime: {
                    maindir: '',
                    subdir: '',
                    alt: '歌姫狩衛戦',
                    text: 'メゼポルタへ迫る脅威を退けよ！<br>｢歌姫狩衛戦・真説｣の詳細はこちら',
                },
                ravi: {
                    maindir: '',
                    subdir: '',
                    alt: 'ラヴィエンテ',
                    text: '｢ラヴィエンテ 猛狂期｣に<br>挑みたい！',
                },
                /*tenrou: {
                    maindir: '',
                    subdir: '',
                    alt: '天廊遠征録',
                    text: '天穿つ謎の巨塔を調査せよ！<br>｢天廊遠征録｣の詳細はこちら',
                },*/
                festival: {
                    maindir: '',
                    subdir: '',
                    alt: '狩人祭',
                    text: 'チームで協力して、試練を達成せよ！<br>｢狩人祭｣の詳細はこちら',
                },
                road: {
                    maindir: '',
                    subdir: '',
                    alt: '狩煉道',
                    text: '終わりなき狩りの道<br>｢狩煉道｣とは？',
                },
                return: {
                    maindir: '',
                    subdir: '',
                    alt: '復帰区',
                    text: '久しぶりに復帰した<br>ハンターさんへ<br>｢復帰区｣をご紹介！',
                },
            },

            // External Links
            extlink_title: '外部リンク',
            extlink_contents: {
                beginner_guide: {
                    title: '初心者ガイド',
                    alt: '初心者',
                    target: '',
                    rel: '',
                    href: 'discord://discord.com/channels/937230168223789066/1034385867764150332',
                    img_chara: 'extlink_beginner_chara',
                },
                faq: {
                    title: 'よくある質問',
                    alt: 'よくある質問',
                    target: '',
                    rel: '',
                    href: 'discord://discord.com/channels/937230168223789066/1040529566298550292',
                    img_chara: 'extlink_faq_chara',
                },
            },
        },

        signup: {
            // Sign-up Procedure (Discord)
            discord: {
                title: '会員登録手順（Discord）',
                outline_contents: {
                    discord: '公式Discordにて会員登録',
                },
                article_memo:
                    '「モンスターハンター フロンティア オンライン」をプレイするためには、レインサーバーへの会員登録が必要となります。登録画面にて設定した「ユーザー名」及び「パスワード」をゲームランチャーへ入力してログインすることで、ゲームをプレイすることができます。<br>ここでは、公式Discord内での会員登録手順について紹介します。',
                section: {
                    1: {
                        subtitle: '公式Discordにて会員登録',
                        center_box: {
                            1: {
                                text: '「bot-commands」チャンネル内にあるインターフェイスより、Registerボタンを押します。',
                                img: ['discord_1'],
                            },
                            2: {
                                text: '以下のようなウィンドウが表示されたら、「Username」及び「Password」欄にそれぞれ自身の設定したい値を入力して、送信ボタンを押してください。<br>送信が完了すると、「account successfully created」というメッセージが表示されます。',
                                img: ['discord_2_1', 'discord_2_2'],
                            },
                            3: {
                                text: '/card コマンド使用後、空のキャラクターが表示されます。<br>Useボタンを押して、使用キャラクターを確定させると、「successfully switch main character」というメッセージが表示されます。これにて会員登録は完了となります。',
                                img: ['discord_3_1', 'discord_3_2'],
                            },
                        },
                    },
                },
            },
        },

        begin: {
            // How to Start the Game
            start: {
                title: 'ゲームの始め方',
                outline_contents: {
                    spec: '動作環境',
                    install: 'インストール',
                    launcher: 'ランチャー画面',
                    start: 'ログイン・ゲーム開始',
                    option: 'オプション設定',
                },
                article_memo:
                    '「モンスターハンター フロンティア オンライン」には、以下の2エディションが存在し、ご自身の環境に合わせて自由に選択することができます。<br><span style="font-weight: 700;">[1] オリジナル版</span><br>通常画質かつ手軽な環境でゲームがプレイ可能。<br><span style="font-weight: 700;">[2] High Grade Edition</span><br>高画質で迫力のある狩猟が体験可能。<br><hr>ここでは、その動作環境やダウンロード・インストール方法といったゲームにおける基本事項についてご紹介いたします。',
                section: {
                    1: {
                        subtitle: '動作環境',
                        check_contents: [
                            '・ご利用のパソコン環境に合わせ「オリジナル版」「High Grade Edition」のどちらかを選んでゲームをプレイすることが可能です。',
                            '・以下動作環境を満たしているパソコンでも、パーツ構成などにより、ゲームが正常に起動しない場合があります。予めご了承ください。',
                        ],
                        table_data: {
                            tab_name: {
                                original: 'オリジナル版',
                                hge: 'High Grade Edition',
                            },
                            original: {
                                column_name: {
                                    min: '必要動作環境',
                                    rec: '推奨動作環境',
                                },
                                row_data: {
                                    resolution: {
                                        name: '解像度',
                                        data_min: '800×600',
                                        data_rec: '1600×1200',
                                    },
                                    os: {
                                        name: 'OS',
                                        data_common: ['Windows 7, 8, 8.1, 10（32bit/64bit 日本語版）', '※64bit版はWOW64（Windows on Windows 64）での動作です。'],
                                    },
                                    cpu: {
                                        name: 'CPU',
                                        data_min: ['インテル® Pentium® 4 2.0GHz以上', 'AMD Athlon™64 3500+以上'],
                                        data_rec: [
                                            'インテル® Core™2（Duo, Extreme, Quad）シリーズ',
                                            'インテル® Core™（i3, i5, i7）シリーズ',
                                            'インテル® Core™（i5-2000, i7-2000）シリーズ',
                                            'AMD Athlon™ X2 デュアルコア・プロセッサ4600+以上',
                                            'AMD Phenom™ シリーズ',
                                            'AMD AthlonII™ シリーズ',
                                            'AMD PhenomII™ シリーズ',
                                            'AMD A-Series APU（A8-3850, A6-3650）',
                                        ],
                                        data_common: 'SSE対応のCPU',
                                    },
                                    memory: {
                                        name: 'メモリ',
                                        data_min: '512MB以上',
                                        data_rec: '1GB以上',
                                    },
                                    card: {
                                        name: 'グラフィック<br>カード',
                                        data_min: [
                                            'NVIDIA® GeForce® FX 5700シリーズ以上',
                                            'NVIDIA® GeForce® 6600シリーズ以上',
                                            'NVIDIA® GeForce® 7600シリーズ以上',
                                            'ATi Radeon™ 9500シリーズ以上',
                                            'AMD Radeon™ HD 4350シリーズ以上',
                                            'AMD Radeon™ HD 5450シリーズ以上',
                                        ],
                                        data_rec: [
                                            'NVIDIA® GeForce® 8600シリーズ以上',
                                            'NVIDIA® GeForce® 9600シリーズ以上',
                                            'NVIDIA® GeForce® 200シリーズ以上',
                                            'AMD Radeon™ HD 2600シリーズ以上',
                                            'AMD Radeon™ HD 3650シリーズ以上',
                                            'AMD Radeon™ HD 4650シリーズ以上',
                                            'AMD Radeon™ HD 5550シリーズ以上',
                                            'AMD Radeon™ HD 6450シリーズ以上',
                                        ],
                                    },
                                    directx: {
                                        data_common: 'DirectX 9.0c以上',
                                    },
                                    sound: {
                                        name: 'サウンド<br>カード',
                                        data_common: ['DirectSound®対応16bitステレオ44.1kHz', 'もしくは48kHz WAVE形式が再生可能なサウンドカード'],
                                    },
                                    hdd: {
                                        name: 'ハードディスク',
                                        data_common: [
                                            '20GB以上',
                                            '※上記の空き容量にはDirectX® インストール用の領域、OSのスワップファイル領域を含みます。',
                                            '※インストーラーが一時的に使用する作業領域を含みます。この作業領域はルートドライブ（通常はC:ドライブ） に必要ですが、インストール後に開放されます。',
                                        ],
                                    },
                                    internet: {
                                        name: 'インターネット<br>接続環境',
                                        data_common: 'ADSL1.0Mbps以上のブロードバンド環境',
                                    },
                                },
                            },
                            hge: {
                                column_name: 'High Grade Edition 動作環境',
                                row_data: {
                                    resolution: {
                                        name: '解像度',
                                        data_common: '1920×1080',
                                    },
                                    os: {
                                        name: 'OS',
                                        data_common: ['Windows 7, 8, 8.1, 10（32bit/64bit 日本語版）', '※64bit版はWOW64（Windows on Windows 64）での動作です。'],
                                    },
                                    cpu: {
                                        name: 'CPU',
                                        data_common: 'インテル® Core™ i5 2.66GHz以上',
                                    },
                                    memory: {
                                        name: 'メモリ',
                                        data_common: '4GB以上',
                                    },
                                    card: {
                                        name: 'グラフィックカード',
                                        data_common: ['NVIDIA® Geforce® GTX 660（2GB）シリーズ以上', 'または同クラスのグラフィックスボード以上'],
                                    },
                                    directx: {
                                        data_common: [
                                            'DirectX 9.0c以上',
                                            '※DirectXが既にインストールされているパソコンでも、「<a href="https://www.microsoft.com/ja-JP/download/details.aspx?id=8109" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">DirectX エンドユーザー ランタイム</a>」が別途必要となります。',
                                        ],
                                    },
                                    sound: {
                                        name: 'サウンドカード',
                                        data_common: ['DirectSound®対応16bitステレオ44.1kHz', 'もしくは48kHz WAVE形式が再生可能なサウンドカード'],
                                    },
                                    hdd: {
                                        name: 'ハードディスク',
                                        data_common: '20GB以上',
                                    },
                                    internet: {
                                        name: 'インターネット<br>接続環境',
                                        data_common: 'ADSL1.0Mbps以上のブロードバンド環境',
                                    },
                                },
                            },
                        },
                        spec_notes: {
                            1: '本ゲームは64bitネイティブ対応ではないため、64bit版Windows OS上でゲームを起動したとしても、システム性能が32bit版と比較して向上することはありません。',
                            2: 'グラフィックカードには製造元の公式サイトで提供されている最新のドライバをご使用ください。',
                        },
                    },
                    2: {
                        subtitle: 'インストール',
                        center_box: {
                            1: {
                                text: 'メンバーサイトにある「ゲームダウンロード」ボタンをクリックし、セットアップインストーラー「mhfSetup_ZZ_v○.exe」をダウンロードします。<br><span style="color: red;">※「v○」にはインストーラーのバージョン（例: v1.2）が表示されます。</span>',
                                img: 'install_1',
                            },
                            2: {
                                text: 'インストーラーを実行し、言語を選択します。<br>インストールされるゲームタイトルおよびゲームフォルダー名はここで選択した言語に依存します。',
                                img: 'install_2',
                            },
                            3: {
                                text: 'インストール前に表示される重要情報を必ずご確認ください。',
                                img: 'install_3',
                            },
                            4: {
                                text: 'インストール先フォルダが表示されます。基本的にはデフォルトのままで問題ありませんが、ご自身の環境に合わせて、フォルダを任意で変更することも可能です。',
                                img: 'install_4',
                            },
                            5: {
                                text: 'インストールするゲーム内言語およびゲームパッド用ボタンアイコンを選択します。<br>ゲームパッドを使用しない場合であっても、アイコンタイプは必ずどちらかご選択いただく必要があります。',
                                img: 'install_5',
                            },
                            6: {
                                text: '「インストール」ボタンをクリックすると、インストールが開始されます。',
                                img: 'install_6',
                            },
                            7: {
                                text: '以下画像が表示されれば、インストール完了です。',
                                img: 'install_7',
                            },
                        },
                    },
                    3: {
                        subtitle: 'ランチャー画面',
                        intro_box: {
                            text: 'ランチャー画面とは、ゲーム起動後に表示される画面のことです。ここでは、ゲームへのログインやキャラクターの追加・削除、アップデート、環境設定等を行なえます。',
                            img: 'launcher_0',
                        },
                        h3: {
                            // login area
                            1: {
                                title: 'ログインエリア',
                                text: 'アカウント認証情報の入力およびログインサーバーの選択が可能です。詳しいログイン方法は「<a href="#start" data-target="start" style="text-decoration:underline;">ログイン・ゲーム開始</a>」セクションをご参照ください。',
                                img: 'login_area',
                                center_box: {
                                    text1: '【サーバー選択について】',
                                    img: 'server_desc',
                                    text2: 'レインサーバーには、Rain (JP)[日本・東京都]、Rain (US)[アメリカ合衆国・ニューヨーク州ニューヨーク市]、Rain (EU)[ドイツ連邦共和国・ヘッセン州フランクフルト]の3サーバーが存在します。しかしながら、各々のサーバーが独立している訳ではなく、上記イメージ図のように、全てが1つのメインサーバー[インドネシア・ジャカルタ]へ接続されているため、基本的にはどのサーバーから接続してもログイン先は同じとなります。しかし、お住まいの国・地域とサーバー間の距離が遠くなるにつれ、プレイ時にPing値が高くなる傾向（遅延発生）があり、サーバー選択時には出来る限りお住まいの地域から距離が最も近いサーバーを選択することをお勧めします。',
                                },
                            },

                            // preferences
                            2: {
                                title: 'ゲーム内環境設定',
                                text: 'ランチャー画面の環境設定では、ゲーム画面の起動時のサイズや音声など、パソコン側の設定に加え、High Grade Editionへの切替も行うことができます。',
                                img: 'preferences',
                                center_box: [
                                    {
                                        text: '【設定】タブ',
                                        img: 'launcher_1',
                                        img_desc: [
                                            {
                                                item_title: '①設定スライダ',
                                                item_text:
                                                    '表示タブおよび音声タブの設定に対してプリセット3種（「高」「中」「低」）から一つ選択できます。<br>詳細設定ボタンをオンにした際は選択不可となり、プリセット表記は「カスタム」と表示されます。',
                                            },
                                            {
                                                item_title: '②詳細設定ボタン',
                                                item_text: 'オンにすると、表示タブおよび音声タブにて設定を自由に変更することが可能となり、設定スライダ内のプリセット表記が「カスタム」となります。',
                                            },
                                            {
                                                item_title: '③High Grade Editionチェックボックス',
                                                item_text: 'チェックを入れると、「High Grade Edition」が有効になります。',
                                            },
                                        ],
                                    },
                                    {
                                        text: '【表示】タブ',
                                        img: 'launcher_2',
                                        img_desc: [
                                            {
                                                item_title: '①起動モードおよび画面サイズ設定',
                                                item_text:
                                                    '「起動モード」にてゲーム開始時の画面モードを、「ウィンドウモード」もしくは「フルスクリーンモード」から選択し、「画面サイズ」にて各画面モードでの画面サイズの指定ができます。',
                                            },
                                            {
                                                item_title: '②圧縮テクスチャ',
                                                item_text:
                                                    'DXTC（画像圧縮アルゴリズム）の有効もしくは無効を選択します。<br>有効時では、画像処理は速くなる一方、画像細部が粗くなる可能性があります。<br>無効時では、画像処理は遅くなる一方、画像細部が高精細になります。',
                                            },
                                        ],
                                    },
                                    {
                                        text: '【音声】タブ',
                                        img: 'launcher_3',
                                        img_desc: [
                                            {
                                                item_title: '①音量設定',
                                                item_text:
                                                    '3種のゲームウィンドウ（「通常（アクティブ時）」「非アクティブ時」「最小化時」）それぞれに応じて、各音量をスライダにより調節することができます。<br>「サウンドを使用しない」にチェックを入れると、ゲームがミュートになります。',
                                            },
                                            {
                                                item_title: '②サンプリングレート',
                                                item_text:
                                                    'ご使用のサウンドカードに合わせてサンプリングレートおよびバッファサイズを設定できます。<ul><li class="img_desc_section_text_list"><span class="img_desc_section_text_list_title">サンプリングレート</span><span>音声などのアナログ信号をデジタル信号に変換するために行う単位時間あたりの処理回数を表す値のことです。一般的に、この値が高くなるにつれ、音質の向上が見込まれるものの、その分データ量も増加するため、ストレージや帯域幅に影響を与えます。一方、値が極度に低くなれば、音質の低下や不自然な音を引き起こす可能性があります。</span></li><li class="img_desc_section_text_list"><span class="img_desc_section_text_list_title">バッファサイズ</span><span>あらかじめ一定量のデータを一時的に読み込んでおく領域のの大きさのことを指します。この値が大きければ、音声再生までの待ち時間が長くなるものの、音飛びは発生しづらくなります。一方、値が小さければ、音声再生までの待ち時間は短くなりますが、音飛びが発生しやすくなります。</span></li></ul>',
                                            },
                                        ],
                                    },
                                    {
                                        text: '【接続】タブ',
                                        img: 'launcher_4',
                                        img_desc: [
                                            {
                                                item_title: '①プロキシ設定',
                                                item_text:
                                                    '「ダウンロードにプロキシを使用」にチェックを入れると、プロキシサーバーを経由してゲームへ接続することができます。<br><span style="text-decoration: underline; color: red;">※現在、日本語版では利用不可、英語版およびフランス語版でのみ利用可能です。</span>',
                                            },
                                        ],
                                    },
                                ],
                            },

                            // side_contents
                            3: {
                                title: 'サイドコンテンツ',
                                text: 'イベントバナーやお知らせ、ウェブ媒体等へのアクセスリンクが掲載されているエリアです。ブラウザを開いて検索する手間を省き、ランチャーから直接情報の閲覧が可能となっています。適宜ご活用ください。',
                                img: 'side_contents',
                            },
                        },
                    },
                    4: {
                        subtitle: 'ログイン・ゲーム開始',
                        check_contents: {
                            text: 'マルチコアプロセッサーを搭載したパソコンでは、1台のパソコンでゲームを2つ起動することが可能です。',
                            link: 'ゲームの多重起動',
                        },
                        half_box: {
                            text: '（1）デスクトップ上にある「モンスターハンター フロンティア オンライン」のアイコンをクリックします。',
                            img: 'start_1',
                        },
                        center_box: {
                            2: {
                                text: 'ランチャー画面が起動します。<br>ユーザー名とパスワードを入力し、「ログイン」ボタンをクリックするとログインが行なわれ、ファイルチェックおよびアップデートが開始されます。',
                                img: 'start_2',
                            },
                            3: {
                                text: 'キャラクターを選択し、「ゲームスタート」を押すとゲームが起動します。<br>初めは下図のように「<span style="color: blue;">狩人申請可能</span>」のみが表示されます。',
                                img: 'start_3',
                            },
                            4: {
                                text: 'ゲームのタイトル画面では、Enterキーを押す、もしくは画面をクリックすると、タイトルメニューが表示されます。',
                                img: 'start_4',
                            },
                        },
                    },
                    5: {
                        subtitle: 'オプション設定',

                        // hge settings
                        1: {
                            title: 'High Grade Editionの設定',
                            center_box: {
                                1: {
                                    text: 'ランチャー画面で「ゲーム内環境設定」をクリックします。',
                                    img: 'hge_1',
                                },
                                2: {
                                    text: '設定画面が表示されます。<br>設定タブ内の「High Grade Editionを有効にする」にチェックを入れ、OKをクリックします。',
                                    img: 'hge_2',
                                },
                                3: {
                                    text: 'ログイン後、タイトル画面で「High Grade Edition」と表示されているとHigh Grade Editionでプレイ可能となります。',
                                    img: 'hge_3',
                                },
                            },
                        },

                        // graphics settings
                        2: {
                            title: 'グラフィックの設定',
                            half_box: {
                                text: 'メニューを開き、［オプション］＞［表示（グラフィック）］でグラフィックの調整が可能です。',
                                img: 'graphics_0',
                            },
                            center_box: {
                                img: 'graphics_1',
                                img_desc: [
                                    {
                                        item_title: '①プリセット',
                                        item_text: [
                                            {
                                                head: '最高画質',
                                                content: '全ての項目をONにした、最高設定にします。',
                                            },
                                            {
                                                head: 'グラフィック優先',
                                                content: 'グラフィックを優先した、高画質設定にします。',
                                            },
                                            {
                                                head: 'パフォーマンス優先',
                                                content: '操作性を優先した、不可処理の少ない設定にします。',
                                            },
                                            {
                                                head: 'カスタム',
                                                content: '各種項目を自由に設定することができます。',
                                            },
                                        ],
                                    },
                                    {
                                        item_title: '②各種項目',
                                        item_text: [
                                            {
                                                head: 'リアルシャドウ（ロビー）',
                                                content: 'ロビーでのハンター、NPCの影処理の実影表現のON/OFFを設定します。',
                                            },
                                            {
                                                head: 'リアルシャドウ（クエスト）',
                                                content: 'クエストでのハンター、モンスター等に対する実影処理のON/OFFを設定します。',
                                            },
                                            {
                                                head: '被写界深度',
                                                content:
                                                    '焦点前後の距離に応じてブラーを対象物へ適用するエフェクトを設定します。<br>ONでは、対象物にフォーカスが合った時に、その前後の範囲がボケるように描写され、より自然な距離感や没入感を体感できます。<br>OFFでは、対象物とその周囲の距離感があまり表現されず、映像がはっきりと表示されますが、現実世界で普段目にする風景とは異質に映り、多少の違和感を覚えるかもしれません。',
                                            },
                                            {
                                                head: 'ブルーム',
                                                content:
                                                    '光源から光が周囲に広がっていくエフェクトを設定します。<br>ONでは、よりリアルな光の表現が可能となります。<br>OFFでは、ブルーム効果は表現されず、ややリアリティに欠けると感じるかもしれません。',
                                            },
                                            {
                                                head: 'SSAO',
                                                content:
                                                    '立体物の隙間や曲がり角等、実際に光が入り込みにくい場所にも陰影が生まれ、よりリアルな3D表現を実現できます。しかし、それにはパソコン側の高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFを推奨します。<br>ONでは、よりリアルな陰影が表現され、立体感のあるグラフィックスを楽しむことができます。<br>OFFでは、陰影の表現は行われず、画面がよりシンプルな印象を受けます。',
                                            },
                                            {
                                                head: 'ゴッドレイ',
                                                content:
                                                    '光の差し込み、木漏れ日等、光が散乱して空気中に照り返す現象を可能にしますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFを推奨します。',
                                            },
                                            {
                                                head: 'アンチエイリアス',
                                                content:
                                                    'オブジェクトの輪郭線を滑らかにして、より自然な見た目を実現しますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFを推奨します。',
                                            },
                                            {
                                                head: 'ソフトパーティクル',
                                                content:
                                                    'オブジェクトの輪郭線を滑らかにして、より自然な見た目を実現しますが、高い処理能力が必要となるため、ゲームがカクついてしまう場合は、OFFを推奨します。',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    },

    // Footer
    footer: {
        rain_officialsite: {
            title: 'レインサーバー公式サイト',
            href: '',
            alt: 'official_site',
        },
        rain_discord: {
            title: 'レインサーバー公式Discord',
            href: 'https://discord.gg/TcpkpUpeGw',
            alt: 'official_discord',
        },
        pewpewdojo_server: {
            title: 'PewPewDojo公式Discord<br>【パートナーシップ】',
            href: 'https://discord.gg/Wpc7Cus9rb',
            alt: 'pewpewdojo',
        },
    },
    footer_note:
        '※レイアウトの関係上、本サイト内では横画面が制限されます。予めご了承ください。<br><br>※レインサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生いたしません。',

    // Bottom Navigation
    bottom_nav: {
        side_menu: {
            svg_path:
                '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />',
            text: 'メニュー',
        },
        language_selectArea: {
            svg_path:
                '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M3.6 9l16.8 0" /><path d="M3.6 15l16.8 0" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" />',
            text: '言語選択',
        },
    },
};

export default ja;
