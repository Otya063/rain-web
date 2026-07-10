<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, conv2DArrayToObject, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';

    let permanent: boolean = $state(false);
</script>

{#if checkModalType('deleteCharacter', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/{$modalData.type === 0 ? 'deleteCharacter' : 'restoreCharacter'}"
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const char_id = Number(data.char_id);
                    const type = Number(data.type) as 0 | 1;
                    const onSuccess = checkModalType('deleteCharacter', $modalData) ? $modalData.onSuccess : undefined;

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            onSuccess?.(char_id, type, permanent);
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="char_id" value={$modalData.charId} />
                <input type="hidden" name="char_name" value={$modalData.charName} />
                <input type="hidden" name="type" value={$modalData.type} />

                <div class="modal_header">
                    <h1>Delete / Restore Character</h1>
                </div>
                <div class="modal_body">
                    <p>The following character will be {$modalData.type === 0 ? 'deleted' : 'restored'}:</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>ID</p>
                            <span>{$modalData.charId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Name</p>
                            <span>{$modalData.charName}</span>
                        </li>

                        {#if $modalData.type === 0}
                            <li class="modal_list_item">
                                <label>
                                    <p>Permanently Delete</p>
                                    <span class="material-symbols-outlined" style="font-size: 2.1rem;">{permanent ? 'check_box' : 'check_box_outline_blank'}</span>
                                    <input type="checkbox" name="permanently_del" bind:checked={permanent} />
                                </label>
                            </li>
                        {/if}
                    </ul>

                    {#if $modalData.type === 0}
                        <p class="modal_note">* If the character to be deleted is linked to a discord account, the account will be unlinked.</p>
                        <p class="modal_note">* If "Permanently Delete" is checked, all character data will be completely deleted from the database and can't be restored.</p>
                    {/if}
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class={$modalData.type === 0 ? 'red_btn' : 'green_btn'}
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">{$modalData.type === 0 ? 'Delete' : 'Restore'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
