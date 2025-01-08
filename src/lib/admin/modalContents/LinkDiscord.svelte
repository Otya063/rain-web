<script lang="ts">
    import type { discord } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, linkDiscordData, conv2DArrayToObject, msgClosed, paginatedUsersData, updateUserCtrlPanel, timeOut, closeMsgDisplay } from '$utils/client';

    interface Props {
        newDiscord: discord;
    }
    let { newDiscord }: Props = $props();
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
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        updateUserCtrlPanel(userId, charId, 'link', newDiscord);

                        $paginatedUsersData = $paginatedUsersData.map((user) => {
                            // 同じdiscordデータを削除
                            type === 'linkDiscord' &&
                                (user.characters = user.characters.map((character) => ({
                                    ...character,
                                    discord: character.discord && character.discord.discord_id === discord_id ? null : character.discord,
                                })));

                            // udiscordデータ更新
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
            <input type="hidden" name="user_id" value={$linkDiscordData.userId} />
            <input type="hidden" name="char_id" value={$linkDiscordData.charId} />
            <input type="hidden" name="type" value={$linkDiscordData.formAction} />

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
                        <span>{$linkDiscordData.charId}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Character Name</p>
                        <span>{$linkDiscordData.charName || 'Ready to Hunt'}</span>
                    </li>

                    {#if $linkDiscordData.formAction === 'linkDiscord'}
                        <li class="modal_list_item">
                            <p>Discord ID</p>
                            <input type="text" name="discord_id" />
                        </li>
                    {:else if $linkDiscordData.formAction === 'unlinkDiscord'}
                        <input type="hidden" name="discord_id" value={$linkDiscordData.discordId} />
                        <li class="modal_list_item">
                            <p>Discord ID</p>
                            <span>{$linkDiscordData.discordId}</span>
                        </li>
                    {/if}
                </ul>

                {#if $linkDiscordData.formAction === 'linkDiscord'}
                    <p class="modal_note">
                        * If discord ID you entered is already linked to another character and account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to the
                        target character and account.
                    </p>
                    <p class="modal_note">* To switch/re-link character within a linked user account, the same discord ID must be entered.</p>
                    <p class="modal_note">* Empty isn't allowed for "Discord ID."</p>
                {:else if $linkDiscordData.formAction === 'unlinkDiscord'}
                    <p class="modal_note">
                        * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character and account, please
                        execute the process from the "Link" button.
                    </p>
                {/if}
            </div>
            <div class="btn_group">
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>

                <button
                    class="blue_btn"
                    formaction="?/{$linkDiscordData.formAction}"
                    type="submit"
                    onclick={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">{$linkDiscordData.formAction === 'linkDiscord' ? 'Link' : 'Unlink'}</span>
                </button>
            </div>
        </form>
    </div>
</div>
