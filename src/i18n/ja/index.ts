import type { Translation } from '../i18n-types';

const ja: Translation = {
    landscape_mode: '端末を縦向きにして閲覧してください。',

    // ヘッダー言語設定
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

    // サイドメニュー
    side_menu: {
        entry: {
            title: '会員登録',
            contents: {
                acccreate: 'アカウント作成手順',
                acclink: 'アカウント連携手順',
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
    },

    // 動的ルート対象外記事
    articles: {
        description: 'Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル',
        keywords: 'モンスターハンター フロンティア 公式オンラインマニュアル, mhf, monster hunter frontier, オンラインゲーム',
        home: {
            head_title: 'MHF オンラインマニュアル',
            title: 'トップページ',
            news_title: '更新履歴',
            news_date: '2099年1月1日',
            news_text: 'オンラインマニュアルを開設いたしました。<br>旧公式オンラインマニュアルとの詳しい相違点及び更新内容は「詳細を見る」よりご確認いただけます。',
            news_more: '詳細を見る',

            // 注目のコンテンツ
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

            // 外部リンク
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
    },

    // フッター
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
        '※レイアウトの関係上、本サイト内では横画面が制限されます。予めご了承ください。<br><br>※Rainサーバーは、株式会社カプコンまたはその子会社とは一切関係ありません。当プロジェクトは多数のボランティアによる協力の下で成り立っており、いかなる収益も発生しません。',

    // ボトムナビゲーション
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
