import type { Translation } from '../i18n-types';

const ja: Translation = {
  test: 'このページはトップページです。',

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
};

export default ja;
