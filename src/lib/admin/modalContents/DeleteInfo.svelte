<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allInformation, onSubmit, closeModal, deleteInfoData, msgClosed, conv2DArrayToObject, timeOut, closeMsgDisplay } from '$utils/client';
</script>

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
                        $allInformation[type] = $allInformation[type].filter((info) => info.id !== id);
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="info_id" value={$deleteInfoData.infoId} />
            <div class="modal_header">
                <h1>Delete Information Data</h1>
            </div>
            
            <div class="modal_body">
                <p>{$deleteInfoData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Title</p>
                        <span>{$deleteInfoData.infoTitle}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Hyperlink</p>
                        <span>{$deleteInfoData.infoUrl || 'None'}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Created At</p>
                        <span>{$deleteInfoData.createdAt}</span>
                    </li>

                    <li class="modal_list_item">
                        <input type="hidden" name="info_type" value={$deleteInfoData.infoType} />
                        <p>Type</p>
                        <span>{$deleteInfoData.infoType}</span>
                    </li>
                </ul>
            </div>

            <div class="btn_group">
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>

                <button
                    class="blue_btn"
                    type="submit"
                    formaction="?/{$deleteInfoData.formAction}"
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
