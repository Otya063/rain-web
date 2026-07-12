<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { applyAction, enhance } from '$app/forms';
    import type { DistributionEditorData } from '$types';
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
        distributionPagerInstance,
        preventEnterKeyInEditor,
        encodeToShiftJIS,
    } from '$utils/client';

    const editorType = ($modalData as DistributionEditorData).type === 0 ? 'event_name' : 'description';
    let deltaString = $state(convertColorString('delta', ($modalData as DistributionEditorData).contents));
    let submitHtml = $derived(convertColorString('colorNum', deltaString, editorType));
    let isEditorStarted = $state(false);
    let editorContainer: HTMLDivElement;
    let isValidPreviewTitle = $state(true);
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

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
            editorType === 'event_name' && (isValidPreviewTitle = encodeToShiftJIS(quill.getText()).slice(0, -1).length <= 32);

            /^\n*$/.test(delta.slice(-1)[0].insert) && (delta = delta.slice(0, -1));

            deltaString = JSON.stringify(delta, null, 2);
        });

        isEditorStarted = true;

        editorContainer = document.getElementsByClassName('ql-editor')[0] as HTMLDivElement;
        if (editorContainer && editorType === 'event_name') {
            keydownHandler = (e) => preventEnterKeyInEditor(editorContainer, e);
            editorContainer.addEventListener('keydown', keydownHandler);
        }
    });

    onDestroy(() => {
        if (editorContainer && editorType === 'event_name' && keydownHandler) {
            editorContainer.removeEventListener('keydown', keydownHandler);
            keydownHandler = null;
        }
    });
</script>

{#if checkModalType('distributionEditor', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/updateDistribution"
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.dist_id);
                    const contents = data[editorType];

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $distributionPagerInstance.updatePagerDistribution(id, editorType, contents);
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="dist_id" value={$modalData.distId} />
                <input type="hidden" name={editorType} value={submitHtml} />

                <div class="modal_header">
                    <h1>{editorType === 'event_name' ? 'Title' : 'Description'} Editor</h1>
                </div>

                <div class={`modal_body ${editorType}_editor`}>
                    <img class={`${editorType}_bg`} src={`/img/common/${editorType}_draft.png`} alt={`${editorType}_bg`} />
                    <div id="editor"></div>
                </div>

                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={closeModal}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="green_btn"
                        class:disabled_elm={!isEditorStarted || !isValidPreviewTitle}
                        disabled={!isEditorStarted || !isValidPreviewTitle}
                        type={$modalData.distId === 0 && !$modalData.showCharacterId ? 'button' : 'submit'}
                        onclick={() => {
                            if ($modalData.distId === 0 && !$modalData.showCharacterId) {
                                editorType === 'event_name' ? ($createDistDataTitle = submitHtml) : ($createDistDataDesc = submitHtml);
                                closeModal();
                            } else {
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
