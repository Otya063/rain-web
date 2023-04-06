import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
    // Landscape Mode
    landscape_mode: 'Please view the page in portrait mode.',

    // Error Page
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

    // Sign Up Page
    signup: {
        signup_title: 'Rain Server Account Creation',
        email_label: 'Email',
        username_label: 'Username',
        password_label: 'Password',
        signup_button: 'Sign Up',
        already: 'The user already exists.',
    },

    // Header Language Selection
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

    // Side Menu
    side_menu: {
        signup: {
            title: 'Sign Up',
            contents: {
                discord: 'Sign-up Procedure (Discord)',
                member: 'Sign-up Procedure (Member Site)',
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

    // Articles
    articles: {
        description: 'Official Online Manual of Monster Hunter Frontier for Rain Server.',
        keywords: 'monster hunter frontier, monster hunter, online manual, mhf, online game',
        data_title: 'Contents',

        // Home
        home: {
            head_title: 'MHF Online Manual',
            title: 'Home',
            news_title: 'Update History',
            news_date: 'January 1, 2099',
            news_text: 'Online Manual is available now!<br>Detailed differences from the former official online manual and updates can be found from "More."',
            news_more: 'More',

            // Featured Contents
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

            // External Links
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

        signup: {
            // Sign-up Procedure (Discord)
            discord: {
                title: 'Sign-up Procedure (Discord)',
                outline_contents: {
                    discord: 'Sign Up with Official Discord',
                },
                article_memo:
                    'In order to play "Monster Hunter Frontier Online," you need to sign up for the Rain Server first. You can play the game by entering the "Username" and "Password," which you set on the registration screen, into the game launcher and logging in. <br>This section describes sign-up procedure with official discord.',
                section: {
                    1: {
                        subtitle: 'Sign Up with Official Discord',
                        center_box: {
                            1: {
                                text: 'On the interface in the "bot-commands" channel, press "Register" button.',
                                img: ['discord_1'],
                            },
                            2: {
                                text: 'When the following window appears, enter the values you want to set in the "Username" and "Password" fields respectively, then press "Submit" button.<br>When submitting is completed, you can see the message "account successfully created."',
                                img: ['discord_2_1', 'discord_2_2'],
                            },
                            3: {
                                text: 'After using /card, slash command, an empty character is displayed.<br>When you press "Use" button to confirm the character to be used, you can see the message "successfully switch main character."<br>Signing up for Rain is now completed.',
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
                title: 'How to Start the Game',
                outline_contents: {
                    spec: 'System Requirements',
                    install: 'Installation',
                    launcher: 'Launcher Screen',
                    start: 'Log In and Start the Game',
                    hge_setting: 'High Grade Edition Settings',
                },
                article_memo:
                    '"Monster Hunter Frontier Online" has now two editions as follows:<br> ー Original Editon: You can play the game with normal quality and in a casual environment.<br> ー High Grade Edition: You will experience powerful hunting in high quality.<br>This article describes basic information on the game, such as its system requirements, how to install, and log in.',
                section: {
                    1: {
                        subtitle: 'System Requirements',
                        check_contents: [
                            'You can choose to play the game in either "Original Edition" or "High Grade Edition" based on your computer environments.',
                            'Please note that the game may not run properly due to components, etc, even if your computer meets system requirements.',
                        ],
                        table_data: {
                            tab_name: {
                                original: 'Requirements on Original Edition',
                                hge: 'Requirements on High Grade Edition',
                            },
                            original: {
                                column_name: {
                                    min: 'Minimum Requirements',
                                    rec: 'Recommended Requirements',
                                },
                                row_data: {
                                    resolution: {
                                        name: 'Resolution',
                                        data_min: '800×600',
                                        data_rec: '1600×1200',
                                    },
                                    os: {
                                        name: 'Operating System',
                                        data_common: ['Windows 7, 8, 8.1, 10 (32bit/64bit)', '* 64-bit runs on WOW64 (Windows on Windows 64)'],
                                    },
                                    cpu: {
                                        name: 'Processor',
                                        data_min: ['Intel® Pentium® 4 2.0GHz or higher', 'AMD Athlon™64 3500+ or higher'],
                                        data_rec: [
                                            'Intel® Core™2 (Duo, Extreme, Quad) Series',
                                            'Intel® Core™ (i3, i5, i7) Series',
                                            'Intel® Core™ (i5-2000, i7-2000) Series',
                                            'AMD Athlon™ X2 Dual-Core 4600+ or higher',
                                            'AMD Phenom™ Series',
                                            'AMD AthlonII™ Series',
                                            'AMD PhenomII™ Series',
                                            'AMD A-Series APU (A8-3850, A6-3650)',
                                        ],
                                        data_common: 'CPU with SSE Support',
                                    },
                                    memory: {
                                        name: 'Memory',
                                        data_min: '512MB or more',
                                        data_rec: '1GB or more',
                                    },
                                    card: {
                                        name: 'Graphics Card',
                                        data_min: [
                                            'NVIDIA® GeForce® FX 5700 Series or higher',
                                            'NVIDIA® GeForce® 6600 Series or higher',
                                            'NVIDIA® GeForce® 7600 Series or higher',
                                            'ATi Radeon™ 9500 Series or higher',
                                            'AMD Radeon™ HD 4350 Series or higher',
                                            'AMD Radeon™ HD 5450 Series or higher',
                                        ],
                                        data_rec: [
                                            'NVIDIA® GeForce® 8600 Series or higher',
                                            'NVIDIA® GeForce® 9600 Series or higher',
                                            'NVIDIA® GeForce® 200 Series or higher',
                                            'AMD Radeon™ HD 2600 Series or higher',
                                            'AMD Radeon™ HD 3650 Series or higher',
                                            'AMD Radeon™ HD 4650 Series or higher',
                                            'AMD Radeon™ HD 5550 Series or higher',
                                            'AMD Radeon™ HD 6450 Series or higher',
                                        ],
                                    },
                                    directx: {
                                        data_common: 'DirectX 9.0c or higher',
                                    },
                                    sound: {
                                        name: 'Sound Card',
                                        data_common: ['DirectSound® compatible 16-bit stereo 44.1kHz', 'Or sound cards that can play 48kHz WAVE format'],
                                    },
                                    hdd: {
                                        name: 'Hard Drive',
                                        data_common: [
                                            '20GB or more',
                                            '* The above available space includes space for DirectX® installation and OS swap file space.',
                                            '* It also includes the work space used temporarily by the installer. This work space is required in the root drive (usually C: drive) and is freed up after installation.',
                                        ],
                                    },
                                    internet: {
                                        name: 'Internet<br>Connection',
                                        data_common: 'Broadband environment with ADSL 1.0Mbps or faster',
                                    },
                                },
                            },
                            hge: {
                                column_name: 'High Grade Edition Requirements',
                                row_data: {
                                    resolution: {
                                        name: 'Resolution',
                                        data_common: '1920×1080',
                                    },
                                    os: {
                                        name: 'Operating System',
                                        data_common: ['Windows 7, 8, 8.1, 10 (32bit/64bit)', '* 64-bit runs on WOW64 (Windows on Windows 64)'],
                                    },
                                    cpu: {
                                        name: 'Processor',
                                        data_common: 'Intel® Core™ i5 2.66GHz or higher',
                                    },
                                    memory: {
                                        name: 'Memory',
                                        data_common: '4GB or more',
                                    },
                                    card: {
                                        name: 'Graphics Card',
                                        data_common: ['NVIDIA® Geforce® GTX 660 (2GB) Series or higher', 'Or graphics cards of equivalent or higher performance'],
                                    },
                                    directx: {
                                        data_common: [
                                            'DirectX 9.0c or higher',
                                            '* Even if DirectX is already installed on your computer, you will need to install "<a href="https://www.microsoft.com/en-us/download/details.aspx?id=8109" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">DirectX End-User Runtimes</a>" separately.',
                                        ],
                                    },
                                    sound: {
                                        name: 'Sound Card',
                                        data_common: ['DirectSound® compatible 16-bit stereo 44.1kHz', 'Or sound cards that can play 48kHz WAVE format'],
                                    },
                                    hdd: {
                                        name: 'Hard Drive',
                                        data_common: '20GB or more',
                                    },
                                    internet: {
                                        name: 'Internet<br>Connection',
                                        data_common: 'Broadband environment with ADSL 1.0Mbps or faster',
                                    },
                                },
                            },
                        },
                        spec_notes: {
                            1: 'The game does not have native 64-bit support. So even if you run the game on 64-bit version, system performance will not be improved compared to 32-bit version.',
                            2: 'Please use the latest driver provided by the manufacturer of your graphics card.',
                        },
                    },
                    2: {
                        subtitle: 'Installation',
                        center_box: {
                            1: {
                                text: 'Click "Game Download" button on the member site to download the setup installer "mhfSetup_ZZ_v○.exe."<br><span style="color: red;">* "v○" is the version of the installer (e.g., v1.2).</span>',
                                img: 'install_1',
                            },
                            2: {
                                text: 'Run the installer and select your language.<br>The game title and game folder name to be installed depends on the language selected here.',
                                img: 'install_2',
                            },
                            3: {
                                text: 'Please be sure to read the important information displayed before installation.',
                                img: 'install_3',
                            },
                            4: {
                                text: 'The destination folder will be displayed. Basically, it would be no problem with the default folder. But you can also change the folder according to your environment.',
                                img: 'install_4',
                            },
                            5: {
                                text: 'Select the in-game language and button icons for gamepad to be installed.<br>Even if you do not use any gamepad, you need to select one of the icon types here.',
                                img: 'install_5',
                            },
                            6: {
                                text: 'Click "Install" button to start the installation.',
                                img: 'install_6',
                            },
                            7: {
                                text: 'If you can see the following screen, installation is completed.',
                                img: 'install_7',
                            },
                        },
                    },
                    3: {
                        subtitle: 'Launcher Screen',
                        intro_box: {
                            text: 'The launcher screen is the screen that you can see after running the game. You can log in to the game, add or delete characters, update, configure settings, etc., from here.',
                            img: 'launcher_0',
                        },
                        h3_title: 'Preferences on the Launcher',
                        h3_text:
                            'In preferences, you can configure settings on your computer side, such as the size of the game screen when it starts up and the sound, in addition to switching to High Grade Edition.',
                        center_box: [
                            {
                                text: '[Graphics] Tab',
                                img: 'launcher_1',
                                img_desc: [
                                    {
                                        item_title: '①Graphics Slider',
                                        item_text:
                                            'One of three presets ("High," "Moderate," and "Low") can be selected for the settings on [Display] and [Sound] tabs.<br>When "Advanced" button is turned on, this slider is not selectable and the preset label is displayed as "Custom."',
                                    },
                                    {
                                        item_title: '②Advanced Button',
                                        item_text:
                                            'When turned on, the settings on both [Display] and [Sound] tabs can be changed freely, and the preset label in the graphics slider will be displayed as "Custom."',
                                    },
                                    {
                                        item_title: '③High Grade Edition Check Box',
                                        item_text: 'If checked, "High Grade Edition" is enabled.',
                                    },
                                ],
                            },
                            {
                                text: '[Display] Tab',
                                img: 'launcher_2',
                                img_desc: [
                                    {
                                        item_title: '①Display Mode and Resolution Settings',
                                        item_text:
                                            'In "Display Mode" section, you can select either "Windowed Mode" or "Fullscreen Mode" as the display modes when the game starts, and in "Resolution" section, you can select the resolution for each screen mode.',
                                    },
                                    {
                                        item_title: '②Texture Compression',
                                        item_text:
                                            'Select either to enable or disable DXTC (Texture Compression Algorithms).<ul><li class="img_desc_section_text_list"><span>Enabled:</span><span>Image processing is faster, but images are blocky.</span></li><li class="img_desc_section_text_list"><span>Disabled:</span><span>Image processing is slower, but images are more high quality.</span>',
                                    },
                                ],
                            },
                            {
                                text: '[Sound] Tab',
                                img: 'launcher_3',
                                img_desc: [
                                    {
                                        item_title: '①Sound Settings',
                                        item_text:
                                            'Each volume can be adjusted with the slider for each of the three types of the game windows ("General," "Unfocused," and "Minimized").<br>If "Disable Sound Output" is checked, the game will be muted.',
                                    },
                                    {
                                        item_title: '②Sample Rate',
                                        item_text:
                                            'You can set the sampling rate and buffer size according to your sound card.<ul><li class="img_desc_section_text_list"><span>Sample Rate:</span><span>It refers to the number of processes per unit of time to convert an analog signal, such as audio, into a digital signal. In general, as this value increases, the sound quality will be improved. But the amount of data involved will also increase, so it will lead to affecting storage and bandwidth. On the other hand, extremely low values can lead to low-quality and unnatural sound.</span></li><li class="img_desc_section_text_list"><span>Buffer Size:</span><span>It refers to the size of the area in which a certain amount of data is temporarily loaded in advance. If this value increase, the latency for audio playback will be longer, but audio dropouts are less likely to occur. On the other hand, if the value is decrease, the latency for audio playback will be shorter, but audio dropouts are more likely to occur.</span></li></ul>',
                                    },
                                ],
                            },
                            {
                                text: '[Proxy] Tab',
                                img: 'launcher_4',
                                img_desc: [
                                    {
                                        item_title: '①Proxy Settings',
                                        item_text:
                                            'If "Use Download Proxy" is checked, you can connect to the game via a proxy server.<br><span style="text-decoration: underline; color: red;">* Currently this is not available in Japanese version, only available in English and French versions.</span>',
                                    },
                                ],
                            },
                        ],
                    },
                    4: {
                        subtitle: 'Log In and Start the Game',
                    },
                },
            },
        },
    },

    // Footer
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
        '* Due to the layout, the landscape mode is restricted in this website.<br><br>* Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. This project is based on the cooperation of numerous volunteers, and no revenue of any sort is generated through this project.',

    // Bottom Navigation
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
