<script lang="ts">
    import type { suspended_account } from '@prisma/client/edge';
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, conv2DArrayToObject, msgClosed, paginatedUsersData, paginationMetaData, timeOut, closeMsgDisplay, userDisplayState, checkModalType } from '$utils/client';

    interface Props {
        suspendedAccount: suspended_account;
    }
    let { suspendedAccount }: Props = $props();
    let permanent = $state(false);
    let selected = $state('999');
</script>

{#if checkModalType('suspendUser', $modalData)}
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
                            $userDisplayState[id].icon = 'description';

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
                <input type="hidden" name="type" value={$modalData.type} />
                <input type="hidden" name="zoneName" value={DateTime.local().zoneName} />

                <div class="modal_header">
                    <h1>Suspend / Unsuspend User Account</h1>
                </div>

                <div class="modal_body">
                    <p>The following user will be {$modalData.type === 0 ? 'suspended' : 'unsuspended'}:</p>

                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>User ID</p>
                            <span>{$modalData.userId}</span>
                            <input type="hidden" name="user_id" value={$modalData.userId} />
                        </li>

                        <li class="modal_list_item">
                            <p>Username</p>
                            <span>{$modalData.username}</span>
                            <input type="hidden" name="username" value={$modalData.username} />
                        </li>

                        <li class="modal_list_item">
                            <p>Owned Character Name</p>
                            <span>
                                {#each $modalData.charName as name, i}
                                    ({i + 1}){`${name}　`}
                                {/each}
                            </span>
                        </li>

                        {#if $modalData.type === 0}
                            <li class="modal_list_item">
                                <p>Reason</p>
                                <select name="reason_type" required bind:value={selected}>
                                    <option value="999" disabled>Select the Reason</option>
                                    <option value="1">Cheating</option>
                                    <option value="2">Gameplay Exploit</option>
                                    <option value="3">Toxic and Abusive Behavior</option>
                                    <option value="4">Violation of Server Terms of Service</option>
                                    <option value="0">Other Reason</option>
                                </select>

                                {#if Number(selected) === 0}
                                    <input type="text" name="" id="" placeholder="Enter other reason here..." />
                                {/if}
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
                                    {DateTime.fromJSDate(!$modalData.untilAt ? new Date(0) : $modalData.untilAt)
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

                    {#if $modalData.type === 0}
                        <p class="modal_note">* Empty isn't allowed for "Reason" and "Suspention Period (when "Permanently Suspend" is unchecked)."</p>
                        <p class="modal_note">
                            * If "Permanently Suspend" is checked, the user account, including all character data, will be completely deleted from our database and can't be restored. Otherwise, they
                            can be restored.
                        </p>
                        <p class="modal_note">* "Suspention Period" is automatically converted to UTC.</p>
                    {/if}
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        formaction="?/{$modalData.type === 0 ? 'suspendUser' : 'unsuspendUser'}"
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">{$modalData.type === 0 ? 'Suspend' : 'Unuspend'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
