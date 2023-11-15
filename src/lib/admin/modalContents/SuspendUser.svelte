<script lang="ts">
    import _ from 'lodash';
    import { clicked_submit, modalTitle, modalFormAction, cancelModal, suspendUser, suspendUid, suspendUsername } from '$ts/main';

    export let data;
    const characterData = data.charactersWithoutBytes;
</script>

{#if $suspendUser}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <div class="modal_header">
                    <h1>Suspend / Unsuspend User Account</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>User ID</p>
                            <span>{$suspendUid}</span>
                            <input type="hidden" name="user_id" value={$suspendUid} />
                        </li>

                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$suspendUsername}</span>
                            <input type="hidden" name="username" value={$suspendUsername} />
                        </li>

                        <li class="modal_list_item">
                            <p>Owned Character Name</p>
                            <span>
                                {#each _.sortBy( _.filter(characterData, (c_data) => c_data.user_id === $suspendUid), 'id' ) as character, i}
                                    <input type="hidden" name="character_id" value={character.id} />
                                    ({i + 1}){`${character.name}　`}
                                {/each}
                            </span>
                        </li>

                        {#if $modalFormAction === 'suspendUser'}
                            <li class="modal_list_item">
                                <p>Reason</p>
                                <select name="reason" required>
                                    <option selected disabled>Select the Reason for Account Suspension</option>
                                    <option value="Cheating">Cheating</option>
                                    <option value="Gameplay Exploit">Gameplay Exploit</option>
                                    <option value="Toxic and Abusive Behavior">Toxic and Abusive Behavior</option>
                                    <option value="Violation of Server Terms of Service">Violation of Server Terms of Service</option>
                                </select>
                            </li>

                            <li class="modal_list_item">
                                <p>Permanently Suspend</p>
                                <input type="checkbox" name="permanently_del" />
                            </li>
                        {/if}
                    </ul>

                    {#if $modalFormAction === 'suspendUser'}
                        <p class="modal_note">
                            * Once a user account is suspended, all characters owned by that account are considered as deleted. But its data isn't deleted from database and can be restored via
                            "Unsuspend" button.
                        </p>
                        <p class="modal_note">
                            * If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from the database and can't be restored.
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
