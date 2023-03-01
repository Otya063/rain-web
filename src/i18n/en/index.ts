import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
    test: 'Test Text',

    // ヘッダー言語設定
    header: {
        now_lang: 'English',
        lang_sel: {
            ja: {
                main_name: '日本語',
                sub_name: 'Japanese',
            },
            en: {
                main_name: 'English',
                sub_name: 'English',
            },
        },
    },

    // サイドメニュー
    side_menu: {
        entry: {
            title: 'Sign Up',
            contents: {
                acccreate: 'Account Creation Procedure',
                acclink: 'Account Linking Procedure',
            },
        },
        begin: {
            title: 'Starting the Game',
            contents: {
                start: 'How to Start the Game',
                menu: 'Title Menu',
                character: 'Character Creation',
                manage: 'Managing Characters',
                world: 'World Selection',
                tutorial: 'Tutorial',
                multiple: 'Multiple Launch',
                quit: 'Quit the Game',
            },
        },
        server: {
            title: 'Discord Features',
            contents: {
                bounty: 'Bounty System',
                gacha: 'Gacha System',
                market: 'Marketplace',
                command: 'Slash Command',
            },
        },
    },

    // 動的ルート対象外記事
    articles: {
        description: 'Official online manual of Monster Hunter Frontier for Rain Server.',
        keywords: 'monster hunter frontier, official online manual, mhf, online game',
        home: {
            head_title: 'MHF Online Manual',
            title: 'Home',
            news_title: 'Update History',
            news_date: 'January 1, 2099',
            news_text: 'Online Manual is available now!<br>Detailed differences from the former official online manual and updates can be found from "More."',
            news_more: 'More',

            // 注目のコンテンツ
            featured_title: 'Featured Contents',
            featured_contents: {
                first: {
                    maindir: 'entry/', // スラッシュ（ / ）が最後に必要
                    subdir: 'acccreate/', // スラッシュ（ / ）が最後に必要
                    alt: 'first',
                    text: 'Before playing on the "Rain Server,"<br>what is the first thing to do?',
                },
                utahime: {
                    maindir: '',
                    subdir: '',
                    alt: 'utahime',
                    text: 'Repel the oncoming threat!<br>For more information on the "Battle of Diva Defence: True Story," click here.',
                },
                ravi: {
                    maindir: '',
                    subdir: '',
                    alt: 'raviente',
                    text: 'I want to challenge "Berserk Raviente"!',
                },
                /*tenrou: {
                    maindir: '',
                    subdir: '',
                    alt: 'sky corridor',
                    text: 'Investigate the unknown tower!<br>For more information on the "Sky Corridor Exploring Records," click here.',
                },*/
                festival: {
                    maindir: '',
                    subdir: '',
                    alt: '狩人祭',
                    text: 'Work together as your team to achive the trials!<br />For more information on the "Hunting Festival," click here.',
                },
                road: {
                    maindir: '',
                    subdir: '',
                    alt: 'road',
                    text: 'What is the "Hunting Road," the endless of hunting?',
                },
                return: {
                    maindir: '',
                    subdir: '',
                    alt: 'return ward',
                    text: 'Did you come back for the first time in ages? Then let\'s go to "Return Ward"!',
                },
            },

            // 外部リンク
            extlink_title: 'External Links',
            extlink_contents: {
                beginner_guide: {
                    title: 'Beginner Guide',
                    alt: 'beginner',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    href: 'https://www.youtube.com/watch?v=okHtSD1pkwc',
                    img_chara: 'extlink_beginner_chara',
                },
                faq: {
                    title: 'FAQ',
                    alt: 'faq',
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
            title: 'Rain Server Official Site',
            href: '',
            alt: 'official-site',
        },
        rain_discord: {
            title: 'Rain Server Official Discord',
            href: 'https://discord.gg/TcpkpUpeGw',
            alt: 'official-discord',
        },
        pewpewdojo_server: {
            title: 'PewPewDojo Official Discord<br>[Contributors]',
            href: 'https://discord.gg/Wpc7Cus9rb',
            alt: 'pewpewdojo',
        },
    },
    footer_note:
        '*If you change the orientation of your device while viewing a page, the entire page will be reloaded to prevent layout corruption.<br><br>*Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated through this project.',

    // ボトムナビゲーション
    bottom_nav: {
        side_menu: {
            svg_path:
                '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />',
            text: 'Menu',
        },
        language_selectArea: {
            svg_path:
                '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M3.6 9l16.8 0" /><path d="M3.6 15l16.8 0" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" />',
            text: 'Language',
        },
    },
};

export default en;
