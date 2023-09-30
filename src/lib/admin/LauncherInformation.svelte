<script lang="ts">
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { prepareModal, convUnixToDate, underscoreAndLowercase, clicked_submit, editMode, notice, err_details } from '$ts/main';

    export let importantInfoData;
    export let defectsAndTroublesInfoData; // manually
    export let managementAndServiceInfoData; // manually
    export let ingameEventsInfoData;
    export let updatesAndMaintenanceInfoData;

    interface LauncherInfo {
        id: number;
        title: string;
        url: string;
        type: string;
        created_at: number;
    }

    const info_type_data: Record<string, LauncherInfo[]> = {
        Important: importantInfoData,
        'Defects and Troubles': defectsAndTroublesInfoData,
        'Management and Service': managementAndServiceInfoData,
        'In-Game Events': ingameEventsInfoData,
        'Updates and Maintenance': updatesAndMaintenanceInfoData,
    };

    /* Below is the add mode script
    ====================================================*/
    let add_mode: boolean = false;
    const addInfoMode = (cancel: boolean) => {
        // check if editing is in progress
        if ($editMode && !cancel) {
            notice.set(true);
            err_details.set('Edit mode remains active. Page transitions can be made after all editing is completed.');
            return false;
        }

        if (!cancel) {
            // when editing
            editMode.set(true);
            add_mode = true;
        } else {
            // when finished editing
            editMode.set(false);
            add_mode = false;
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
    const editModeHandle = (id: number, type: keyof CategoryType) => {
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

        if (!$editMode) {
            // when editing
            editMode.set(true);
            edit_id = id;
            cat_types[type] = true;
        } else {
            // when finished editing
            editMode.set(false);
            edit_id = id;
            cat_types[type] = false;
        }
    };
</script>

{#if add_mode}
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

    {#each Object.entries(info_type_data) as [typename, info_data]}
        <h2 class={underscoreAndLowercase(typename)}>
            <span class="material-icons">info</span>
            {typename} Information
        </h2>

        <div class="console_contents">
            {#if info_data.length === 0}
                <p class="console_contents_note">No Information Found.</p>
            {:else}
                {#each _.sortBy(info_data, 'id') || [] as info}
                    <dl class="console_contents_list">
                        <p class="console_contents_list_title">
                            [ Information ID: {info.id} ]
                            <input type="hidden" name="info_id" value={info.id} />
                        </p>
                        <button
                            style="width: 13%;"
                            class="del_btn"
                            on:click={() => prepareModal('deleteInfo', 'Are you sure you want to delete the following information?', 'deleteInfoData', info.title, info.url, info.type)}
                        >
                            <span class="material-icons">delete</span>
                            Delete
                        </button>

                        <dt class="contents_term">Title</dt>
                        <dd class="contents_desc">
                            {info.title}

                            {#if edit_id === info.id && cat_types['title']}
                                <button class="cancel_btn" on:click={() => editModeHandle(0, 'title')}>
                                    <span class="material-icons">close</span>
                                    Cancel
                                </button>
                            {:else}
                                <button class="edit_btn" on:click={() => editModeHandle(info.id, 'title')}>
                                    <span class="material-icons">mode_edit</span>
                                    Edit
                                </button>
                            {/if}

                            {#if edit_id === info.id && cat_types['title']}
                                <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                    <input type="hidden" name="info_id" value={edit_id} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Change Title</p>
                                        <dl class="edit_area_form_parts text">
                                            <dt>Enter new title</dt>
                                            <dd>
                                                <input type="text" name="title" value={info.title} autocomplete="off" />
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
                            {info.url}

                            {#if edit_id === info.id && cat_types['url']}
                                <button class="cancel_btn" on:click={() => editModeHandle(0, 'url')}>
                                    <span class="material-icons">close</span>
                                    Cancel
                                </button>
                            {:else}
                                <button class="edit_btn" on:click={() => editModeHandle(info.id, 'url')}>
                                    <span class="material-icons">mode_edit</span>
                                    Edit
                                </button>
                            {/if}

                            {#if edit_id === info.id && cat_types['url']}
                                <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                    <input type="hidden" name="info_id" value={edit_id} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Change URL</p>
                                        <dl class="edit_area_form_parts text">
                                            <dt>Enter new URL</dt>
                                            <dd>
                                                <input type="text" name="url" value={info.url} autocomplete="off" />
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
                            {convUnixToDate(info.created_at, false)}
                            <br />
                            {info.created_at}

                            {#if edit_id === info.id && cat_types['date']}
                                <button class="cancel_btn" on:click={() => editModeHandle(0, 'date')}>
                                    <span class="material-icons">close</span>
                                    Cancel
                                </button>
                            {:else}
                                <button class="edit_btn" on:click={() => editModeHandle(info.id, 'date')}>
                                    <span class="material-icons">mode_edit</span>
                                    Edit
                                </button>
                            {/if}

                            {#if edit_id === info.id && cat_types['date']}
                                <form transition:slide class="edit_area_form" action="?/updateInfoData" method="POST">
                                    <input type="hidden" name="info_id" value={edit_id} />
                                    <div class="edit_area enter">
                                        <p class="edit_area_title">Change Date</p>
                                        <dl class="edit_area_form_parts text">
                                            <dt>Set new date</dt>
                                            <dd>
                                                <input type="date" name="created_at" value={convUnixToDate(info.created_at, true)} />
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

                            {#if edit_id === info.id && cat_types['info_type']}
                                <button class="cancel_btn" on:click={() => editModeHandle(0, 'info_type')}>
                                    <span class="material-icons">close</span>
                                    Cancel
                                </button>
                            {:else}
                                <button class="edit_btn" on:click={() => editModeHandle(info.id, 'info_type')}>
                                    <span class="material-icons">mode_edit</span>
                                    Edit
                                </button>
                            {/if}

                            {#if edit_id === info.id && cat_types['info_type']}
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
            {/if}
        </div>
    {/each}
{/if}
