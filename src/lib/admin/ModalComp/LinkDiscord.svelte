<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, timeOut, closeMsgDisplay, checkModalType, updatePaginatedUsersData } from '$utils/client';
</script>

{#if checkModalType('linkDiscord', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/{$modalData.type === 0 ? 'linkDiscord' : 'unlinkDiscord'}"
                method="POST"
                use:enhance={({ formData }) => {
                    const userId = Number(formData.get('user_id'));
                    const discord_id = String(formData.get('discord_id'));
                    const type = Number(formData.get('type'));

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            updatePaginatedUsersData(userId, 'link', type === 0 ? discord_id : null);
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="user_id" value={$modalData.userId} />
                <input type="hidden" name="char_id" value={$modalData.charId} />
                <input type="hidden" name="type" value={$modalData.type} />

                <div class="modal_header">
                    <h1>Link / Unlink Account</h1>
                </div>
                <div class="modal_body">
                    <p>The following account & character will be {$modalData.type === 0 ? 'linked' : 'unlinked'}:</p>

                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$modalData.username}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character ID</p>
                            <span>{$modalData.charId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$modalData.charName || 'Ready to Hunt'}</span>
                        </li>

                        {#if $modalData.type === 0}
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <input type="text" name="discord_id" />
                            </li>
                        {:else}
                            <input type="hidden" name="discord_id" value={$modalData.discordId} />
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <span>{$modalData.discordId}</span>
                            </li>
                        {/if}
                    </ul>

                    {#if $modalData.type === 0}
                        <p class="modal_note">
                            * If discord ID you entered is already linked to another character and account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to
                            the target character and account.
                        </p>
                        <p class="modal_note">* To switch/re-link character within a linked user account, the same discord ID must be entered.</p>
                        <p class="modal_note">* "Discord ID" field is required.</p>
                    {:else}
                        <p class="modal_note">
                            * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character and account,
                            please execute the process from the "Link" button.
                        </p>
                    {/if}
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class={$modalData.type === 0 ? 'green_btn' : 'red_btn'}
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">{$modalData.type === 0 ? 'Link' : 'Unlink'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
