<script lang="ts">
    import type { suspended_account } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, suspendUserData, conv2DArrayToObject, msgClosed, paginatedUsersData, timeOut, closeMsgDisplay, userCtrlPanel } from '$lib/utils';
    import { DateTime } from 'luxon';

    export let suspendedAccount: suspended_account;
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
                                <span id="permanent" class="material-icons-outlined" style="font-size: 2.1rem;">check_box_outline_blank</span>
                                <input type="checkbox" name="permanently_del" on:change={() => onChangeInputElm()} bind:checked={permanent} />
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
                                    .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </li>
                    {/if}
                </ul>

                {#if $suspendUserData.form_action === 'suspendUser'}
                    <p class="modal_note">* Empty isn't allowed for "Reason" and "Suspention Period (when "Permanently Suspend" is unchecked)."</p>
                    <p class="modal_note">
                        * If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from our database and can't be restored. Otherwise, they can
                        be restored.
                    </p>
                    <p class="modal_note">* "Suspention Period" is automatically converted to UTC.</p>
                {/if}
            </div>
            <div class="btn_group">
                <button
                    class="blue_btn"
                    formaction="?/{$suspendUserData.form_action}"
                    type="submit"
                    on:click={() => {
                        onSubmit.set(true);
                        $timeOut && closeMsgDisplay($timeOut);
                    }}
                >
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
