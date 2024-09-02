<script lang="ts">
    import { onSubmit, closeModal, msgClosed, timeOut, closeMsgDisplay, downloadBinaryData, downloadUserBinary } from '$lib/utils';
</script>

<div class="modal">
    <div class="modal_content">
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

                    await downloadUserBinary(String($downloadBinaryData.char_id), $downloadBinaryData.char_name || 'unknown');
                    msgClosed.set(false);
                    onSubmit.set(false);
                    closeModal();
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
    </div>
</div>
