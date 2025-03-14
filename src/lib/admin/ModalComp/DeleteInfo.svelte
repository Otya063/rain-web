<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allInformationData, onSubmit, closeModal, modalData, msgClosed, conv2DArrayToObject, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteInfo', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.info_id);
                    const type = String(data.info_type);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $allInformationData[type] = $allInformationData[type].filter((info) => info.id !== id);
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="info_id" value={$modalData.infoId} />
                <div class="modal_header">
                    <h1>Delete Information Data</h1>
                </div>

                <div class="modal_body">
                    <p>The following information will be deleted:</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Title</p>
                            <span>{$modalData.infoTitle}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Hyperlink</p>
                            <span>{$modalData.infoUrl || 'None'}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Created At</p>
                            <span>{$modalData.createdAt}</span>
                        </li>

                        <li class="modal_list_item">
                            <input type="hidden" name="info_type" value={$modalData.infoType} />
                            <p>Type</p>
                            <span>{$modalData.infoType}</span>
                        </li>
                    </ul>
                </div>

                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        type="submit"
                        formaction="?/deleteInfoData"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Delete</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
