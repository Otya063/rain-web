import { acccreate, acclink } from './contents';

// 各記事要素　型定義
interface Articles {
  lang: string;
  maindir: string;
  subdir: string;
  head_title: string;
  title: string;
  content: string;
}

// 各記事内容　型定義
export interface Contents {
  ja: string;
  en: string;
}

// デフォルトタイトル
const default_title_ja: string = 'MHF オンラインマニュアル';
const default_title_en: string = 'MHF Online Manual';

export const articles: Articles[] = [
  {
    // アカウント作成手順（日本語）
    lang: 'ja',
    maindir: 'entry',
    subdir: 'acccreate',
    head_title: `アカウント作成手順 | ${default_title_ja}`,
    title: 'アカウント作成手順',
    content: acccreate.ja,
  },
  {
    // アカウント作成手順（英語）
    lang: 'en',
    maindir: 'entry',
    subdir: 'acccreate',
    head_title: `Account Creation Procedure | ${default_title_en}`,
    title: 'Account Creation Procedure',
    content: acccreate.en,
  },

  {
    // アカウント連携手順（日本語）
    lang: 'ja',
    maindir: 'entry',
    subdir: 'acclink',
    head_title: `アカウント連携手順 | ${default_title_ja}`,
    title: 'アカウント連携手順',
    content: acclink.ja,
  },
  {
    // アカウント連携手順（英語）
    lang: 'en',
    maindir: 'entry',
    subdir: 'acclink',
    head_title: `Account linking Procedure | ${default_title_en}`,
    title: 'Account linking Procedure',
    content: acclink.en,
  },
];
