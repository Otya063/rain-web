<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allBanners, onSubmit, closeModal, deleteBnrData, conv2DArrayToObject, msgClosed, timeOut, closeMsgDisplay } from '$utils/client';
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={({ formData }) => {
                const data = conv2DArrayToObject([...formData.entries()]);
                const id = Number(data.bnr_id);

                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        $allBanners = $allBanners.filter((bnr) => bnr.id !== id);
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="bnr_id" value={$deleteBnrData.bnrId} />
            <input type="hidden" name="bnr_name" value={$deleteBnrData.bnrName} />
            <div class="modal_header">
                <h1>Delete Banner Data</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteBnrData.title}</p>
                <ul class="modal_list">
                    <button class="modal_list_item" type="button" onclick={() => window.open($deleteBnrData.bnrUrl, '_blank')}>
                        <p>Preview<span class="material-symbols-outlined">open_in_new</span></p>
                        <img src={$deleteBnrData.bnrUrl} alt={$deleteBnrData.bnrName} />
                    </button>

                    <li class="modal_list_item">
                        <p>Name</p>
                        <span>{$deleteBnrData.bnrName}</span>
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
                    formaction="?/{$deleteBnrData.formAction}"
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
