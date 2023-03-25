import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
    // ランドスケープモードテキスト
    landscape_mode: 'Please view the page in portrait mode.',

    // エラーページ
    E404: {
        title: '404 Not Found | Rain Server',
        h1: '404 Not Found',
        inner_text1: 'The requested page was not found due to the following reasons.',
        error_cause: {
            cause1: 'The page file does not exist.',
            cause2: 'The page has been moved or deleted.',
            cause3: 'The URL was not correct or has been updated.',
        },
        inner_text2: 'If you have any problems with our website, please contact the Rain Team.',
        btn_name: 'Return to Home',
        footer_text:
            'Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. <br>This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated through this project.',
    },

    register: {
        register_title: 'Rain Server Account Creation',
        email_label: 'Email',
        username_label: 'Username',
        password_label: 'Password',
        register_button: 'Sign Up',
        already: 'The user already exists.',
    },

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
        signup: {
            title: 'Sign Up',
            contents: {
                discord: 'Sign-up Procedure (Discord)',
                membersite: 'Sign-up Procedure (Member Site)',
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
        event: {
            title: 'In-Game Event',
            contents: {
                road: 'Hunting Road',
                diva: 'Battle of Diva Defence: True Story',
                gslaying: 'Great Slaying Quest',
                huntfest: 'Hunting Festival',
                skycorridor: 'Sky Corridor Exploring Records(Abolition)',
                voyage: 'Pallone Grand Voyage(Abolition)',
                anarchy: 'Battlecry in the Anarchy(Abolition)',
                ascendant: 'Honor of the Ascendant(Abolition)',
            },
        },
    },

    // 記事
    articles: {
        description: 'Official Online Manual of Monster Hunter Frontier for Rain Server.',
        keywords: 'monster hunter frontier, monster hunter, online manual, mhf, online game',

        // トップページ
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

        // 会員登録
        signup: {
            // Discord
            discord: {
                title: 'Sign-up Procedure (Discord)',
                table_contents: 'Sign Up with Official Discord',
                data_title: 'Contents',
                article_memo:
                    'In order to play "Monster Hunter Frontier Online," you need to sign up for the Rain Server first. You can play the game by entering the "Username" and "Password," which you set on the registration screen, into the game launcher and logging in. <br>This section describes sign-up procedure with official discord.',
                subtitle: 'Sign Up with Official Discord',
                center_box1: 'On the interface in the "bot-commands" channel, press "Register" button.',
                center_box2:
                    'When the following window appears, enter the values you want to set in the "Username" and "Password" fields respectively, then press "Submit" button.<br>When submitting is completed, you can see the message "account successfully created."',
                center_box3:
                    'After using /card, slash command, an empty character is displayed.<br>When you press "Use" button to confirm the character to be used, you can see the message "successfully switch main character."<br>Signing up for Rain is now completed.',
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
        '*Due to the layout, the landscape mode is restricted in this website.<br><br>*Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated through this project.',

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
