<script lang="ts">
    import type { suspended_account } from '@prisma/client/edge';
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, suspendUserData, conv2DArrayToObject, msgClosed, paginatedUsersData, paginationMetaData, timeOut, closeMsgDisplay, userCtrlPanel } from '$lib/utils';

    interface Props {
        suspendedAccount: suspended_account;
    }
    let { suspendedAccount }: Props = $props();
    let permanent: boolean = $state(false);
    let stage = $state($suspendUserData.form_action === 'unsuspendUser' ? 2 : 1);
    let actionType = $state('suspend');
</script>

<div class="modal">
    <div class="modal_content">
        {#if stage === 1}
            <div class="modal_header">
                <h1>Select Your Action to Perform</h1>
            </div>

            <div class="modal_body">
                <ul class="modal_list" style="width: 90%; justify-content: center; justify-items: center;">
                    <li class="modal_list_item">
                        <label style="display: flex; justify-content: center; width: fit-content;">
                            <span class="material-symbols-outlined" style="margin-right: 7px;">{actionType === 'suspend' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                            <input type="radio" checked={actionType === 'suspend'} onchange={() => (actionType = 'suspend')} />
                            Suspend
                        </label>
                    </li>

                    <li class="modal_list_item">
                        <label style="display: flex; justify-content: center; width: fit-content;">
                            <span class="material-symbols-outlined" style="margin-right: 7px;">{actionType !== 'suspend' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                            <input type="radio" checked={actionType !== 'suspend'} onchange={() => (actionType = 'delete')} />
                            Delete
                        </label>
                    </li>
                </ul>
            </div>

            <div class="btn_group">
                <button
                    class="blue_btn"
                    type="button"
                    onclick={() => {
                        if (actionType === 'suspend') {
                            $suspendUserData.title = 'Suspend the following user?';
                            $suspendUserData.form_action = 'suspendUser';
                        } else {
                            $suspendUserData.title = 'Delete the following user?';
                            $suspendUserData.form_action = 'deleteUser';
                        }

                        stage = 2;
                    }}
                >
                    <span class="btn_icon material-symbols-outlined">check</span>
                    <span class="btn_text">Confirm</span>
                </button>
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>
            </div>
        {:else if stage === 2 && actionType === 'suspend'}
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.user_id);
                    const type = String(data.type);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $userCtrlPanel[id].icon = 'description';

                            $paginatedUsersData = $paginatedUsersData.map((user) => {
                                if (user.id === id) {
                                    return {
                                        ...user,
                                        characters: permanent
                                            ? []
                                            : type === 'suspendUser'
                                              ? user.characters.map((character) => ({
                                                    ...character,
                                                    deleted: true,
                                                }))
                                              : user.characters.map((character) => ({
                                                    ...character,
                                                    deleted: false,
                                                })),
                                        suspended_account: type === 'suspendUser' ? suspendedAccount : null,
                                    };
                                }

                                return user;
                            });
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="type" value={$suspendUserData.form_action} />
                <input type="hidden" name="zoneName" value={DateTime.local().zoneName} />

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
                                    <option selected disabled>Select the Reason</option>
                                    <option value="1">Cheating</option>
                                    <option value="2">Gameplay Exploit</option>
                                    <option value="3">Toxic and Abusive Behavior</option>
                                    <option value="4">Violation of Server Terms of Service</option>
                                </select>
                            </li>

                            <li class="modal_list_item">
                                <label>
                                    <p>Permanently Suspend</p>
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

                            <li class="modal_list_item" class:disabled_elm={permanent}>
                                <label>
                                    <p>Suspention Period (until at)</p>
                                    <input type="datetime-local" name="until_at" />
                                </label>
                            </li>
                        {:else}
                            <li class="modal_list_item">
                                <p>Suspention Period (until at)</p>
                                <span>
                                    {DateTime.fromJSDate(!$suspendUserData.until_at ? new Date(0) : $suspendUserData.until_at)
                                        .setZone(DateTime.local().zoneName)
                                        .setLocale('en')
                                        .toLocaleString({
                                            year: 'numeric',
                                            month: 'long',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                </span>
                            </li>
                        {/if}
                    </ul>

                    {#if $suspendUserData.form_action === 'suspendUser'}
                        <p class="modal_note">* Empty isn't allowed for "Reason" and "Suspention Period (when "Permanently Suspend" is unchecked)."</p>
                        <p class="modal_note">
                            * If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from our database and can't be restored. Otherwise, they
                            can be restored.
                        </p>
                        <p class="modal_note">* "Suspention Period" is automatically converted to UTC.</p>
                    {/if}
                </div>
                <div class="btn_group">
                    <button
                        class="blue_btn"
                        formaction="?/{$suspendUserData.form_action}"
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" onclick={() => (stage = 1)}>
                        <span class="btn_icon material-symbols-outlined">arrow_back</span>
                        <span class="btn_text">Back</span>
                    </button>
                </div>
            </form>
        {:else if stage === 2 && actionType === 'delete'}
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.user_id);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $userCtrlPanel[id].icon = 'description';

                            // 検索結果リセット
                            paginatedUsersData.set([]);
                            paginationMetaData.set({
                                hasPrevPage: false,
                                hasNextPage: false,
                                prevCursor: 0,
                                nextCursor: 0,
                            });
                        }

                        closeModal();
                    };
                }}
            >
                <div class="modal_header">
                    <h1>Delete User Account</h1>
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
                    </ul>

                    <p class="modal_note">* Once user data is deleted, all associated data (linked discord data / character data) will be deleted as well.</p>
                    <p class="modal_note">* After a successful process, the search results will be reset.</p>
                </div>
                <div class="btn_group">
                    <button
                        class="blue_btn"
                        formaction="?/{$suspendUserData.form_action}"
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" onclick={() => (stage = 1)}>
                        <span class="btn_icon material-symbols-outlined">arrow_back</span>
                        <span class="btn_text">Back</span>
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
