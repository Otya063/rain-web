<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, conv2DArrayToObject, msgClosed, paginatedUsersData, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';

    let permanent: boolean = $state(false);
</script>

{#if checkModalType('deleteCharacter', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const char_id = Number(data.char_id);
                    const type = String(data.type);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $paginatedUsersData = $paginatedUsersData.map((user) => {
                                // キャラクター削除
                                type === 'deleteCharacter' && permanent && (user.characters = user.characters.filter((character) => character.id !== char_id));

                                // deletedカラム更新
                                user.characters = user.characters.map((character) => {
                                    if (character.id === char_id)
                                        return {
                                            ...character,
                                            deleted: type === 'deleteCharacter',
                                        };

                                    return character;
                                });

                                return user;
                            });
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
                            <p>Character ID</p>
                            <span>{$modalData.charId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$modalData.charName}</span>
                        </li>

                        {#if $modalData.type === 0}
                            <li class="modal_list_item">
                                <label>
                                    <p>Permanently Delete</p>
                                    <span id="permanent" class="material-symbols-outlined" style="font-size: 2.1rem;">check_box_outline_blank</span>
                                    <input
                                        type="checkbox"
                                        name="permanently_del"
                                        onchange={() => {
                                            document.getElementById('permanent')!.textContent =
                                                document.getElementById('permanent')?.textContent === 'check_box_outline_blank' ? 'check_box' : 'check_box_outline_blank';
                                        }}
                                        bind:checked={permanent}
                                    />
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
                        formaction="?/{$modalData.type === 0 ? 'deleteCharacter' : 'restoreCharacter'}"
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
