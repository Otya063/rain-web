import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
    serverTitle: 'Rain Server',
    landscapeMode: 'Please view the page in portrait mode.',

    // Header Language Selection
    header: {
        currentLang: 'English',
        langSelectArea: {
            ja: {
                mainName: '日本語',
                subName: 'Japanese',
            },
            en: {
                mainName: 'English',
                subName: 'English',
            },
        },
    },

    // Articles
    manual: {
        manualLabel: 'Online Manual',
        description: 'This is the manual page for the Rain Server version of Monster Hunter Frontier Online.',
        dataTitle: 'Contents',

        // Side Menu
        sideMenu: {
            register: {
                title: 'Register',
                contents: {
                    discord: 'Register Procedure (Discord)',
                    member: 'Register Procedure (Member Site)',
                },
            },
            begin: {
                title: 'Getting Started',
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
        article: {
            // Home
            home: {
                title: 'Home',
                newsTitle: 'Update History',
                newsDate: 'January 1, 2099',
                newsText: 'Online Manual is available now!<br>Detailed differences from the former official online manual and updates can be found from "More."',
                newsMore: 'More',

                // Featured Contents
                featuredTitle: 'Featured Contents',
                featuredContents: {
                    first: {
                        maindir: 'entry/', // slash ( / ) is required at the end
                        subdir: 'acccreate/', // slash ( / ) is required at the end
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
                        alt: 'festival',
                        text: 'Work together as your team to achive the trials!<br>For more information on the "Hunting Festival," click here.',
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
                extlinkTitle: 'External Links',
                extlinkContents: {
                    // key is class name
                    beginner_guide: {
                        title: 'Beginner Guide',
                        alt: 'beginner',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        href: 'https://www.youtube.com/watch?v=okHtSD1pkwc',
                        imgChara: 'extlink_beginner_chara',
                    },
                    faq: {
                        title: 'FAQ',
                        alt: 'faq',
                        target: '',
                        rel: '',
                        href: 'discord://discord.com/channels/937230168223789066/1040529566298550292',
                        imgChara: 'extlink_faq_chara',
                    },
                },
            },

            register: {
                // Ragistration Procedure (Discord)
                discord: {
                    title: 'Registration Procedure (Discord)',
                    outlineContents: {
                        discord: 'Registration via Rain Discord',
                    },
                    articleMemo:
                        'To play "Monster Hunter Frontier Online," you must first register with Rain Server. You can play the game by entering the "Username" and "Password," which you set on the registration page, into the game launcher and logging in. <br>This section describes how to register via Rain Discord.',
                    section: {
                        1: {
                            subtitle: 'Registration via Rain Discord',
                            centerBox: {
                                1: {
                                    text: 'On the interface in the "bot-commands" channel, press "Register" button.',
                                    img: ['discord_1'],
                                },
                                2: {
                                    text: 'When the following window appears, enter the values you want to set in the "Username" and "Password" fields respectively, then press "Submit" button.<br>When submitting is completed, you can see the message "account successfully created."',
                                    img: ['discord_2_1', 'discord_2_2'],
                                },
                                3: {
                                    text: 'After using /card, slash command, an empty character is displayed.<br>When you press "Use" button to confirm the character to be used, you can see the message "successfully switch main character."<br>Registration to Rain Server is now complete.',
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
                    outlineContents: {
                        spec: 'System Requirements',
                        install: 'Installation',
                        launcher: 'Launcher Screen',
                        start: 'Log In and Start the Game',
                        option: 'Option Settings',
                    },
                    articleMemo:
                        '"Monster Hunter Frontier Online" has now two editions as follows:<br><span style="font-weight: 700;">[1] Original Editon</span><br>You can play the game with normal quality and in a casual environment.<br><span style="font-weight: 700;">[2] High Grade Edition</span><br>You will experience powerful hunting in high quality.<br><hr>This article describes basic information on the game, such as their system requirements, how to install, and log in.',
                    section: {
                        1: {
                            subtitle: 'System Requirements',
                            checkContents: [
                                '- You can choose to play the game in either "Original Edition" or "High Grade Edition" based on your computer environments.',
                                '- Please note that even if your computer meets the following system requirements, the game may not run properly due to components or other reasons.',
                            ],
                            tableData: {
                                tabName: {
                                    original: 'Original Edition',
                                    hge: 'High Grade Edition',
                                },
                                original: {
                                    columnName: {
                                        min: 'Minimum Requirements',
                                        rec: 'Recommended Requirements',
                                    },
                                    rowData: {
                                        resolution: {
                                            name: 'Resolution',
                                            dataMin: '800×600',
                                            dataRec: '1600×1200',
                                        },
                                        os: {
                                            name: 'Operating System',
                                            dataCommon: ['Windows 7, 8, 8.1, 10 (32bit/64bit)', '* 64-bit runs on WOW64 (Windows on Windows 64)'],
                                        },
                                        cpu: {
                                            name: 'Processor',
                                            dataMin: ['Intel® Pentium® 4 2.0GHz or higher', 'AMD Athlon™64 3500+ or higher'],
                                            dataRec: [
                                                'Intel® Core™2 (Duo, Extreme, Quad) Series',
                                                'Intel® Core™ (i3, i5, i7) Series',
                                                'Intel® Core™ (i5-2000, i7-2000) Series',
                                                'AMD Athlon™ X2 Dual-Core 4600+ or higher',
                                                'AMD Phenom™ Series',
                                                'AMD AthlonII™ Series',
                                                'AMD PhenomII™ Series',
                                                'AMD A-Series APU (A8-3850, A6-3650)',
                                            ],
                                            dataCommon: 'CPU with SSE Support',
                                        },
                                        memory: {
                                            name: 'Memory',
                                            dataMin: '512MB or more',
                                            dataRec: '1GB or more',
                                        },
                                        card: {
                                            name: 'Graphics Card',
                                            dataMin: [
                                                'NVIDIA® GeForce® FX 5700 Series or higher',
                                                'NVIDIA® GeForce® 6600 Series or higher',
                                                'NVIDIA® GeForce® 7600 Series or higher',
                                                'ATi Radeon™ 9500 Series or higher',
                                                'AMD Radeon™ HD 4350 Series or higher',
                                                'AMD Radeon™ HD 5450 Series or higher',
                                            ],
                                            dataRec: [
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
                                            dataCommon: 'DirectX 9.0c or higher',
                                        },
                                        sound: {
                                            name: 'Sound Card',
                                            dataCommon: ['DirectSound® compatible 16-bit stereo 44.1kHz', 'Or sound cards that can play 48kHz WAVE format'],
                                        },
                                        hdd: {
                                            name: 'Hard Drive',
                                            dataCommon: [
                                                '20GB or more',
                                                '* The above available space includes space for DirectX® installation and OS swap file space.',
                                                '* It also includes the work space used temporarily by the installer. This work space is required in the root drive (usually C: drive) and is freed up after installation.',
                                            ],
                                        },
                                        internet: {
                                            name: 'Internet<br>Connection',
                                            dataCommon: 'Broadband environment with ADSL 1.0Mbps or faster',
                                        },
                                    },
                                },
                                hge: {
                                    columnName: 'High Grade Edition Requirements',
                                    rowData: {
                                        resolution: {
                                            name: 'Resolution',
                                            dataCommon: '1920×1080',
                                        },
                                        os: {
                                            name: 'Operating System',
                                            dataCommon: ['Windows 7, 8, 8.1, 10 (32bit/64bit)', '* 64-bit runs on WOW64 (Windows on Windows 64)'],
                                        },
                                        cpu: {
                                            name: 'Processor',
                                            dataCommon: 'Intel® Core™ i5 2.66GHz or higher',
                                        },
                                        memory: {
                                            name: 'Memory',
                                            dataCommon: '4GB or more',
                                        },
                                        card: {
                                            name: 'Graphics Card',
                                            dataCommon: ['NVIDIA® Geforce® GTX 660 (2GB) Series or higher', 'Or graphics cards of equivalent or higher performance'],
                                        },
                                        directx: {
                                            dataCommon: [
                                                'DirectX 9.0c or higher',
                                                '* Even if DirectX is already installed on your computer, you will need to install "<a href="https://www.microsoft.com/en-us/download/details.aspx?id=8109" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">DirectX End-User Runtimes</a>" separately.',
                                            ],
                                        },
                                        sound: {
                                            name: 'Sound Card',
                                            dataCommon: ['DirectSound® compatible 16-bit stereo 44.1kHz', 'Or sound cards that can play 48kHz WAVE format'],
                                        },
                                        hdd: {
                                            name: 'Hard Drive',
                                            dataCommon: '20GB or more',
                                        },
                                        internet: {
                                            name: 'Internet<br>Connection',
                                            dataCommon: 'Broadband environment with ADSL 1.0Mbps or faster',
                                        },
                                    },
                                },
                            },
                            specNotes: {
                                1: 'The game does not have native 64-bit support. So even if you run the game on 64-bit version, system performance will not be improved compared to 32-bit version.',
                                2: 'Please use the latest driver provided by the manufacturer of your graphics card.',
                            },
                        },
                        2: {
                            subtitle: 'Installation',
                            centerBox: {
                                1: {
                                    text: 'Click the "Game Download" button on the member site to download the setup installer "mhfSetup_ZZ_v○.exe."<br><span style="color: red;">* "v○" is the version of the installer (e.g., v1.2).</span>',
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
                                    text: 'Click Install to start the installation.',
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
                            introBox: {
                                text: 'The launcher screen is the screen that you can see after running the game. You can log in to the game, add or delete characters, update, configure settings, etc., from here.',
                                img: 'launcher_0',
                            },
                            h3: {
                                // login area
                                1: {
                                    title: 'Log In Area',
                                    text: 'You can enter your account credentials and select your login server. For more information, please refer to the "<a href="#start" style="text-decoration:underline;">Log In and Start the Game</a>" section.',
                                    img: 'login_area',
                                    centerBox: {
                                        text1: '【Server Selection】',
                                        img: 'server_desc',
                                        text2: 'There are three Rain servers: Rain (JP) [Tokyo, Japan], Rain (US) [New York City, New York, United States], and Rain (EU) [Frankfurt, Hesse, Germany], but they are not independent. So basically, the login destination [Jakarta, Indonesia] is the same no matter which server you connect from. However, depending on the distance between your country/region and the server location, your ping may be high (the game will lag) while you are playing, so you should select the server that is closest to your region.',
                                    },
                                },

                                // preferences
                                2: {
                                    title: 'In-Game Preferences',
                                    text: 'In preferences, you can configure settings on your computer side, such as the size of the game screen when it starts up and the sound, in addition to switching to High Grade Edition.',
                                    img: 'preferences',
                                    centerBox: [
                                        {
                                            text: '[Graphics] Tab',
                                            img: 'launcher_1',
                                            imgDesc: [
                                                {
                                                    itemTitle: '①Graphics Slider',
                                                    itemText:
                                                        'One of three presets ("High," "Moderate," and "Low") can be selected for the settings on [Display] and [Sound] tabs.<br>When "Advanced" button is turned on, this slider is not selectable and the preset label is displayed as "Custom."',
                                                },
                                                {
                                                    itemTitle: '②Advanced Button',
                                                    itemText:
                                                        'When turned on, the settings on both [Display] and [Sound] tabs can be changed freely, and the preset label in the graphics slider will be displayed as "Custom."',
                                                },
                                                {
                                                    itemTitle: '③High Grade Edition Check Box',
                                                    itemText: 'If checked, "High Grade Edition" is enabled.',
                                                },
                                            ],
                                        },
                                        {
                                            text: '[Display] Tab',
                                            img: 'launcher_2',
                                            imgDesc: [
                                                {
                                                    itemTitle: '①Display Mode and Resolution Settings',
                                                    itemText:
                                                        'In "Display Mode" section, you can select either "Windowed Mode" or "Fullscreen Mode" as the display modes when the game starts, and in "Resolution" section, you can select the resolution for each screen mode.',
                                                },
                                                {
                                                    itemTitle: '②Texture Compression',
                                                    itemText:
                                                        'Select either to enable or disable DXTC (Texture Compression Algorithms).<br>When enabled, image processing is faster, but images may be blocky.<br>When disabled, image processing is slower, but images are more high quality.',
                                                },
                                            ],
                                        },
                                        {
                                            text: '[Sound] Tab',
                                            img: 'launcher_3',
                                            imgDesc: [
                                                {
                                                    itemTitle: '①Sound Settings',
                                                    itemText:
                                                        'Each volume can be adjusted with the slider for each of the three types of the game windows ("General," "Unfocused," and "Minimized").<br>If "Disable Sound Output" is checked, the game will be muted.',
                                                },
                                                {
                                                    itemTitle: '②Sample Rate',
                                                    itemText:
                                                        'You can set the sampling rate and buffer size according to your sound card.<ul><li class="imgDesc_section_text_list"><span class="imgDesc_section_text_list_title">Sample Rate</span><span>This refers to the number of processes per unit of time to convert an analog signal, such as audio, into a digital signal. In general, as this value increases, the sound quality will be improved. But the amount of data involved will also increase, so it will lead to affecting storage and bandwidth. On the other hand, extremely low values can lead to low-quality and unnatural sound.</span></li><li class="imgDesc_section_text_list"><span class="imgDesc_section_text_list_title">Buffer Size</span><span>This refers to the size of the area in which a certain amount of data is temporarily loaded in advance. If this value increase, the latency for audio playback will be longer, but audio dropouts are less likely to occur. On the other hand, if the value is decrease, the latency for audio playback will be shorter, but audio dropouts are more likely to occur.</span></li></ul>',
                                                },
                                            ],
                                        },
                                        {
                                            text: '[Proxy] Tab',
                                            img: 'launcher_4',
                                            imgDesc: [
                                                {
                                                    itemTitle: '①Proxy Settings',
                                                    itemText:
                                                        'If "Use Download Proxy" is checked, you can connect to the game via a proxy server.<br><span style="text-decoration: underline; color: red;">* Currently this is not available in Japanese version, only available in English and French versions.</span>',
                                                },
                                            ],
                                        },
                                    ],
                                },

                                // side_contents
                                3: {
                                    title: 'Side Contents',
                                    text: 'This is the area where event banners, announcements, and links to access web media, are posted. These can be accessed directly from the launcher without opening a browser to search for them.',
                                    img: 'side_contents',
                                },
                            },
                        },
                        4: {
                            subtitle: 'Log In and Start the Game',
                            checkContents: {
                                text: 'A computer with a multi-core processor can run two games on one computer.',
                                link: 'Multiple Launch',
                            },
                            halfBox: {
                                text: '（1）Click the "Monster Hunter Frontier Online" icon on the desktop.',
                                img: 'start_1',
                            },
                            centerBox: {
                                2: {
                                    text: 'The launcher screen will be displayed.<br>Enter your username and password, select the login server, and click the "Log In" button to log in to the server. Then file checking and updating will begin.',
                                    img: 'start_2',
                                },
                                3: {
                                    text: 'Select your character and click the "Start Game" to start the game.<br>At first, only "<span style="color: blue;">Ready to Hunt</span>" will be displayed as shown in the image below.',
                                    img: 'start_3',
                                },
                                4: {
                                    text: 'On the game title screen, press Enter or click on the screen to display the title menu.',
                                    img: 'start_4',
                                },
                            },
                        },
                        5: {
                            subtitle: 'Option Settings',

                            // hge settings
                            1: {
                                title: 'High Grade Edition Settings',
                                centerBox: {
                                    1: {
                                        text: 'Click the "In-Game Preferences" on the launcher screen.',
                                        img: 'hge_1',
                                    },
                                    2: {
                                        text: 'The Settings screen will appear.<br>Check the "Enable High Grade Edition" checkbox in [Graphics] Tab and click OK.',
                                        img: 'hge_2',
                                    },
                                    3: {
                                        text: 'After logging in, if "High Grade Edition" is displayed on the title screen, the game can be played in High Grade Edition.',
                                        img: 'hge_3',
                                    },
                                },
                            },

                            // graphics settings
                            2: {
                                title: 'Graphics Settings',
                                halfBox: {
                                    text: 'Graphics can be adjusted by opening the menu and going to [Options] > [Display (High Grade)].',
                                    img: 'graphics_0',
                                },
                                centerBox: {
                                    img: 'graphics_1',
                                    imgDesc: [
                                        {
                                            itemTitle: '①Prisets',
                                            itemText: [
                                                {
                                                    head: 'Maximum',
                                                    content: 'Turn on all settings and set the game to the highest setting.',
                                                },
                                                {
                                                    head: 'Quality Priority',
                                                    content: 'Set to a high image quality setting, giving priority to graphics.',
                                                },
                                                {
                                                    head: 'Performance Priority',
                                                    content: 'Set to a low load processing setting, giving priority to operability.',
                                                },
                                                {
                                                    head: 'Custom',
                                                    content: 'Each setting can be customized at will.',
                                                },
                                            ],
                                        },
                                        {
                                            itemTitle: '②Each Setting',
                                            itemText: [
                                                {
                                                    head: 'Realistic Shadows (Town)',
                                                    content: 'Realistic shoadow setting for hunters and NPCs in the town.',
                                                },
                                                {
                                                    head: 'Realistic Shadows (Quest)',
                                                    content: 'Realistic shoadow setting for hunters, monsters, etc. in quests.',
                                                },
                                                {
                                                    head: 'Depth of Field',
                                                    content:
                                                        'An effect that applies blur to an object depending on the distance before and after the focus.<br>With ON, when the object is in focus, the area in front and behind it is blurred, giving a more natural sense of distance and immersive experience.<br>With OFF, the distance between the object and its surroundings is not so well represented, and the image is clearly displayed. But it appears different from the scenery you normally see in the real world, and you may feel some discomfort.',
                                                },
                                                {
                                                    head: 'High Dynamic Range',
                                                    content:
                                                        'An effect in which light spreads from the light source to the surroundings.<br>With ON, a more realistic light expression is possible.<br>With OFF, the bloom effect is not expressed and may seem somewhat less realistic.',
                                                },
                                                {
                                                    head: 'SSAO',
                                                    content:
                                                        'Shadows are created even in places where light does not penetrate easily, such as gaps between three-dimensional objects and around bends, to achieve a more realistic 3D representation. However, this requires high processing power on the PC side, so you should turn it off if the game is lagging.<br>With ON, you can enjoy graphics with more realistic shading and a three-dimensional feel.<br>With OFF, shading is not expressed and the screen looks simple.',
                                                },
                                                {
                                                    head: 'God Rays',
                                                    content:
                                                        'An effect that allows light to shine back into the air by scattering, such as through trees. However, this requires high processing power on the PC side, so you should turn it off if the game is lagging.',
                                                },
                                                {
                                                    head: 'Anti-Aliasing',
                                                    content:
                                                        'Smoothes object outlines for a more natural look. However, this requires high processing power on the PC side, so you should turn it off if the game is lagging.',
                                                },
                                                {
                                                    head: 'Soft Particles',
                                                    content:
                                                        'Smoothes object outlines for a more natural look. However, this requires high processing power on the PC side, so you should turn it off if the game is lagging.',
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
    },

    // Footer
    footer: {
        // key is class name
        rain_web: {
            title: 'Rain Member Site',
            href: 'https://www.rain-server.com/{lang: string}/member',
            alt: 'member_site',
        },
        rain_discord: {
            title: 'Rain Discord',
            href: 'https://discord.gg/TcpkpUpeGw',
            alt: 'official_discord',
        },
        pewpewdojo: {
            title: 'PewPewDojo Discord<br>[Contributors]',
            href: 'https://discord.gg/Wpc7Cus9rb',
            alt: 'pewpewdojo',
        },
    },
    disclaimer:
        'Rain Server is not affiliated with Capcom Co., Ltd. or any of its subsidiaries. <br>This community is based on the cooperation of numerous volunteers, and no revenue of any sort is generated through this community.',

    // Maintenance Page
    maintenance: {
        title: 'Under Maintenance',
        message1: 'This site is currently under maintenance and cannot be accessed.',
        message2: 'Maintenance will end on: ',
        message3: 'Please wait for a while until the end of maintenance is announced.',
    },

    // Error Page
    error: {
        unexpectedErr: 'Unexpected Error',
        otherMessage1: 'An error occurred in the page for the following reason:',
        otherMessage2: 'Reason unknown.',
        adminForbidden: 'Only the Rain Server administrators have access to this page.',

        400: {
            title: 'Bad Request',
            message1: 'Failed to process the request for the following reasons:',
        },

        401: {
            title: 'Unauthorized',
        },

        403: {
            title: 'Forbidden',
            message1: 'You are not allowed to access this page for the following reason:',
            message2: ['The user accessing this page is not Rain Administrators.'],
            message3: 'If you find any problems with our website, please contact the Rain Team.',
        },

        404: {
            title: 'Not Found',
            message1: 'The requested page was not found for the following reason:',
            message2: ['The page file does not exist.', 'The page has been moved or deleted.', 'The URL was not correct or has been updated.'],
            message3: 'If you find any problems with our website, please contact the Rain Team.',
        },

        422: {
            title: 'Unprocessable Entity',
            message1: 'Failed to process the request for the following reasons:',
        },

        500: {
            title: 'Internal Error',
            message1: 'An error occurred inside the server for the following reasons:',
            message3: 'Please try again after a while.',
        },
    },
};

export default en;
