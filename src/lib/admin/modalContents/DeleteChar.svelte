<script lang="ts">
    import _ from 'lodash';
    import { clicked_submit, modalTitle, modalFormAction, cancelModal, deleteChar, deleteCharId, deleteCharName } from '$ts/main';
</script>

{#if $deleteChar}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="char_id" value={$deleteCharId} />
                <input type="hidden" name="char_name" value={$deleteCharName} />
                <div class="modal_header">
                    <h1>Delete / Restore Character</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Character ID</p>
                            <span>{$deleteCharId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$deleteCharName}</span>
                        </li>

                        {#if $modalFormAction === 'deleteCharacter'}
                            <li class="modal_list_item">
                                <p>Permanently Delete</p>
                                <input type="checkbox" name="permanently_del" />
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'deleteCharacter'}
                        <p class="modal_note">* If "Permanently Delete" is checked, all character data will be completely deleted from the database and can't be restored.</p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => clicked_submit.set(true)}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
