<script lang="ts">
    import { DateTime } from 'luxon';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, closeModal, rebuildClanData, msgClosed, filterClanValue, filterClanParam, paginatedClansData, paginationClansMetaData, timeOut, closeMsgDisplay } from '$utils/client';
</script>

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
            <input type="hidden" name="clan_id" value={$rebuildClanData.clanId} />
            <input type="hidden" name="clan_name" value={$rebuildClanData.clanName} />
            <input name="filter_value" type="hidden" value={$filterClanValue} />
            <input name="filter_param" type="hidden" value={$filterClanParam} />

            <div class="modal_header">
                <h1>Rebuild Clan Data</h1>
            </div>
            <div class="modal_body">
                <p>{$rebuildClanData.title}</p>

                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>ID</p>
                        <span>{$rebuildClanData.clanId}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Name</p>
                        <span>{$rebuildClanData.clanName}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Leader</p>
                        <span>{$rebuildClanData.clanLeader}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Est.</p>
                        <span
                            >{!$rebuildClanData.createdAt
                                ? 'No Data'
                                : DateTime.fromJSDate($rebuildClanData.createdAt)
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
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>

                <button
                    class="blue_btn"
                    formaction="?/{$rebuildClanData.formAction}"
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
