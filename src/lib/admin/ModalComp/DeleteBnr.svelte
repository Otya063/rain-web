<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allBanners, onSubmit, closeModal, modalData, conv2DArrayToObject, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteBnr', $modalData)}
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
                <input type="hidden" name="bnr_id" value={$modalData.bnrId} />
                <input type="hidden" name="bnr_name" value={$modalData.bnrName} />
                <div class="modal_header">
                    <h1>Delete Banner Data</h1>
                </div>
                <div class="modal_body">
                    <p>The following banner will be deleted:</p>
                    <ul class="modal_list">
                        <button class="modal_list_item" type="button" onclick={() => window.open($modalData.bnrUrl, '_blank')}>
                            <p>Preview<span class="material-symbols-outlined">open_in_new</span></p>
                            <img src={$modalData.bnrUrl} alt={$modalData.bnrName} />
                        </button>

                        <li class="modal_list_item">
                            <p>Name</p>
                            <span>{$modalData.bnrName}</span>
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
                        formaction="?/deleteBnrData"
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
