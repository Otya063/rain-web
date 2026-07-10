import { error } from '@sveltejs/kit';

/**
 * ページをスムーズにトップにスクロールさせる
 */
export const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * 指定されたターゲット要素にスムーズにスクロールする
 *
 * @param {MouseEvent} e マウスイベント、`data-target`属性を持つクリックした要素を基にスクロール先の要素を取得する
 */
export const scrollToElm = (e: MouseEvent): void => {
    if (!(e.currentTarget instanceof HTMLElement)) {
        error(400, { message: '', message1: undefined, message2: ["Target element isn't HTMLElement."], message3: undefined });
    }

    const dataTarget = e.currentTarget.getAttribute('data-target')!;
    const targetElm = document.getElementById(dataTarget) as HTMLElement;

    targetElm.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
    });
};
