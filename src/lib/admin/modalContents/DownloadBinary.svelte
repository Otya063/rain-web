<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, msgClosed, timeOut, closeMsgDisplay, downloadBinaryData, conv2DArrayToObject } from '$lib/utils';

    export let downloadLink: string;
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={({ formData }) => {
                const data = conv2DArrayToObject([...formData.entries()]);
                
                return async ({ result }) => {
                    msgClosed.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        const a = document.createElement('a');
                        a.href = downloadLink;
                        a.download = `${data.character_name}_binary.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                        // ダウンロード後、オブジェクトURLをリリース
                        URL.revokeObjectURL(downloadLink);
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="character_name" value={$downloadBinaryData.char_name} />
            <input type="hidden" name="character_id" value={$downloadBinaryData.char_id} />
            <input type="hidden" name="download_binary" />

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
                    formaction="?/{$downloadBinaryData.form_action}"
                    type="submit"
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
