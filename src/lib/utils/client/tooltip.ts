import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

/**
 * ツールチップを作成する
 *
 * @param {HTMLElement} node ツールチップを表示する対象のHTML要素
 * @param {string} content ツールチップに表示するコンテンツ（空文字の時はツールチップ生成しない）
 * @returns {{ update(newContent: string): void; destroy(): void; }} ツールチップの操作に使用できるオブジェクト（更新や破棄機能）
 */
export const tooltip = (node: HTMLElement, content: string): { update(newContent: string): void; destroy(): void } => {
    let tooltipInstance = !content
        ? null
        : tippy(node, {
              content,
              theme: 'material',
              allowHTML: true,
          });

    return {
        update(newContent: string) {
            if (tooltipInstance) {
                if (newContent) {
                    // tooltipInstance存在、かつnewContent存在時、コンテンツ更新
                    tooltipInstance.setProps({ content: newContent });
                } else {
                    // tooltipInstance存在、かつnewContent空の時、インスタンス破棄
                    tooltipInstance.destroy();
                    tooltipInstance = null;
                }
            } else if (newContent) {
                // tooltipInstance無し、かつnewContent存在時、新tippyインスタンス作成
                tooltipInstance = tippy(node, {
                    content: newContent,
                    theme: 'material',
                    allowHTML: true,
                });
            }
        },
        destroy() {
            if (tooltipInstance) {
                tooltipInstance.destroy();
                tooltipInstance = null;
            }
        },
    };
};

/**
 * 要素内のテキストがオーバーフローしている時のみ、ツールチップを作成する
 *
 * @param {HTMLElement} node ツールチップを表示する対象のHTML要素
 * @param {string} content ツールチップに表示するコンテンツ
 * @returns {{ update(newContent: string): void; destroy(): void; }} ツールチップの操作に使用できるオブジェクト（更新や破棄機能）
 */
export const tooltipWhenOverflowText = (node: HTMLElement, content: string): { update(newContent: string): void; destroy(): void } => {
    let tooltipInstance: ReturnType<typeof tooltip> | null = null;

    function updateTooltip() {
        const isOverflowing = node.scrollWidth > node.clientWidth;

        if (isOverflowing && !tooltipInstance) {
            tooltipInstance = tooltip(node, content);
        } else if (!isOverflowing && tooltipInstance) {
            tooltipInstance.destroy();
            tooltipInstance = null;
        } else if (tooltipInstance) {
            tooltipInstance.update(content);
        }
    }

    updateTooltip();

    return {
        update(newContent: string) {
            content = newContent;
            updateTooltip();
        },
        destroy() {
            tooltipInstance?.destroy();
        },
    };
};
