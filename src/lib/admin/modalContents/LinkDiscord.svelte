<script lang="ts">
    import type { discord } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, linkDiscordData, conv2DArrayToObject, msgClosed, paginatedUsersData, updateUserCtrlPanel, errDetailMode } from '$lib/utils';

    export let newDiscord: discord;
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={({ formData }) => {
                const data = conv2DArrayToObject([...formData.entries()]);
                const userId = Number(data.user_id);
                const charId = Number(data.char_id);
                const discord_id = data.discord_id;
                const type = String(data.type);

                return async ({ result }) => {
                    msgClosed.set(false);
                    errDetailMode.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        updateUserCtrlPanel(userId, charId, 'link', newDiscord);

                        $paginatedUsersData = $paginatedUsersData.map((user) => {
                            // delete same discord data
                            type === 'linkDiscord' &&
                                (user.characters = user.characters.map((character) => ({
                                    ...character,
                                    discord: character.discord && character.discord.discord_id === discord_id ? null : character.discord,
                                })));

                            // update discord data
                            if (user.id === userId) {
                                user.characters = user.characters.map((character) => {
                                    if (character.id === charId)
                                        return {
                                            ...character,
                                            discord: type === 'linkDiscord' ? newDiscord : null,
                                        };

                                    return character;
                                });
                            }

                            return user;
                        });
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="user_id" value={$linkDiscordData.user_id} />
            <input type="hidden" name="char_id" value={$linkDiscordData.char_id} />
            <input type="hidden" name="type" value={$linkDiscordData.form_action} />

            <div class="modal_header">
                <h1>Link / Unlink Discord</h1>
            </div>
            <div class="modal_body">
                <p>{$linkDiscordData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Username</p>
                        <span>{$linkDiscordData.username}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Character ID</p>
                        <span>{$linkDiscordData.char_id}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Character Name</p>
                        <span>{$linkDiscordData.char_name || 'Ready to Hunt'}</span>
                    </li>

                    {#if $linkDiscordData.form_action === 'linkDiscord'}
                        <li class="modal_list_item">
                            <p>Discord ID</p>
                            <input type="text" name="discord_id" />
                        </li>
                    {:else if $linkDiscordData.form_action === 'unlinkDiscord'}
                        <input type="hidden" name="discord_id" value={$linkDiscordData.discord_id} />
                        <li class="modal_list_item">
                            <p>Discord ID</p>
                            <span>{$linkDiscordData.discord_id}</span>
                        </li>
                    {/if}
                </ul>

                {#if $linkDiscordData.form_action === 'linkDiscord'}
                    <p class="modal_note">
                        * If discord ID you entered is already linked to another character and account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to the
                        target character and account.
                    </p>
                    <p class="modal_note">* To switch/re-link character within a linked user account, the same discord ID must be entered.</p>
                    <p class="modal_note">* Empty isn't allowed for "Discord ID."</p>
                {:else if $linkDiscordData.form_action === 'unlinkDiscord'}
                    <p class="modal_note">
                        * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character and account, please
                        execute the process from the "Link" button.
                    </p>
                {/if}
            </div>
            <div class="btn_group">
                <button class="blue_btn" formaction="?/{$linkDiscordData.form_action}" type="submit" on:click={() => onSubmit.set(true)}>
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
