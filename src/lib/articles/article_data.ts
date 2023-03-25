// 各記事要素　型定義
interface Articles {
    lang: string;
    maindir: string;
    subdir: string;
    head_title: string;
    title: string;
}

// デフォルトタイトル
const default_title_ja: string = 'MHF オンラインマニュアル';
const default_title_en: string = 'MHF Online Manual';

export const articles: Articles[] = [
    {
        // 会員登録手順（Discord）
        lang: 'ja',
        maindir: 'signup',
        subdir: 'discord',
        head_title: `会員登録手順（Discord）| ${default_title_ja}`,
    },
    {
        // Sign-up Procedure (Discord)
        lang: 'en',
        maindir: 'signup',
        subdir: 'discord',
        head_title: `Sign-up Procedure (Discord) | ${default_title_en}`,
    },

     {
        // 会員登録手順（メンバーサイト）
        lang: 'ja',
        maindir: 'signup',
        subdir: 'membersite',
        head_title: `会員登録手順（メンバーサイト）| ${default_title_ja}`,
    },
    {
        // Sign-up Procedure (Member Site)
        lang: 'en',
        maindir: 'signup',
        subdir: 'membersite',
        head_title: `Sign-up Procedure (Member Site) | ${default_title_en}`,
    }, 

    {
        // ゲームの始め方（日本語）
        lang: 'ja',
        maindir: 'begin',
        subdir: 'start',
        head_title: `ゲームの始め方 | ${default_title_ja}`,
    },
    {
        // How to Start the Game
        lang: 'en',
        maindir: 'begin',
        subdir: 'start',
        head_title: `How to Start the Game | ${default_title_en}`,
    },
];
