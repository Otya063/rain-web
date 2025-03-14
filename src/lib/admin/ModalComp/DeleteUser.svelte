<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, conv2DArrayToObject, msgClosed, paginatedUsersData, paginationMetaData, timeOut, closeMsgDisplay, userDisplayState, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteUser', $modalData)}
    <div class="modal">
        <div class="modal_content">
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
                            $userDisplayState[id].icon = 'description';

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
                    <p>The following user will be deleted:</p>

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
                    </ul>

                    <p class="modal_note">* Once user data is deleted, all associated data (linked discord data / character data) will be deleted as well.</p>
                    <p class="modal_note">* After a successful process, the search results will be reset.</p>
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        formaction="?/deleteUser"
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
