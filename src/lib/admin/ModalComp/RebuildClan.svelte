<script lang="ts">
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, modalData, msgClosed, filterClanValue, filterClanParam, paginatedClansData, paginationClansMetaData, timeOut, closeMsgDisplay, checkModalType } from '$utils/client';
</script>

{#if checkModalType('rebuildClan', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                method="POST"
                use:enhance={() => {
                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            // クラン検索結果をリセット
                            paginatedClansData.set([]);
                            paginationClansMetaData.set({
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
                <input type="hidden" name="clan_id" value={$modalData.clanId} />
                <input type="hidden" name="clan_name" value={$modalData.clanName} />
                <input name="filter_value" type="hidden" value={$filterClanValue} />
                <input name="filter_param" type="hidden" value={$filterClanParam} />

                <div class="modal_header">
                    <h1>Rebuild Clan Data</h1>
                </div>
                <div class="modal_body">
                    <p>The following clans will be rebuilt:</p>

                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>ID</p>
                            <span>{$modalData.clanId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Name</p>
                            <span>{$modalData.clanName}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Leader</p>
                            <span>{$modalData.clanLeader}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Est.</p>
                            <span
                                >{!$modalData.createdAt
                                    ? 'No Data'
                                    : DateTime.fromJSDate($modalData.createdAt)
                                          .setZone(DateTime.local().zoneName)
                                          .setLocale('en')
                                          .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span
                            >
                        </li>
                    </ul>

                    <p class="modal_note">* All members of the clan must be logged out from the game to rebuild clan data.</p>
                    <p class="modal_note">* After a successful process, the search results will be reset.</p>
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        formaction="?/rebuildClan"
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
