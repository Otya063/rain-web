<script lang="ts">
    import { clicked_submit, cancelModal, linkDiscord, linkDiscordData } from '$ts/main';
    import _ from 'lodash';
</script>

{#if $linkDiscord}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="user_id" value={$linkDiscordData.user_id} />
                <input type="hidden" name="char_id" value={$linkDiscordData.char_id} />
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
                            * If Discord ID you entered is already linked to another character or account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to
                            the target character and account.
                        </p>
                    {:else if $linkDiscordData.form_action === 'unlinkDiscord'}
                        <p class="modal_note">
                            * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character or account,
                            please execute the process from the "Link" button.
                        </p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$linkDiscordData.form_action}" type="submit" on:click={() => clicked_submit.set(true)}>
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
