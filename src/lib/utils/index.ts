import { replaceLocaleInUrl } from '.';
import type { Locales } from '$i18n/i18n-types';

/* utilsフォルダ内においては如何なるファイルであっても、databaseのものをimportしてはならない（Cannot import $env/static/private into client-side code） */
/* ここはクライアントサイドに露出するため、サーバーサイドで使用しなければいけないデータベース関連の処理は使えない（importできない） */
export * from './admin';
export * from './binary';
export * from './converter';
export * from './distribution';
export * from './message';
export * from './modal';
export * from './scroll';
export * from './tooltip';

/**
 * 記事ページを読み込み遷移する
 * @param {MouseEvent} e イベントオブジェクト
 * @param {URL} url 基本となるURL
 * @param {Locales} langCode 使用する言語コード
 * @param {string} [pathname] オプションのパス名、指定するとURLのパスに追加する
 */
export const loadArticle = (e: MouseEvent, url: URL, langCode: Locales, pathname?: string): void => {
    e.stopPropagation();
    let newURL: string;

    // generate new URL
    if (pathname) {
        newURL = pathname === 'root' ? `${url.origin}/${langCode}/` : `${url.origin}/${langCode}/${pathname}`;
    } else {
        newURL = replaceLocaleInUrl(url, langCode);
    }

    location.href = newURL;
};

/**
 * モバイルデバイス用サイドメニューの表示/非表示を切り替える
 */
export const sideMenuSwitch = (): void => {
    const html = document.querySelector('html') as HTMLHtmlElement;
    const btn = document.getElementsByClassName('menu_btn')[0] as HTMLButtonElement;
    const menu = document.getElementsByClassName('side_menu')[0] as HTMLElement;
    html.classList.toggle('fixed');
    btn.classList.toggle('active');
    menu.classList.toggle('active');
};

/**
 * 認証中のボタンの状態を切り替える
 * @param {boolean} enable ボタンを有効化するか無効化するかのフラグ
 * @param {HTMLElement | null} btnElm 対象のボタン要素
 * @param {HTMLCollectionOf<Element> | null} [labelElm] 対象のラベル要素
 * @param {NodeListOf<Element> | null} [inputElm] 対象の入力フィールド要素
 */
export const switchBtnInAuth = (enable: boolean, btnElm: HTMLElement | null, labelElm: HTMLCollectionOf<Element> | null = null, inputElm: NodeListOf<Element> | null = null): void => {
    if (enable) {
        btnElm?.classList.remove('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.remove('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.remove('disabled_elm');
        });
    } else {
        btnElm?.classList.add('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.add('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.add('disabled_elm');
        });
    }
};

/**
 * 管理コンソールのコンテンツを有効または無効にする
 * @param {boolean} enable コンテンツを有効にするか無効にするかのフラグ
 */
export const consoleContDisable = (enable: boolean): void => {
    enable ? document.getElementsByClassName('console_contents')[0].classList.add('disabled_elm') : document.getElementsByClassName('console_contents')[0].classList.remove('disabled_elm');
};

/**
 * 入力値が許可された文字のみを含むかどうかを検証する
 * - 日本語: ひらがな、カタカナ、漢字
 * - 英語: 大文字、小文字、半角数字
 * - 記号: ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
 *
 * @param {Event} event
 * @returns {boolean} 検証結果
 */
export const validateInput = (event: Event): boolean => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    const allowedCharsRegex = /^[\u3040-\u30FF\u4E00-\u9FFFa-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/;

    // 値が空でなく、許容される文字にマッチするかチェック
    return value && allowedCharsRegex.test(value) ? true : false;
};
