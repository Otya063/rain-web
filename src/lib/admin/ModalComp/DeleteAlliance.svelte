<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('deleteAlliance', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/deleteAlliances"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            if (checkModalType('deleteAlliance', $modalData) && $modalData.onSuccess) {
                                $modalData.onSuccess($modalData.alliances.map((a) => a.id));
                            }
                        }

                        closeModal();
                    };
                }}
            >
                {#each $modalData.alliances as alliance}
                    <input type="hidden" name="alliance_ids" value={alliance.id} />
                {/each}

                <div class="modal_header">
                    <h1>{$modalData.alliances.length === 1 ? 'Delete Alliance' : 'Delete Alliances'}</h1>
                </div>

                <div class="modal_body">
                    <p>The following {$modalData.alliances.length === 1 ? 'alliance' : `${$modalData.alliances.length} alliances`} will be deleted:</p>

                    <ul class="modal_list">
                        {#if $modalData.alliances.length === 1}
                            <li class="modal_list_item">
                                <p>Alliance ID</p>
                                <span>{$modalData.alliances[0].id}</span>
                            </li>

                            <li class="modal_list_item">
                                <p>Alliance Name</p>
                                <span>{$modalData.alliances[0].name}</span>
                            </li>
                        {:else}
                            {#each $modalData.alliances as alliance}
                                <li class="modal_list_item">
                                    <p>Alliance ID: {alliance.id}</p>
                                    <span>{alliance.name}</span>
                                </li>
                            {/each}
                        {/if}
                    </ul>
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
