<script lang="ts">
    import { clicked_submit, cancelModal, suspendUser, suspendUserData } from '$ts/main';
    import _ from 'lodash';

    let permanent: boolean;
</script>

{#if $suspendUser}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <div class="modal_header">
                    <h1>Suspend / Unsuspend User Account</h1>
                </div>
                <div class="modal_body">
                    <p>{$suspendUserData.title}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>User ID</p>
                            <span>{$suspendUserData.user_id}</span>
                            <input type="hidden" name="user_id" value={$suspendUserData.user_id} />
                        </li>

                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$suspendUserData.username}</span>
                            <input type="hidden" name="username" value={$suspendUserData.username} />
                        </li>

                        <li class="modal_list_item">
                            <p>Owned Character Name</p>
                            <span>
                                {#each $suspendUserData.char_name as name, i}
                                    ({i + 1}){`${name}　`}
                                {/each}
                            </span>
                        </li>

                        {#if $suspendUserData.form_action === 'suspendUser'}
                            <li class="modal_list_item">
                                <p>Reason</p>
                                <select name="reason_type" required>
                                    <option selected disabled>Select the Reason for Account Suspension</option>
                                    <option value="1">Cheating</option>
                                    <option value="2">Gameplay Exploit</option>
                                    <option value="3">Toxic and Abusive Behavior</option>
                                    <option value="4">Violation of Server Terms of Service</option>
                                </select>
                            </li>

                            <li class="modal_list_item">
                                <p>Permanently Suspend</p>
                                <input type="checkbox" name="permanently_del" bind:checked={permanent} />
                            </li>

                            <li class="modal_list_item">
                                <p>Suspention Period (until at)</p>
                                <input type="datetime-local" name="until_at" class:disabled_elm={permanent} />
                            </li>
                        {/if}
                    </ul>

                    {#if $suspendUserData.form_action === 'suspendUser'}
                        <p class="modal_note">
                            * Once a user account is suspended, all characters owned by that account are considered as deleted. But its data isn't deleted from database and can be restored via
                            "Unsuspend" button.
                        </p>
                        <p class="modal_note">
                            * If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from the database and can't be restored.
                        </p>
                        <p class="modal_note">* "Suspention Period" is automatically converted to UTC.</p>
                    {/if}
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$suspendUserData.form_action}" type="submit" on:click={() => clicked_submit.set(true)}>
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
