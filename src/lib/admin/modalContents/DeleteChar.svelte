<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, deleteCharacterData, conv2DArrayToObject, msgClosed, paginatedUsersData } from '$lib/utils';

    let permanent: boolean;
    
    const onChangeInputElm = () => {
        document.getElementById('permanent')!.textContent = document.getElementById('permanent')?.textContent === 'check_box_outline_blank' ? 'check_box' : 'check_box_outline_blank';
    };
</script>

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
                            // delete character
                            type === 'deleteCharacter' && permanent && (user.characters = user.characters.filter((character) => character.id !== char_id));

                            // update deleted
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
            <input type="hidden" name="char_id" value={$deleteCharacterData.char_id} />
            <input type="hidden" name="char_name" value={$deleteCharacterData.char_name} />
            <input type="hidden" name="type" value={$deleteCharacterData.form_action} />

            <div class="modal_header">
                <h1>Delete / Restore Character</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteCharacterData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Character ID</p>
                        <span>{$deleteCharacterData.char_id}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Character Name</p>
                        <span>{$deleteCharacterData.char_name}</span>
                    </li>

                    {#if $deleteCharacterData.form_action === 'deleteCharacter'}
                        <li class="modal_list_item">
                            <label>
                                <p>Permanently Delete</p>
                                <span id="permanent" class="material-icons-outlined" style="font-size: 2.1rem;">check_box_outline_blank</span>
                                <input type="checkbox" name="permanently_del" on:change={() => onChangeInputElm()} bind:checked={permanent} />
                            </label>
                        </li>
                    {/if}
                </ul>

                {#if $deleteCharacterData.form_action === 'deleteCharacter'}
                    <p class="modal_note">* If the character to be deleted is linked to a discord account, the account linkage will be purged.</p>
                    <p class="modal_note">* If "Permanently Delete" is checked, all character data will be completely deleted from the database and can't be restored.</p>
                {/if}
            </div>
            <div class="btn_group">
                <button class="blue_btn" formaction="?/{$deleteCharacterData.form_action}" type="submit" on:click={() => onSubmit.set(true)}>
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
