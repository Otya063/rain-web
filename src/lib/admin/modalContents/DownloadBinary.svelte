<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, msgClosed, timeOut, closeMsgDisplay, downloadBinaryData, downloadUserBinary } from '$lib/utils';

    let success: boolean = false;
    const submitForm = (): void => {
        const form = document.querySelector<HTMLFormElement>('form[name="download"]');
        if (form) {
            form.requestSubmit();
        }
    };
</script>

<div class="modal">
    <div class="modal_content">
        <form
            action="?/downloadBinary"
            name="download"
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="result" value={success} />

            <div class="modal_header">
                <h1>Download Binary</h1>
            </div>
            <div class="modal_body">
                <p style="padding-bottom: 3%;">{$downloadBinaryData.title}</p>

                <p class="modal_note">* The binary data to be downloaded is output in zip format.</p>
                <p class="modal_note">* The total number of data is 14, but if the data size is “0” (doesn't exist in the database), it won't be included in the zip file.</p>
            </div>
            <div class="btn_group">
                <button
                    class="blue_btn"
                    type="button"
                    on:click={async () => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);

                        success = await downloadUserBinary(String($downloadBinaryData.char_id), $downloadBinaryData.char_name || 'unknown');
                        submitForm();
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
