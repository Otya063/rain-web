<script lang="ts">
    import Editor from '@tinymce/tinymce-svelte';
    import { applyAction, enhance } from '$app/forms';
    import { PUBLIC_TINY_API } from "$env/static/public";
    import {
        closeModal,
        closeMsgDisplay,
        conv2DArrayToObject,
        convertColorString,
        distEditorData,
        msgClosed,
        onSubmit,
        timeOut,
        specificDistributionData,
        commonDistributionData,
        createDistDataTitle,
        createDistDataDesc,
    } from '$utils/client';

    interface Props {
        editorType: 'event_name' | 'description';
        modalTitle: string;
    }
    let { editorType, modalTitle }: Props = $props();

    /**
     * 入力されたHTML文字列の中でネストされた`<span>`タグを平坦化し、すべての`<span>`を同じ階層に配置する
     * @param {string} html 処理対象のHTML文字列
     * @returns {string} 平坦化されたHTML文字列
     */
    const flattenNestedSpans = (html: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        /**
         * ノードを再帰処理し、ネストされた`<span>`タグを平坦化して適切なスタイルを適用する
         * @param {Node} node 処理対象のDOMノード
         * @param {string | null} parentStyle 親要素から引き継がれたスタイル、子要素に適用される
         * @returns {Node[]} 平坦化されたノードの配列
         */
        const processNode = (node: Node, parentStyle: string | null): Node[] => {
            const result: Node[] = [];

            if (node.nodeType === Node.TEXT_NODE) {
                const span = document.createElement('span');

                if (parentStyle) {
                    // spanタグ内のテキストノードを親要素のスタイルで挟む
                    span.setAttribute('style', parentStyle);
                } else {
                    // テキストのみでspanに挟まれていないものはデフォルト値の白色
                    span.setAttribute('style', 'color: #ffffff;');
                }

                span.textContent = node.textContent;
                result.push(span);
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SPAN') {
                const element = node as HTMLElement;
                const style = element.getAttribute('style') || null;

                // 子ノード再帰処理
                element.childNodes.forEach((child) => {
                    result.push(...processNode(child, style));
                });
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR') {
                // <br>はそのまま残す
                const element = node as HTMLElement;
                result.push(element.cloneNode());
            }

            return result;
        };

        const outputNodes: Node[] = [];
        doc.body.childNodes.forEach((child) => {
            outputNodes.push(...processNode(child, null));
        });

        // 処理されたノードをHTML文字列にシリアライズ
        return outputNodes
            .map(
                (node) => (node instanceof Element ? node.outerHTML : node.textContent), // 予期せぬ非要素ノードに対するフォールバック
            )
            .join('');
    };

    // 初期値設定
    let previewHtml = $state(convertColorString('html', $distEditorData.contents, editorType));
    let submitHtml = $derived(flattenNestedSpans(previewHtml.replace(/<p>|<\/p>/g, '')));
    let isEditorStarted = $state(false);
    const conf = {
        width: 500,
        height: 500,
        menubar: false,
        toolbar: 'forecolor',
        color_map: ['FFFFFF', 'White', '323232', 'Black', 'FF435D', 'Red', '56FF56', 'Green', '57FFFF', 'Cyan', 'FFFF50', 'Yellow', 'FEA461', 'Orange', 'FF84FF', 'Pink', '4C49EF', 'Blue'],
        custom_colors: false,
        newline_behavior: 'linebreak',
        remove_trailing_brs: true,
        setup: function (editor: any) {
            editor.on('init', function () {
                isEditorStarted = true;
            });
        },
    };
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={({ formData }) => {
                const data = conv2DArrayToObject([...formData.entries()]);
                const id = Number(data.dist_id);
                const input = data[editorType];
                const contents = convertColorString('colorNum', input, editorType);

                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        if ($distEditorData.showCharacterId) {
                            $specificDistributionData = $specificDistributionData.map((distribution) => {
                                if (distribution.id === id) {
                                    return {
                                        ...distribution,
                                        [editorType]: contents,
                                    };
                                }

                                return distribution;
                            });
                        } else {
                            $commonDistributionData = $commonDistributionData.map((distribution) => {
                                if (distribution.id === id) {
                                    return {
                                        ...distribution,
                                        [editorType]: contents,
                                    };
                                }

                                return distribution;
                            });
                        }
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="dist_id" value={$distEditorData.distId} />
            <input
                type="hidden"
                name={`${editorType}`}
                value={submitHtml
                    .replace(/&amp;/g, '&') // & 変換
                    .replace(/&lt;/g, '<') // < 変換
                    .replace(/&gt;/g, '>') // > 変換
                    .replace(/&nbsp;/g, ' ')}
            />

            <div class="modal_header">
                <h1>{modalTitle}</h1>
            </div>

            <div class={`modal_body ${editorType}_editor`}>
                <img class={`${editorType}_bg`} src={`/img/common/${editorType}_draft.png`} alt={`${editorType}_bg`} />
                <Editor apiKey={PUBLIC_TINY_API} inline={true} channel="7" bind:value={previewHtml} {conf} />
            </div>

            <div class="btn_group">
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>

                <button
                    class="blue_btn"
                    class:disabled_elm={!isEditorStarted}
                    type={$distEditorData.distId === 0 && !$distEditorData.showCharacterId ? 'button' : 'submit'}
                    formaction="?/updateDistributionData"
                    onclick={() => {
                        if ($distEditorData.distId === 0 && !$distEditorData.showCharacterId) {
                            // 配布物新規作成の場合
                            const processedHtml = submitHtml
                                .replace(/&amp;/g, '&') // & 変換
                                .replace(/&lt;/g, '<') // < 変換
                                .replace(/&gt;/g, '>') // > 変換
                                .replace(/&nbsp;/g, ' '); // 空白変換
                            editorType === 'event_name' ? ($createDistDataTitle = processedHtml) : ($createDistDataDesc = processedHtml);

                            closeModal();
                        } else {
                            // 配布物編集の場合
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Save</span>
                </button>
            </div>
        </form>
    </div>
</div>
