<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteClans', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/deleteClans"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            if (checkModalType('deleteClans', $modalData) && $modalData.onSuccess) {
                                $modalData.onSuccess($modalData.clans.map((c) => c.id));
                            }
                        }

                        closeModal();
                    };
                }}
            >
                {#each $modalData.clans as clan}
                    <input type="hidden" name="clan_ids" value={clan.id} />
                {/each}

                <div class="modal_header">
                    <h1>{$modalData.clans.length === 1 ? 'Delete Clan' : 'Delete Clans'}</h1>
                </div>

                <div class="modal_body">
                    <p>The following {$modalData.clans.length === 1 ? 'clan' : `${$modalData.clans.length} clans`} will be deleted:</p>

                    <ul class="modal_list">
                        {#if $modalData.clans.length === 1}
                            <li class="modal_list_item">
                                <p>Clan ID</p>
                                <span>{$modalData.clans[0].id}</span>
                            </li>

                            <li class="modal_list_item">
                                <p>Clan Name</p>
                                <span>{$modalData.clans[0].name ?? 'No Name'}</span>
                            </li>
                        {:else}
                            {#each $modalData.clans as clan}
                                <li class="modal_list_item">
                                    <p>Clan ID: {clan.id}</p>
                                    <span>{clan.name ?? 'No Name'}</span>
                                </li>
                            {/each}
                        {/if}
                    </ul>

                    <p class="modal_note">* Once clan data is deleted, all associated data (members / alliance memberships) will be removed as well.</p>
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
