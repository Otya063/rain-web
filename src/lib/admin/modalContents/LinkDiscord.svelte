<script lang="ts">
    import _ from 'lodash';
    import { clicked_submit, modalTitle, modalFormAction, cancelModal, linkDiscord, linkUId, linkUsername, linkCId, linkCName, linkDiscordId } from '$ts/main';
</script>

{#if $linkDiscord}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="user_id" value={$linkUId} />
                <input type="hidden" name="char_id" value={$linkCId} />
                <div class="modal_header">
                    <h1>Link / Unlink Discord</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$linkUsername}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character ID</p>
                            <span>{$linkCId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Character Name</p>
                            <span>{$linkCName}</span>
                        </li>

                        {#if $modalFormAction === 'linkDiscord'}
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <input type="text" name="discord_id" />
                            </li>
                        {:else if $modalFormAction === 'unlinkDiscord'}
                            <input type="hidden" name="discord_id" value={$linkDiscordId} />
                            <li class="modal_list_item">
                                <p>Discord ID</p>
                                <span>{$linkDiscordId}</span>
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'linkDiscord'}
                        <p class="modal_note">
                            * If Discord ID you entered is already linked to another character or account, the internal data (bounty coins, bounty progress, etc.) will be transferred and re-linked to
                            the target character or account.
                        </p>
                    {:else if $modalFormAction === 'unlinkDiscord'}
                        <p class="modal_note">
                            * Once the account is unlinked, all internal data (bounty coins, bounty progress, etc.) will be deleted completely. If you want to re-link another character or account,
                            please execute the process from the "Link" button.
                        </p>
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
