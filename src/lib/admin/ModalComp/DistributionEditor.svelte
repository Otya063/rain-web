<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { applyAction, enhance } from '$app/forms';
    import type { DistEditorData } from '$types';
    import {
        closeModal,
        closeMsgDisplay,
        conv2DArrayToObject,
        convertColorString,
        modalData,
        msgClosed,
        onSubmit,
        timeOut,
        checkModalType,
        adjustLineBreakOps,
        createDistDataTitle,
        createDistDataDesc,
        updateAllDistributionData,
        distributionPagerInstance,
        preventEnterKeyInEditor,
        encodeToShiftJIS,
    } from '$utils/client';

    // 初期値設定
    const editorType = ($modalData as DistEditorData).type === 0 ? 'event_name' : 'description';
    // let previewHtml = $state(convertColorString('html', ($modalData as DistEditorData).contents, editorType));
    let deltaString = $state(convertColorString('delta', ($modalData as DistEditorData).contents));
    let submitHtml = $derived(convertColorString('colorNum', deltaString, editorType));
    // let submitHtml = $derived(flattenNestedSpans(previewHtml.replace(/<p>|<\/p>/g, ''))); // エディターで必要だったp要素を全て削除
    let isEditorStarted = $state(false);
    let editorContainer: HTMLDivElement; // エディター要素
    let isValidPreviewTitle = $state(true);

    // const replaceRgbWithHex = (html: string): string => {
    //     return html.replace(/rgb\((\d+), (\d+), (\d+)\)/g, (_, r, g, b) => {
    //         const result = `rgb(${r}, ${g}, ${b})`.match(/\d+/g);
    //         if (result) {
    //             const r = parseInt(result[0]).toString(16).padStart(2, '0');
    //             const g = parseInt(result[1]).toString(16).padStart(2, '0');
    //             const b = parseInt(result[2]).toString(16).padStart(2, '0');

    //             return `#${r}${g}${b}`;
    //         }

    //         return `rgb(${r}, ${g}, ${b})`;
    //     });
    // };

    // /**
    //  * 入力されたHTML文字列の中でネストされた`<span>`タグを平坦化し、すべての`<span>`を同じ階層に配置する
    //  * @param {string} html 処理対象のHTML文字列
    //  * @returns {string} 平坦化されたHTML文字列
    //  */
    // const flattenNestedSpans = (html: string): string => {
    //     const parser = new DOMParser();
    //     const doc = parser.parseFromString(html, 'text/html');

    //     /**
    //      * ノードを再帰処理し、ネストされた`<span>`タグを平坦化して適切なスタイルを適用する
    //      * @param {Node} node 処理対象のDOMノード
    //      * @param {string | null} parentStyle 親要素から引き継がれたスタイル、子要素に適用される
    //      * @returns {Node[]} 平坦化されたノードの配列
    //      */
    //     const processNode = (node: Node, parentStyle: string | null): Node[] => {
    //         const result: Node[] = [];

    //         if (node.nodeType === Node.TEXT_NODE) {
    //             const span = document.createElement('span');

    //             if (parentStyle) {
    //                 // spanタグ内のテキストノードを親要素のスタイルで挟む
    //                 span.setAttribute('style', parentStyle);
    //             } else {
    //                 // テキストのみでspanに挟まれていないものはデフォルト値の白色
    //                 span.setAttribute('style', 'color: #ffffff;');
    //             }

    //             span.textContent = node.textContent;
    //             result.push(span);
    //         } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SPAN') {
    //             const element = node as HTMLElement;
    //             const style = element.getAttribute('style') || null;

    //             // 子ノード再帰処理
    //             element.childNodes.forEach((child) => {
    //                 result.push(...processNode(child, style));
    //             });
    //         } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR') {
    //             // <br>はそのまま残す
    //             const element = node as HTMLElement;
    //             result.push(element.cloneNode());
    //         }

    //         return result;
    //     };

    //     const outputNodes: Node[] = [];
    //     doc.body.childNodes.forEach((child) => {
    //         outputNodes.push(...processNode(child, null));
    //     });

    //     // 処理されたノードをHTML文字列にシリアライズ
    //     return outputNodes
    //         .map(
    //             (node) => (node instanceof Element ? node.outerHTML : node.textContent), // 予期せぬ非要素ノードに対するフォールバック
    //         )
    //         .join('');
    // };

    onMount(async () => {
        const Quill = (await import('quill')).default;
        const Delta = Quill.import('delta');

        const quill = new Quill('#editor', {
            theme: 'bubble',
            modules: {
                toolbar: [[{ 'color': ['#ffffff', '#323232', '#ff435d', '#56ff56', '#57ffff', '#ffff50', '#fea461', '#ff84ff', '#4c49ef'] }]],
            },
        });

        if (deltaString) {
            const passedDelta = new Delta(JSON.parse(deltaString));
            quill.setContents(passedDelta);
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
            let delta = adjustLineBreakOps(quill.getContents().ops) as { insert: string; attributes?: { color: string } }[];
            editorType === 'event_name' && (isValidPreviewTitle = encodeToShiftJIS(quill.getText()).slice(0, -1).length <= 32); // 32バイト以下のみ許可

            /^\n*$/.test(delta.slice(-1)[0].insert) && (delta = delta.slice(0, -1)); // 最後の要素に改行のみ含まれていたら削除

            deltaString = JSON.stringify(delta, null, 2);
        });

        isEditorStarted = true;

        /* タイトル編集時エンターキー禁止
        ========================================================= */
        editorContainer = document.getElementsByClassName('ql-editor')[0] as HTMLDivElement;
        if (editorContainer && editorType === 'event_name') {
            editorContainer.addEventListener('keydown', (e) => preventEnterKeyInEditor(editorContainer, e));
        }
    });

    onDestroy(() => {
        if (editorContainer && editorType === 'event_name') {
            editorContainer.removeEventListener('keydown', (e) => preventEnterKeyInEditor(editorContainer, e));
        }
    });
