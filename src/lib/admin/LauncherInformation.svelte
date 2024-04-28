<script lang="ts">
    import type { launcher_info } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { allInformation, prepareModal, underscoreAndLowercase, onSubmit, msgClosed, discordLinkConvertor, conv2DArrayToObject, errDetailMode } from '$lib/utils';
    import _ from 'lodash';
    import { DateTime } from 'luxon';
    import { slide } from 'svelte/transition';

    export let informationData: { [key: string]: launcher_info[] };
    export let createdInfo: launcher_info;
    export let updatedInfo: launcher_info;
    allInformation.set(informationData);

    /* Below is the add mode script
    ====================================================*/
    export let infoAddMode: boolean;
    export const addInfoMode = (enable: boolean): void => {
        if (enable) {
            // when editing
            infoAddMode = true;
        } else {
            // when finished editing
            infoAddMode = false;
        }
    };

    /* Below is the edit mode script
    ====================================================*/
    let editingId: number;
    let editMode = false;
    const catTypes: { [key in keyof Omit<launcher_info, 'id'>]: boolean } = {
        title: false,
        url: false,
        type: false,
        created_at: false,
    };

    const editModeSwitch = <T extends number, U extends keyof Omit<launcher_info, 'id'>>(id: T, type: U): void | false => {
        // check if another category type is already in edit mode
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // when another normal_btn is pressed while editing, the editing target is switched
        if (activeCat && id !== 0) {
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_info, 'id'>;
                catTypes[key] = false;
            });

            catTypes[type] = true;
            editingId = id;

            return false;
        }

        // toggle true <-> false
        if (!editMode) {
            // when editing
            editMode = true;
            editingId = id;
            catTypes[type] = true;
        } else {
            // when finished editing
            editMode = false;
            editingId = id;
            catTypes[type] = false;
        }
    };
</script>

