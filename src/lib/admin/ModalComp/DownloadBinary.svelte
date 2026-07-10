<script lang="ts">
    import { tick } from 'svelte';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, msgClosed, timeOut, closeMsgDisplay, modalData, downloadUserBinary, checkModalType } from '$utils/client';

    let result: string = $state('E');
    let errorMessage: string = $state('');
</script>

{#if checkModalType('downloadBinary', $modalData)}
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
                <input type="hidden" name="result" bind:value={result} />
                <input type="hidden" name="error_message" bind:value={errorMessage} />

                <div class="modal_header">
                    <h1>Download Binary</h1>
                </div>
                <div class="modal_body">
                    <p style="padding-bottom: 3%;">{`The binary data of the character "${$modalData.charName}" will be downloaded.`}</p>

                    <p class="modal_note">* The binary data to be downloaded is output in zip format.</p>
                    <p class="modal_note">* The total number of data is 14, but if the data size is "0" (doesn't exist in the database), it won't be included in the zip file.</p>
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="green_btn"
                        type="button"
                        onclick={async () => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);

                            const downloadResult = await downloadUserBinary(String($modalData.charId), $modalData.charName);
                            result = downloadResult.success ? 'S' : 'E';
                            errorMessage = downloadResult.success ? '' : downloadResult.message;

                            const form = document.querySelector<HTMLFormElement>('form[name="download"]');
                            if (form) {
                                await tick(); // result の DOM 反映を待ってから送信
                                form.requestSubmit();
                            }
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Download</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
