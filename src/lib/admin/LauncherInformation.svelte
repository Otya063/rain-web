<script lang="ts">
    import { slide } from 'svelte/transition';
    import { convUnixToDate, underscoreAndLowercase, clicked_submit, edit_mode, notice, err_details } from '$ts/main';

    export let important_info_data;
    export let defects_and_troubles_info_data; // manually
    export let management_and_service_info_data; // manually
    export let ingame_events_info_data;
    export let updates_and_maintenance_info_data;

    interface LauncherInfo {
        id: number;
        title: string;
        url: string;
        type: string;
        created_at: number;
    }

    const info_type_data: Record<string, LauncherInfo[]> = {
        Important: important_info_data,
        'Defects and Troubles': defects_and_troubles_info_data,
        'Management and Service': management_and_service_info_data,
        'In-Game Events': ingame_events_info_data,
        'Updates and Maintenance': updates_and_maintenance_info_data,
    };

    let adding: boolean = false;
    const addInfoMode = (cancel: boolean) => {
        // check if editing is in progress
        if ($edit_mode && !cancel) {
            notice.set(true);
            err_details.set('Edit mode still remains active. Page transitions can only be made after all editing has been completed.');
            return false;
        }

        if (!cancel) {
            // when editing
            edit_mode.set(true);
            adding = true;
        } else {
            // when finished editing
            edit_mode.set(false);
            adding = false;
        }
    };

    let edit_id: number;
    const editMode = (id: number) => {
        if (!$edit_mode) {
            // when editing
            edit_mode.set(true);
            edit_id = id;
        } else {
            // when finished editing
            edit_mode.set(false);
            edit_id = id;
        }
    };
</script>

{#if adding}
    <li class="console_contents_list_item">
        <form class="console_form_section" action="?/createInfoData" method="POST">
            <p class="console_head">Launcher Information Adding Form</p>
            <label for="info_title">
                Title:
                <input id="info_title" type="text" name="info_title" />
            </label>

            <label for="info_url">
                URL:
                <input id="info_url" type="text" name="info_url" />
            </label>

            <div class="info_type_group">
                <label for="info_type">Info Type</label>

                {#each Object.keys(info_type_data) as key}
                    <label for={key}>
                        <input id={key} type="radio" name="info_type" value={key} />
                        {key}
                    </label>
                {/each}
            </div>

            <div class="save_cancel_btn">
                <button type="submit">[Save]</button>
                <button type="button" on:click={() => addInfoMode(true)}>[Cancel]</button>
            </div>
        </form>
    </li>
{:else}
    <button class="add_info_btn" on:click={() => addInfoMode(false)}>
        <span class="material-icons">add</span>
        Add Info
    </button>

    {#each Object.entries(info_type_data) as [typename, data]}
        <h2 class={underscoreAndLowercase(typename)}>
            <span class="material-icons">info</span>
            {typename} Information
        </h2>
        {#if data.length === 0}
            <p style="color: red;">No Information Found</p>
        {/if}
        <div class="console_contents">
            {#each data || [] as data_item}
                <p class="console_contents_list_title">[ Information ID: {data_item.id} ]</p>
                <dl class="console_contents_list">
                    <dt class="contents_term">Title</dt>
                    <dd class="contents_desc">
                        {data_item.title}

                        {#if edit_id === data_item.id}
                            <button class="cancel_btn" on:click={() => editMode(0)}>
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        {:else}
                            <button class="edit_btn" on:click={() => editMode(data_item.id)}>
                                <span class="material-icons">mode_edit</span>
                                Edit
                            </button>
                        {/if}

                        {#if edit_id === data_item.id}
                            <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Title</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>New Title</dt>
                                        <dd>
                                            <input type="text" name="info_title" value={data_item.title} autocomplete="off" />
                                        </dd>
                                    </dl>

                                    <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                                        <span class="material-icons">check</span>
                                        Save
                                    </button>
                                </div>
                            </form>
                        {/if}
                    </dd>

                    <dt class="contents_term">URL</dt>
                    <dd class="contents_desc">{data_item.url}</dd>

                    <dt class="contents_term">
                        Date<br />
                        Unix Time
                    </dt>
                    <dd class="contents_desc">
                        {convUnixToDate(data_item.created_at, false)}<br />
                        {data_item.created_at}
                    </dd>
                </dl>
            {/each}
        </div>
    {/each}
{/if}
