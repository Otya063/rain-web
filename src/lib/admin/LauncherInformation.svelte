<script lang="ts">
    import _ from 'lodash';
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

    /* Below is the add mode script
    ====================================================*/
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

    /* Below is the edit mode script
    ====================================================*/
    let edit_id: number;
    interface CategoryType {
        [key: string]: boolean;
    }
    const cat_types: CategoryType = {
        title: false,
        url: false,
        date: false,
        info_type: false,
    };
    const editMode = (id: number, type: keyof CategoryType) => {
        // check if another category type is already in edit mode
        const active_editing = Object.values(cat_types).some((boolean) => boolean === true);

        // when another edit_btn is pressed while editing, the editing target is switched
        if (active_editing && id !== 0) {
            Object.keys(cat_types).forEach((key) => {
                cat_types[key] = false;
            });

            cat_types[type] = true;
            edit_id = id;

            return false;
        }

        if (!$edit_mode) {
            // when editing
            edit_mode.set(true);
            edit_id = id;
            cat_types[type] = true;
        } else {
            // when finished editing
            edit_mode.set(false);
            edit_id = id;
            cat_types[type] = false;
        }
    };
</script>

{#if adding}
    <h2>
        <span class="material-icons">post_add</span>
        Add New Information Form
    </h2>
    <div class="console_contents">
        <form class="info_add_form" action="?/createInfoData" method="POST">
            <dl class="console_contents_list">
                <dt class="contents_term">Title</dt>
                <dd class="contents_desc">
                    <input type="text" name="title" autocomplete="off" />
                </dd>

                <dt class="contents_term">URL</dt>
                <dd class="contents_desc">
                    <input type="text" name="url" autocomplete="off" />
                </dd>

                <dt class="contents_term">Info Type</dt>
                <dd class="contents_desc">
                    <select name="type">
                        {#each Object.keys(info_type_data) as key}
                            <option hidden>Select the type of information here.</option>
                            <option value={key}>{key}</option>
                        {/each}
                    </select>
                </dd>

                <dt class="contents_term">Date</dt>
                <dd class="contents_desc">This is set with the current date automatically.</dd>
            </dl>

            <div class="group_btns">
                <button class="save_btn" on:click={() => clicked_submit.set(true)} type="submit">
                    <span class="material-icons">check</span>
                    Save
                </button>

                <button class="cancel_btn" type="button" on:click={() => addInfoMode(true)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>
            </div>
        </form>
    </div>
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
            {#each _.sortBy(data, 'id') || [] as data_item}
                <p class="console_contents_list_title">[ Information ID: {data_item.id} ]</p>
                <dl class="console_contents_list">
                    <dt class="contents_term">Title</dt>
                    <dd class="contents_desc">
                        {data_item.title}

                        {#if edit_id === data_item.id && cat_types['title']}
                            <button class="cancel_btn" on:click={() => editMode(0, 'title')}>
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        {:else}
                            <button class="edit_btn" on:click={() => editMode(data_item.id, 'title')}>
                                <span class="material-icons">mode_edit</span>
                                Edit
                            </button>
                        {/if}

                        {#if edit_id === data_item.id && cat_types['title']}
                            <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                <input type="hidden" name="info_id" value={edit_id} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Title</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Enter new title</dt>
                                        <dd>
                                            <input type="text" name="title" value={data_item.title} autocomplete="off" />
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
                    <dd class="contents_desc">
                        {data_item.url}

                        {#if edit_id === data_item.id && cat_types['url']}
                            <button class="cancel_btn" on:click={() => editMode(0, 'url')}>
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        {:else}
                            <button class="edit_btn" on:click={() => editMode(data_item.id, 'url')}>
                                <span class="material-icons">mode_edit</span>
                                Edit
                            </button>
                        {/if}

                        {#if edit_id === data_item.id && cat_types['url']}
                            <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                <input type="hidden" name="info_id" value={edit_id} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change URL</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Enter new URL</dt>
                                        <dd>
                                            <input type="text" name="url" value={data_item.url} autocomplete="off" />
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

                    <dt class="contents_term">
                        Date<br />
                        Unix Time
                    </dt>
                    <dd class="contents_desc">
                        {convUnixToDate(data_item.created_at, false)}
                        <br />
                        {data_item.created_at}

                        {#if edit_id === data_item.id && cat_types['date']}
                            <button class="cancel_btn" on:click={() => editMode(0, 'date')}>
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        {:else}
                            <button class="edit_btn" on:click={() => editMode(data_item.id, 'date')}>
                                <span class="material-icons">mode_edit</span>
                                Edit
                            </button>
                        {/if}

                        {#if edit_id === data_item.id && cat_types['date']}
                            <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                <input type="hidden" name="info_id" value={edit_id} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Date</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Set new date</dt>
                                        <dd>
                                            <input type="date" name="created_at" value={convUnixToDate(data_item.created_at, true)} />
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

                    <dt class="contents_term">Info Type</dt>
                    <dd class="contents_desc">
                        {typename}

                        {#if edit_id === data_item.id && cat_types['info_type']}
                            <button class="cancel_btn" on:click={() => editMode(0, 'info_type')}>
                                <span class="material-icons">close</span>
                                Cancel
                            </button>
                        {:else}
                            <button class="edit_btn" on:click={() => editMode(data_item.id, 'info_type')}>
                                <span class="material-icons">mode_edit</span>
                                Edit
                            </button>
                        {/if}

                        {#if edit_id === data_item.id && cat_types['info_type']}
                            <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                <input type="hidden" name="info_id" value={edit_id} />
                                <div class="edit_area enter">
                                    <p class="edit_area_title">Change Information Type</p>
                                    <dl class="edit_area_form_parts text">
                                        <dt>Select new info type</dt>
                                        <dd>
                                            <select name="type">
                                                {#each Object.keys(info_type_data) as key}
                                                    <option value={key} selected={key === typename}>{key}</option>
                                                {/each}
                                            </select>
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
                </dl>
            {/each}
        </div>
    {/each}
{/if}
