import type { Translation } from '../i18n-types';

const ja: Translation = {
    // Landscape Mode
    landscape_mode: '端末を縦向きにして閲覧してください。',

    // Error Page
    E404: {
        title: 'お探しのページが存在しません | Rain Server',
        h1: 'お探しのページが存在しません',
        inner_text1: 'お探しのページは、次のような原因によりご覧になることができません。',
        error_cause: {
            cause1: 'ページファイルが存在しない。',
            cause2: 'ページが移動、または削除されている。',
            cause3: 'URLに誤りがある、もしくは更新されている。',
        },
        inner_text2: 'Webサイトに関して不具合がある場合は、Rainチームまでご連絡ください。',
        btn_name: 'トップページへ戻る',
        footer_text: 'Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。<br>当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生いたしません。',
    },

    // Sign Up Page
    signup: {
        signup_title: 'Rain サーバー アカウント作成',
        email_label: 'メールアドレス',
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
        description: 'Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル',
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
                    text: 'Rainサーバーは初めてですが、<br />まずは何をすれば？',
                },
                utahime: {
                    maindir: '',
                    subdir: '',
                    alt: '歌姫狩衛戦',
                    text: 'メゼポルタへ迫る脅威を退けよ！<br />｢歌姫狩衛戦・真説｣の詳細はこちら',
                },
                ravi: {
                    maindir: '',
                    subdir: '',
                    alt: 'ラヴィエンテ',
                    text: '｢ラヴィエンテ 猛狂期｣に<br />挑みたい！',
                },
                /*tenrou: {
                    maindir: '',
                    subdir: '',
                    alt: '天廊遠征録',
                    text: '天穿つ謎の巨塔を調査せよ！<br />｢天廊遠征録｣の詳細はこちら',
                },*/
                festival: {
                    maindir: '',
                    subdir: '',
                    alt: '狩人祭',
                    text: 'チームで協力して、試練を達成せよ！<br />｢狩人祭｣の詳細はこちら',
                },
                road: {
                    maindir: '',
                    subdir: '',
                    alt: '狩煉道',
                    text: '終わりなき狩りの道<br />｢狩煉道｣とは？',
                },
                return: {
                    maindir: '',
                    subdir: '',
                    alt: '復帰区',
                    text: '久しぶりに復帰した<br />ハンターさんへ<br />｢復帰区｣をご紹介！',
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
                    signup_discord: '公式Discordにて会員登録',
                },
                article_memo:
                    '「モンスターハンター フロンティア オンライン」をプレイするためには、Rainサーバーへの会員登録が必要となります。登録画面にて設定した「ユーザー名」及び「パスワード」をゲームランチャーへ入力してログインすることで、ゲームをプレイすることができます。<br>ここでは、公式Discord内での会員登録手順についてご紹介いたします。',
                section: {
                    1: {
                        subtitle: '公式Discordにて会員登録',
                        contents: {
                            1: {
                                text: '「bot-commands」チャンネル内にあるインターフェイスより、Registerボタンを押します。',
                                img: ['discord_1'],
                            },
                            2: {
                                text: '以下のようなウィンドウが表示されたら、「Username」及び「Password」欄にそれぞれ自身の設定したい値を入力して、送信ボタンを押してください。<br />送信が完了すると、「account successfully created」というメッセージが表示されます。',
                                img: ['discord_2_1', 'discord_2_2'],
                            },
                            3: {
                                text: '/card コマンド使用後、空のキャラクターが表示されます。<br />Useボタンを押して、使用キャラクターを確定させると、「successfully switch main character」というメッセージが表示されます。<br />これにて会員登録は完了となります。',
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
                    hge_setting: 'High Grade Editionの設定方法',
                },
                article_memo:
                    '「モンスターハンター フロンティア オンライン」には通常の画質かつ手軽な環境でゲームをプレイいただけるオリジナル版と、高画質で迫力のある狩猟を体験いただけるHigh Grade Editionがあります。<br />ここでは、その動作環境やダウンロード・インストール方法といったゲームにおける基本事項についてご紹介いたします。',
                section: {
                    1: {
                        subtitle: '動作環境',
                        check_contents: [
                            'ご利用のパソコン環境に合わせ「オリジナル版」「High Grade Edition」のどちらかを選んでゲームをプレイすることが可能です。',
                            '動作環境を満たしているパソコンでも、パーツ構成などにより、ゲームが正常に起動しない場合があります。予めご了承ください。',
                        ],
                        table_data: {
                            tab_name: {
                                original: 'オリジナル版の動作環境',
                                hge: 'High Grade Editionの動作環境',
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
                                        name: 'HDD空き容量',
                                        data_common: [
                                            '20GB以上',
                                            '※上記の空き容量にはDirectX® インストール用の領域、OSのスワップファイル領域を含みます。',
                                            '※インストーラーが一時的に使用する作業領域を含みます。この作業領域はルートドライブ（通常はC:ドライブ） に必要で、インストール後に開放されます。',
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
                                        name: 'HDD空き容量',
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
                        contents: {
                            1: {
                                text: 'メンバーサイトにある「ゲームダウンロード」ボタンをクリックし、セットアップインストーラー「mhfSetup_ZZ_v○.exe」をダウンロードします。<br>※「v○」にはインストーラーのバージョン（例: v1.2）が表示されます。',
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
                                text: 'インストールするゲーム内言語およびゲームパッドボタンアイコンを選択します。<br>ゲームパッドを使用しない場合であっても、アイコンタイプは必ずどちらかご選択いただく必要があります。',
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
                            text: 'ランチャー画面とは、「MHF」起動後に表示される画面のことです。ここでは、ゲームへのログインやキャラクターの追加・削除、アップデート、環境設定等を行なえます。',
                            img: 'launcher_0',
                        },
                        h3_title: 'ランチャー画面の環境設定',
                        h3_text: 'ランチャー画面の環境設定では、ゲーム画面の起動時のサイズや音声など、パソコン側の設定に加え、High Grade Editionへの切替も行うことができます。',
                    },
                },
            },
        },
    },

    // Footer
    footer: {
        rain_officialsite: {
            title: 'Rainサーバー公式サイト',
            href: '',
            alt: '公式サイト',
        },
        rain_discord: {
            title: 'Rainサーバー公式Discord',
            href: 'https://discord.gg/TcpkpUpeGw',
            alt: '公式ディスコ',
        },
        pewpewdojo_server: {
            title: 'PewPewDojo公式Discord<br>【パートナーシップ】',
            href: 'https://discord.gg/Wpc7Cus9rb',
            alt: 'pewpewdojo',
        },
    },
    footer_note:
        '※レイアウトの関係上、本サイト内では横画面が制限されます。予めご了承ください。<br><br>※Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生いたしません。',

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