{#if infoAddMode}
    <h2>
        <span class="material-icons">post_add</span>
        Add New Information Form
    </h2>
    <div class="console_contents">
        <form
            class="info_add_form"
            action="?/createInfoData"
            method="POST"
            use:enhance={() => {
                return async ({ result }) => {
                    msgClosed.set(false);
                    errDetailMode.set(false);
                    onSubmit.set(false);
                    await applyAction(result);

                    if (result.type === 'success') {
                        $allInformation[createdInfo.type].push(createdInfo);
                        addInfoMode(false);
                    }
                };
            }}
        >
            <dl class="console_contents_list">
                <dt class="contents_term">Title<br /><span class="contents_term_required">[Required]</span></dt>
                <dd class="contents_desc">
                    <input type="text" name="title" autocomplete="off" />
                </dd>

                <dt class="contents_term">URL</dt>
                <dd class="contents_desc">
                    <p class="console_contents_note">* If the domain is "discord.com," the URL will be converted so that the discord app will open automatically.</p>
                    <input type="text" name="url" autocomplete="off" />
                </dd>

                <dt class="contents_term">Info Type<br /><span class="contents_term_required">[Required]</span></dt>
                <dd class="contents_desc">
                    <select name="type">
                        <option hidden disabled selected>Select the type of information here.</option>
                        {#each Object.keys($allInformation) as key}
                            <option value={key}>{key}</option>
                        {/each}
                    </select>
                </dd>

                <dt class="contents_term">Date</dt>
                <dd class="contents_desc">Your local time is automatically converted to UTC and set in the database.</dd>
            </dl>

            <div class="group_btns">
                <button class="blue_btn" type="submit" on:click={() => onSubmit.set(true)}>
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Save</span>
                </button>

                <button class="red_btn" type="button" on:click={() => addInfoMode(false)}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            </div>
        </form>
    </div>
{:else}
    {#each Object.entries($allInformation) as [typename, infoList]}
        <h2 class={underscoreAndLowercase(typename)}>
            <span class="material-icons">info</span>
            {typename} Information
        </h2>

        <div class="console_contents">
            {#if infoList.length === 0}
                <p class="console_contents_note">No Information Data</p>
            {:else}
                {#each _.sortBy(infoList, 'id') as infoItem}
                    <form
                        action="?/updateInfoData"
                        method="POST"
                        use:enhance={({ formData }) => {
                            const data = conv2DArrayToObject([...formData.entries()]);
                            const id = Number(data.info_id);
                            const type = String(data.info_type);
                            const column = Object.keys(data)[2];
                            const value = Object.values(data)[2];

                            return async ({ result }) => {
                                msgClosed.set(false);
                                errDetailMode.set(false);
                                onSubmit.set(false);
                                await applyAction(result);

                                if (result.type === 'success') {
                                    // update each value of edited info
                                    $allInformation[type] = $allInformation[type].map((info) => {
                                        if (info.id === id)
                                            return {
                                                ...info,
                                                [column]:
                                                    column !== 'url'
                                                        ? column === 'created_at'
                                                            ? DateTime.fromISO(String(value)).toJSDate()
                                                            : value
                                                        : !value
                                                          ? null
                                                          : value.indexOf('discord.com')
                                                            ? discordLinkConvertor(value)
                                                            : value,
                                            };

                                        return info;
                                    });

                                    // re-render info based on its type
                                    if (column === 'type') {
                                        // delete
                                        $allInformation[type] = $allInformation[type].filter((i) => i.id !== id);
                                        // add
                                        $allInformation[value].push(updatedInfo);
                                    }
                                }
                            };
                        }}
                    >
                        <input type="hidden" name="info_id" value={editingId} />
                        <input type="hidden" name="info_type" value={infoItem.type} />
                        <dl class="console_contents_list">
                            <p class="console_contents_list_title">
                                <button
                                    class="red_btn"
                                    type="button"
                                    on:click={() =>
                                        prepareModal('deleteInfo', {
                                            title: 'Delete the following information?',
                                            form_action: 'deleteInfoData',
                                            info_id: infoItem.id,
                                            info_title: infoItem.title,
                                            info_url: infoItem.url,
                                            info_created_at: DateTime.fromJSDate(infoItem.created_at)
                                                .setZone(DateTime.local().zoneName)
                                                .setLocale('en')
                                                .toLocaleString({ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                            info_type: infoItem.type,
                                        })}
                                >
                                    <span class="btn_icon material-icons">delete</span>
                                    <span class="btn_text">Delete</span>
                                </button>
                                Information Data
                                <input type="hidden" name="info_id" value={infoItem.id} />
                            </p>

                            <dt class="contents_term">Title</dt>
                            <dd class="contents_desc">
                                {infoItem.title}

                                {#if editingId === infoItem.id && catTypes['title']}
                                    <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'title')}>
                                        <span class="btn_icon material-icons">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" on:click={() => editModeSwitch(infoItem.id, 'title')}>
                                        <span class="btn_icon material-icons">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                {#if editingId === infoItem.id && catTypes['title']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Title</p>
                                            <p class="console_contents_note">* Empty isn't allowed.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Enter new title</dt>
                                                <dd>
                                                    <input type="text" name="title" value={infoItem.title} autocomplete="off" />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                on:click={() => {
                                                    onSubmit.set(true);
                                                    // delay the change by 100ms to prevent "0" during submitting
                                                    setTimeout(() => {
                                                        editModeSwitch(0, 'title');
                                                    }, 100);
                                                }}
                                            >
                                                <span class="btn_icon material-icons">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </dd>

                            <dt class="contents_term">URL</dt>
                            <dd class="contents_desc">
                                {infoItem.url}

                                {#if editingId === infoItem.id && catTypes['url']}
                                    <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'url')}>
                                        <span class="btn_icon material-icons">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" on:click={() => editModeSwitch(infoItem.id, 'url')}>
                                        <span class="btn_icon material-icons">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                {#if editingId === infoItem.id && catTypes['url']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change URL</p>
                                            <p class="console_contents_note">* If the domain is "discord.com," the URL will be converted so that the discord app will open automatically.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Enter new URL</dt>
                                                <dd>
                                                    <input type="text" name="url" value={infoItem.url} autocomplete="off" />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                on:click={() => {
                                                    onSubmit.set(true);
                                                    // delay the change by 100ms to prevent "0" during submitting
                                                    setTimeout(() => {
                                                        editModeSwitch(0, 'url');
                                                    }, 100);
                                                }}
                                            >
                                                <span class="btn_icon material-icons">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </dd>

                            <dt class="contents_term">Created At</dt>
                            <dd class="contents_desc">
                                {DateTime.fromJSDate(infoItem.created_at)
                                    .setZone(DateTime.local().zoneName)
                                    .setLocale('en')
                                    .toLocaleString({ year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}

                                {#if editingId === infoItem.id && catTypes['created_at']}
                                    <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'created_at')}>
                                        <span class="btn_icon material-icons">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" on:click={() => editModeSwitch(infoItem.id, 'created_at')}>
                                        <span class="btn_icon material-icons">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                {#if editingId === infoItem.id && catTypes['created_at']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Date</p>
                                            <p class="console_contents_note">* The date and time to be set are automatically converted to UTC.</p>
                                            <p class="console_contents_note">* Empty isn't allowed.</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Set new date</dt>
                                                <dd>
                                                    <input type="datetime-local" name="created_at" value={DateTime.fromJSDate(infoItem.created_at).toFormat("yyyy-MM-dd'T'HH:mm")} />
                                                    <input type="hidden" name="zonename" value={DateTime.local().zoneName} />
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                on:click={() => {
                                                    onSubmit.set(true);
                                                    // delay the change by 100ms to prevent "0" during submitting
                                                    setTimeout(() => {
                                                        editModeSwitch(0, 'created_at');
                                                    }, 100);
                                                }}
                                            >
                                                <span class="btn_icon material-icons">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </dd>

                            <dt class="contents_term">Info Type</dt>
                            <dd class="contents_desc">
                                {infoItem.type}

                                {#if editingId === infoItem.id && catTypes['type']}
                                    <button class="red_btn" type="button" on:click={() => editModeSwitch(0, 'type')}>
                                        <span class="btn_icon material-icons">close</span>
                                        <span class="btn_text">Cancel</span>
                                    </button>
                                {:else}
                                    <button class="normal_btn" type="button" on:click={() => editModeSwitch(infoItem.id, 'type')}>
                                        <span class="btn_icon material-icons">mode_edit</span>
                                        <span class="btn_text">Edit</span>
                                    </button>
                                {/if}

                                {#if editingId === infoItem.id && catTypes['type']}
                                    <div transition:slide class="edit_area_box">
                                        <div class="edit_area enter">
                                            <p class="edit_area_title">Change Information Type</p>
                                            <dl class="edit_area_box_parts text">
                                                <dt>Select new info type</dt>
                                                <dd>
                                                    <select name="type">
                                                        {#each Object.keys($allInformation) as key}
                                                            <option value={key} selected={key === typename}>{key}</option>
                                                        {/each}
                                                    </select>
                                                </dd>
                                            </dl>

                                            <button
                                                class="blue_btn"
                                                type="submit"
                                                on:click={() => {
                                                    onSubmit.set(true);
                                                    // delay the change by 100ms to prevent "0" during submitting
                                                    setTimeout(() => {
                                                        editModeSwitch(0, 'type');
                                                    }, 100);
                                                }}
                                            >
                                                <span class="btn_icon material-icons">check</span>
                                                <span class="btn_text">Save</span>
                                            </button>
                                        </div>
                                    </div>
                                {/if}
                            </dd>
                        </dl>
                    </form>
                {/each}
            {/if}
        </div>
    {/each}
{/if}
