import type { Locales } from '$i18n/i18n-types';

export * from './admin';
export * from './converter';
export * from './message';
export * from './modal';
export * from './scroll';

/* Replaces the Locale Slug in a URL
====================================================*/
export const replaceLocaleInUrl = (url: URL, locale: string, full = false): string => {
    const [, , ...rest] = url.pathname.split('/');
    const new_pathname = `/${[locale, ...rest].join('/')}`;
    if (!full) {
        return `${new_pathname}${url.search}`;
    }
    const newUrl = new URL(url.toString());
    newUrl.pathname = new_pathname;
    newUrl.search = '';

    return newUrl.toString();
};

/* Load Article
====================================================*/
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

/* Side Menu Toggle Button (Mobile)
====================================================*/
export const sideMenuSwitch = (): void => {
    const html = document.querySelector('html') as HTMLHtmlElement;
    const btn = document.getElementsByClassName('menu_btn')[0] as HTMLButtonElement;
    const menu = document.getElementsByClassName('side_menu')[0] as HTMLElement;
    html.classList.toggle('fixed');
    btn.classList.toggle('active');
    menu.classList.toggle('active');
};

/* Switching Buttons During Authentication
====================================================*/
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

/* Switching Admin Console Contents Disable
====================================================*/
export const consoleContDisable = (enable: boolean) => {
    enable ? document.getElementsByClassName('console_contents')[0].classList.add('disabled_elm') : document.getElementsByClassName('console_contents')[0].classList.remove('disabled_elm');
};
