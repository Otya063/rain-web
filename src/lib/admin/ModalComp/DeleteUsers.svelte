<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteUsers', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/deleteUsers"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            if (checkModalType('deleteUsers', $modalData) && $modalData.onSuccess) {
                                $modalData.onSuccess($modalData.users.map((u) => u.id));
                            }
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="user_ids" value={JSON.stringify($modalData.users.map((u) => u.id))} />
                <input type="hidden" name="usernames" value={JSON.stringify($modalData.users.map((u) => u.username))} />

                <div class="modal_header">
                    <h1>{$modalData.users.length === 1 ? 'Delete User Account' : 'Delete User Accounts'}</h1>
                </div>

                <div class="modal_body">
                    <p>The following {$modalData.users.length === 1 ? 'user' : `${$modalData.users.length} users`} will be deleted:</p>

                    <ul class="modal_list">
                        {#if $modalData.users.length === 1}
                            <li class="modal_list_item">
                                <p>User ID</p>
                                <span>{$modalData.users[0].id}</span>
                            </li>
                            <li class="modal_list_item">
                                <p>Username</p>
                                <span>{$modalData.users[0].username}</span>
                            </li>
                        {:else}
                            {#each $modalData.users as user}
                                <li class="modal_list_item">
                                    <p>User ID: {user.id}</p>
                                    <span>{user.username}</span>
                                </li>
                            {/each}
                        {/if}
                    </ul>

                    <p class="modal_note">* Once user data is deleted, all associated data (linked discord data / character data) will be deleted as well.</p>
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
                        <span class="btn_text">Delete</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
