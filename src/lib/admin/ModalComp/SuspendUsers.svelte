<script lang="ts">
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';

    let permanent = $state(false);
    let selected = $state('999');
    let otherReason = $state('');

    // Per-user state for multi-user suspend
    let perUserStates = $state<{ permanent: boolean; selected: string; otherReason: string }[]>([]);

    $effect.pre(() => {
        if (!checkModalType('suspendUsers', $modalData)) {
            return;
        }

        const users = $modalData.users;
        if (users.length > 1) {
            perUserStates = users.map(() => ({ permanent: false, selected: '999', otherReason: '' }));
        }
    });
</script>

{#if checkModalType('suspendUsers', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/{$modalData.type === 0 ? 'suspendUsers' : 'unsuspendUsers'}"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            if (checkModalType('suspendUsers', $modalData) && $modalData.onSuccess) {
                                let entries: { id: number; permanent: boolean; reason: number; otherReason: string | null; suspendedBy: { id: number; username: string | null } | null }[];
                                if ($modalData.type === 0) {
                                    const suspendedBy = (result.data?.suspendedBy as { id: number; username: string | null } | null | undefined) ?? null;
                                    entries =
                                        $modalData.users.length > 1
                                            ? $modalData.users.map((u, i) => ({
                                                  id: u.id,
                                                  permanent: perUserStates[i]?.permanent ?? false,
                                                  reason: Number(perUserStates[i]?.selected ?? '0'),
                                                  otherReason: perUserStates[i]?.selected === '0' ? (perUserStates[i]?.otherReason ?? null) : null,
                                                  suspendedBy,
                                              }))
                                            : [
                                                  {
                                                      id: $modalData.users[0].id,
                                                      permanent,
                                                      reason: Number(selected),
                                                      otherReason: selected === '0' ? otherReason : null,
                                                      suspendedBy,
                                                  },
                                              ];
                                } else {
                                    entries = $modalData.users.map((u) => ({ id: u.id, permanent: false, reason: 0, otherReason: null, suspendedBy: null }));
                                }

                                $modalData.onSuccess(entries);
                            }
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="user_ids" value={JSON.stringify($modalData.users.map((u) => u.id))} />
                <input type="hidden" name="usernames" value={JSON.stringify($modalData.users.map((u) => u.username))} />
                {#if $modalData.type === 0}
                    <input type="hidden" name="zoneName" value={DateTime.local().zoneName} />
                {/if}

                <div class="modal_header">
                    <h1>
                        {$modalData.type === 0 ? ($modalData.users.length === 1 ? 'Suspend User Account' : 'Suspend User Accounts') : 'Unsuspend User Account'}
                    </h1>
                </div>

                <div class="modal_body">
                    <p>The following {$modalData.users.length === 1 ? 'user' : `${$modalData.users.length} users`} will be {$modalData.type === 0 ? 'suspended' : 'unsuspended'}:</p>

                    {#if $modalData.users.length === 1}
                        <ul class="modal_list">
                            <li class="modal_list_item">
                                <p>User ID</p>
                                <span>{$modalData.users[0].id}</span>
                            </li>
                            <li class="modal_list_item">
                                <p>Username</p>
                                <span>{$modalData.users[0].username}</span>
                            </li>
                            {#if $modalData.users[0].charName?.length}
                                <li class="modal_list_item">
                                    <p>Owned Character Name</p>
                                    <span>
                                        {#each $modalData.users[0].charName as name, i}
                                            ({i + 1}){`${name}　`}
                                        {/each}
                                    </span>
                                </li>
                            {/if}

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
                                </li>

                                {#if selected === '0'}
                                    <li class="modal_list_item">
                                        <label>
                                            <p>Other Reason (Details)</p>
                                            <input type="text" name="other_reason" bind:value={otherReason} required />
                                        </label>
                                    </li>
                                {/if}

                                <li class="modal_list_item">
                                    <label>
                                        <p>Permanently Suspend</p>
                                        <span class="material-symbols-outlined" style="font-size: 2.1rem;">{permanent ? 'check_box' : 'check_box_outline_blank'}</span>
                                        <input type="checkbox" name="permanently_del" bind:checked={permanent} />
                                    </label>
                                </li>

                                <li class="modal_list_item" class:disabled_elm={permanent}>
                                    <label>
                                        <p>Suspension Period (until at)</p>
                                        <input type="datetime-local" name="until_at" />
                                    </label>
                                </li>
                            {:else}
                                <li class="modal_list_item">
                                    <p>Suspension Period (until at)</p>
                                    <span>
                                        {DateTime.fromJSDate(new Date($modalData.users[0].untilAt ?? 0))
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
                    {:else if $modalData.type === 0}
                        {#each $modalData.users as user, i}
                            <div class="modal_list_user_section">
                                <p class="modal_list_user_header">#{i + 1} — ID: {user.id} / {user.username}</p>
                                <ul class="modal_list">
                                    <li class="modal_list_item">
                                        <p>Reason</p>
                                        <select name="reason_type_{i}" required bind:value={perUserStates[i].selected}>
                                            <option value="999" disabled>Select the Reason</option>
                                            <option value="1">Cheating</option>
                                            <option value="2">Gameplay Exploit</option>
                                            <option value="3">Toxic and Abusive Behavior</option>
                                            <option value="4">Violation of Server Terms of Service</option>
                                            <option value="0">Other Reason</option>
                                        </select>
                                    </li>

                                    {#if perUserStates[i].selected === '0'}
                                        <li class="modal_list_item">
                                            <label>
                                                <p>Other Reason (Details)</p>
                                                <input type="text" name="other_reason_{i}" bind:value={perUserStates[i].otherReason} required />
                                            </label>
                                        </li>
                                    {/if}

                                    <li class="modal_list_item">
                                        <label>
                                            <p>Permanently Suspend</p>
                                            <span class="material-symbols-outlined" style="font-size: 2.1rem;">{perUserStates[i].permanent ? 'check_box' : 'check_box_outline_blank'}</span>
                                            <input type="checkbox" name="permanent_{i}" bind:checked={perUserStates[i].permanent} />
                                        </label>
                                    </li>

                                    <li class="modal_list_item" class:disabled_elm={perUserStates[i].permanent}>
                                        <label>
                                            <p>Suspension Period (until at)</p>
                                            <input type="datetime-local" name="until_at_{i}" required={!perUserStates[i].permanent} />
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        {/each}
                    {:else}
                        <ul class="modal_list">
                            {#each $modalData.users as user}
                                <li class="modal_list_item">
                                    <p>User ID: {user.id}</p>
                                    <span>{user.username}</span>
                                </li>
                            {/each}
                        </ul>
                    {/if}

                    {#if $modalData.type === 0}
                        <p class="modal_note">
                            * Empty isn't allowed for "Reason", "Other Reason (Details)" (when "Reason" is "Other Reason"), and "Suspension Period (when "Permanently Suspend" is unchecked)."
                        </p>
                        <p class="modal_note">
                            * If "Permanently Suspend" is checked,
                            {$modalData.users.length === 1 ? 'the user account, including all character data,' : 'the applicable user accounts including character data'}
                            will be completely deleted from our database and can't be restored. Otherwise, they can be restored.
                        </p>
                        <p class="modal_note">* "Suspension Period" is automatically converted to UTC.</p>
                    {/if}
                </div>

                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        type="submit"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">{$modalData.type === 0 ? 'Suspend' : 'Unsuspend'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
