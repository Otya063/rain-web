<script lang="ts">
    import _ from 'lodash';
    import { slide } from 'svelte/transition';
    import { prepareModal, underscoreAndLowercase, clicked_submit, editMode, notice, err_details } from '$ts/main';
    import type { launcher_info } from '@prisma/client/edge';
    import { DateTime } from 'luxon';

    export let importantInfoData;
    export let defectsAndTroublesInfoData; // manually
    export let managementAndServiceInfoData; // manually
    export let ingameEventsInfoData;
    export let updatesAndMaintenanceInfoData;

    const info_type_data: Record<string, launcher_info[]> = {
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
        info_type: false,
    };
    const editModeHandle = (id: number, type: keyof CategoryType) => {
        // check if another category type is already in edit mode
        const active_editing = Object.values(cat_types).some((boolean) => boolean === true);

        // when another normal_btn is pressed while editing, the editing target is switched
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
                    <p class="console_contents_note">If the domain is "discord.com," the URL will be converted so that the discord app will open automatically.</p>
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
                <!-- unixから変更したのでサーバーサイドプロセス要確認 -->
                <dd class="contents_desc">This is set with the current date automatically.</dd>
            </dl>

            <div class="group_btns">
                <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Save</span>
                </button>

                <button class="red_btn" type="button" on:click={() => addInfoMode(true)}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    <button class="green_btn" on:click={() => addInfoMode(false)}>
        <span class="btn_icon material-icons">add</span>
        <span class="btn_text">Add Information</span>
    </button>

    {#each Object.entries(info_type_data) as [typename, info_data]}
        <h2 class={underscoreAndLowercase(typename)}>
            <span class="material-icons">info</span>
            {typename} Information
        </h2>

        <div class="console_contents">
            {#if info_data.length === 0}
                <p class="console_contents_note">No Information Data Found</p>
            {:else}
                {#each _.sortBy(info_data, 'id') || [] as info}
                    <dl class="console_contents_list">
                        <p class="console_contents_list_title">
                            <button
                                class="red_btn"
                                on:click={() => prepareModal('deleteInfo', 'Are you sure you want to delete the following information?', 'deleteInfoData', info.id, info.title, info.url, info.type)}
                            >
                                <span class="btn_icon material-icons">delete</span>
                                <span class="btn_text">Delete</span>
                            </button>
                            Information Data
                            <input type="hidden" name="info_id" value={info.id} />
                        </p>

                        <dt class="contents_term">Title</dt>
                        <dd class="contents_desc">
                            {info.title}

                            {#if edit_id === info.id && cat_types['title']}
                                <button class="red_btn" on:click={() => editModeHandle(0, 'title')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" on:click={() => editModeHandle(info.id, 'title')}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
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

                                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </form>
                            {/if}
                        </dd>

                        <dt class="contents_term">URL</dt>
                        <dd class="contents_desc">
                            {info.url}

                            {#if edit_id === info.id && cat_types['url']}
                                <button class="red_btn" on:click={() => editModeHandle(0, 'url')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" on:click={() => editModeHandle(info.id, 'url')}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
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
                                                <p class="console_contents_note">If the domain is "discord.com," the URL will be converted so that the discord app will open automatically.</p>
                                                <input type="text" name="url" value={info.url} autocomplete="off" />
                                            </dd>
                                        </dl>

                                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
                                        </button>
                                    </div>
                                </form>
                            {/if}
                        </dd>

                        <dt class="contents_term">Date</dt>
                        <dd class="contents_desc">
                            {DateTime.fromJSDate(info.created_at)
                                .setZone(DateTime.local().zoneName)
                                .setLocale('en')
                                .toLocaleString({ year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </dd>

                        <dt class="contents_term">Info Type</dt>
                        <dd class="contents_desc">
                            {typename}

                            {#if edit_id === info.id && cat_types['info_type']}
                                <button class="red_btn" on:click={() => editModeHandle(0, 'info_type')}>
                                    <span class="btn_icon material-icons">close</span>
                                    <span class="btn_text">Cancel</span>
                                </button>
                            {:else}
                                <button class="normal_btn" on:click={() => editModeHandle(info.id, 'info_type')}>
                                    <span class="btn_icon material-icons">mode_edit</span>
                                    <span class="btn_text">Edit</span>
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

                                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                                            <span class="btn_icon material-icons">check</span>
                                            <span class="btn_text">Save</span>
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
