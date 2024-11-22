import type { Locales } from '$i18n/i18n-types';
import { replaceLocaleInUrl } from '.';

/* utils/client内においては如何なるファイルであっても、databaseのものをimportしてはならない（Cannot import $env/static/private into client-side code）*/
/* ここはクライアントサイドに露出するため、サーバーサイドで使用するデータベース関連の処理は使えない（utils/serverからimportする） */
export * from './admin';
export * from './assets';
export * from './converter';
export * from './distribution';
export * from './message';
export * from './modal';
export * from './scroll';
export * from './tooltip';
export * from './validation';

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
