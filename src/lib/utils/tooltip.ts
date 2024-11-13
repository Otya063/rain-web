import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

/**
 * ツールチップを作成する
 *
 * @param {HTMLElement} node ツールチップを表示する対象のHTML要素
 * @param {string} content ツールチップに表示するコンテンツ
 * @returns {{ update(newContent: string): void; destroy(): void; }} ツールチップの操作に使用できるオブジェクト（更新や破棄機能）
 */
export const tooltip = (
    node: HTMLElement,
    content: string,
): {
    update(newContent: string): void;
    destroy(): void;
} => {
    const tooltip = tippy(node, {
        content,
        theme: 'material',
        allowHTML: true,
    });

    return {
        update(newContent: string) {
            tooltip.setProps({ content: newContent });
        },
        destroy() {
            tooltip.destroy();
        },
    };
};
