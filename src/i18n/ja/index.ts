import type { Translation } from '../i18n-types';

const ja: Translation = {
  test: 'このページはトップページです。',

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
        adddelete: 'キャラクターの追加・削除',
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
    home: {
      head_title: 'MHF オンラインマニュアル',
      description:
        'Rain Server版モンスターハンターフロンティアの公式オンラインマニュアル',
      keywords:
        'モンスターハンター フロンティア 公式オンラインマニュアル, mhf, monster hunter frontier, オンラインゲーム',
    },
  },
};

export default ja;
