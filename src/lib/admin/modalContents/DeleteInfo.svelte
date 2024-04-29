<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allInformation, onSubmit, closeModal, deleteInfoData, msgClosed, conv2DArrayToObject, timeOut, closeMsgDisplay } from '$lib/utils';
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
            <input type="hidden" name="info_id" value={$deleteInfoData.info_id} />
            <div class="modal_header">
                <h1>Delete Information Data</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteInfoData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Information Title</p>
                        <span>{$deleteInfoData.info_title}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Information URL</p>
                        <span>{$deleteInfoData.info_url}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Created At</p>
                        <span>{$deleteInfoData.info_created_at}</span>
                    </li>

                    <li class="modal_list_item">
                        <input type="hidden" name="info_type" value={$deleteInfoData.info_type} />
                        <p>Information Type</p>
                        <span>{$deleteInfoData.info_type}</span>
                    </li>
                </ul>
            </div>
            <div class="btn_group">
                <button
                    class="blue_btn"
                    type="submit"
                    formaction="?/{$deleteInfoData.form_action}"
                    on:click={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                >
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Yes</span>
                </button>
                <button class="red_btn" type="button" on:click={() => closeModal()}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">No</span>
                </button>
            </div>
        </form>
    </div>
</div>
