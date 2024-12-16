<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, deleteDistributionData, conv2DArrayToObject, msgClosed, timeOut, closeMsgDisplay, getDistributionTypeName } from '$utils/client';
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={({ formData }) => {
                const data = conv2DArrayToObject([...formData.entries()]);
                const id = Number(data.dist_id);

                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        // TODO: 削除後のリアルタイムレンダリング処理
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="dist_id" value={$deleteDistributionData.dist_id} />
            <div class="modal_header">
                <h1>Delete Distribution Data</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteDistributionData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Distribution Title</p>
                        <span>{$deleteDistributionData.dist_title}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Distribution Type</p>
                        <span>{getDistributionTypeName($deleteDistributionData.dist_type)}</span>
                    </li>
                </ul>
            </div>
            <div class="btn_group">
                <button
                    class="blue_btn"
                    type="submit"
                    formaction="?/{$deleteDistributionData.form_action}"
                    onclick={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Yes</span>
                </button>
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">No</span>
                </button>
            </div>
        </form>
    </div>
</div>