</script>

{#if checkModalType('distributionEditor', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.dist_id);
                    const contents = data[editorType];
                    // const contents = convertColorString('colorNum', input, editorType);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            updateAllDistributionData(id, editorType, contents); // allDistributionDataストアを更新
                            $distributionPagerInstance.updatePagerDistribution(id, editorType, contents); // pager更新データ動的反映
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="dist_id" value={$modalData.distId} />
                <!--
                <input
                    type="hidden"
                    name={`${editorType}`}
                    value={submitHtml
                        .replace(/&amp;/g, '&') // & 変換
                        .replace(/&lt;/g, '<') // < 変換
                        .replace(/&gt;/g, '>') // > 変換
                        .replace(/&nbsp;/g, ' ')}
                />
                -->
                <input type="hidden" name={`${editorType}`} value={submitHtml} />

                <div class="modal_header">
                    <h1>{($modalData as DistEditorData).type === 0 ? 'Title' : 'Description'} Editor</h1>
                </div>

                <div class={`modal_body ${editorType}_editor`}>
                    <img class={`${editorType}_bg`} src={`/img/common/${editorType}_draft.png`} alt={`${editorType}_bg`} />
                    <div id="editor"></div>
                </div>

                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="green_btn"
                        class:disabled_elm={!isEditorStarted || !isValidPreviewTitle}
                        disabled={!isValidPreviewTitle}
                        type={$modalData.distId === 0 && !$modalData.showCharacterId ? 'button' : 'submit'}
                        formaction="?/updateDistribution"
                        onclick={() => {
                            if ($modalData.distId === 0 && !$modalData.showCharacterId) {
                                // const processedHtml = submitHtml
                                //     .replace(/&amp;/g, '&') // & 変換
                                //     .replace(/&lt;/g, '<') // < 変換
                                //     .replace(/&gt;/g, '>') // > 変換
                                //     .replace(/&nbsp;/g, ' '); // 空白変換
                                // editorType === 'event_name' ? ($createDistDataTitle = processedHtml) : ($createDistDataDesc = processedHtml);

                                // 配布物新規作成の場合
                                editorType === 'event_name' ? ($createDistDataTitle = submitHtml) : ($createDistDataDesc = submitHtml);
                                closeModal();
                            } else {
                                // 配布物編集の場合
                                onSubmit.set(true);
                                $timeOut && closeMsgDisplay($timeOut);
                            }
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">{!isValidPreviewTitle ? 'close' : 'check'}</span>
                        <span class="btn_text">{!isValidPreviewTitle ? 'Invalid Title' : 'Save'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.bubble.css" rel="stylesheet" />
</svelte:head>
