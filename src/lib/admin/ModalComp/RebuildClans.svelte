<script lang="ts">
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, filterClanValue, filterClanParam, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('rebuildClan', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                action="?/rebuildClans"
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            const data = result.data as { rebuiltClans?: { oldId: number; newId: number; name: string | null }[] };
                            if (checkModalType('rebuildClan', $modalData) && $modalData.onSuccess && data?.rebuiltClans) {
                                $modalData.onSuccess(data.rebuiltClans);
                            }
                        }

                        closeModal();
                    };
                }}
            >
                {#each $modalData.clans as clan}
                    <input type="hidden" name="clan_ids" value={clan.id} />
                {/each}
                <input name="filter_value" type="hidden" value={$filterClanValue} />
                <input name="filter_param" type="hidden" value={$filterClanParam} />

                <div class="modal_header">
                    <h1>{$modalData.clans.length === 1 ? 'Rebuild Clan Data' : 'Rebuild Clans Data'}</h1>
                </div>

                <div class="modal_body">
                    <p>The following {$modalData.clans.length === 1 ? 'clan' : `${$modalData.clans.length} clans`} will be rebuilt:</p>

                    <ul class="modal_list">
                        {#if $modalData.clans.length === 1}
                            <li class="modal_list_item">
                                <p>ID</p>
                                <span>{$modalData.clans[0].id}</span>
                            </li>

                            <li class="modal_list_item">
                                <p>Name</p>
                                <span>{$modalData.clans[0].name ?? 'No Name'}</span>
                            </li>

                            <li class="modal_list_item">
                                <p>Leader</p>
                                <span>{$modalData.clans[0].leaderName ?? 'No Leader'}</span>
                            </li>

                            <li class="modal_list_item">
                                <p>Est.</p>
                                <span>
                                    {!$modalData.clans[0].createdAt
                                        ? 'No Data'
                                        : DateTime.fromJSDate($modalData.clans[0].createdAt)
                                              .setZone(DateTime.local().zoneName)
                                              .setLocale('en')
                                              .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
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

                    <p class="modal_note">* All members of the clan must be logged out from the game to rebuild clan data.</p>
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
                        <span class="btn_text">Rebuild</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
