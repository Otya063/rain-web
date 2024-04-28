<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        onSubmit,
        closeModal,
        rebuildClanData,
        msgClosed,
        filterClanValue,
        filterClanParam,
        paginatedClansData,
        paginationClansMetaData,
        errDetailMode,
    } from '$lib/utils';
    import { DateTime } from 'luxon';
</script>

<div class="modal">
    <div class="modal_content">
        <form
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    errDetailMode.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        // reset clan result
                        paginatedClansData.set(null);
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
            <input type="hidden" name="clan_id" value={$rebuildClanData.clan_id} />
            <input type="hidden" name="clan_name" value={$rebuildClanData.clan_name} />
            <input name="filter_value" type="hidden" value={$filterClanValue} />
            <input name="filter_param" type="hidden" value={$filterClanParam} />

            <div class="modal_header">
                <h1>Rebuild Clan Data</h1>
            </div>
            <div class="modal_body">
                <p>{$rebuildClanData.title}</p>

                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Clan ID</p>
                        <span>{$rebuildClanData.clan_id}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Clan Name</p>
                        <span>{$rebuildClanData.clan_name}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Clan Leader</p>
                        <span>{$rebuildClanData.clan_leader}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Est.</p>
                        <span
                            >{!$rebuildClanData.created_at
                                ? 'No Data'
                                : DateTime.fromJSDate($rebuildClanData.created_at)
                                      .setZone(DateTime.local().zoneName)
                                      .setLocale('en')
                                      .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span
                        >
                    </li>
                </ul>

                <p class="modal_note">* All members of the clan must be logged out from the game to rebuild clan data.</p>
                <p class="modal_note">* After a successful rebuild, the search results will be reset.</p>
            </div>
            <div class="btn_group">
                <button class="blue_btn" formaction="?/{$rebuildClanData.form_action}" type="submit" on:click={() => onSubmit.set(true)}>
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
