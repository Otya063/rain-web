<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { allBanners, onSubmit, closeModal, deleteBnrData, conv2DArrayToObject, msgClosed, timeOut, closeMsgDisplay } from '$lib/utils';
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
            <input type="hidden" name="bnr_id" value={$deleteBnrData.bnr_id} />
            <input type="hidden" name="bnr_name" value={$deleteBnrData.bnr_name} />
            <div class="modal_header">
                <h1>Delete Banner Data</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteBnrData.title}</p>
                <ul class="modal_list">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <li class="modal_list_item" style="cursor: pointer;" on:click={() => window.open($deleteBnrData.bnr_url, '_blank')}>
                        <p>Bnr Preview<span class="material-symbols-outlined">open_in_new</span></p>
                        <img src={$deleteBnrData.bnr_url} alt={$deleteBnrData.bnr_name} />
                    </li>

                    <li class="modal_list_item">
                        <p>Bnr Name</p>
                        <span>{$deleteBnrData.bnr_name}</span>
                    </li>
                </ul>
            </div>
            <div class="btn_group">
                <button
                    class="blue_btn"
                    type="submit"
                    formaction="?/{$deleteBnrData.form_action}"
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
