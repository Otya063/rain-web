<script lang="ts">
    import type { launcher_system } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, msgClosed, conv2DArrayToObject } from '$lib/utils';
    import { slide } from 'svelte/transition';

    export let systemData: launcher_system;
    let { RainJP, RainUS, RainEU, update, debug, client_data }: launcher_system = systemData;

    /* Below is the edit mode script
    ====================================================*/
    const catTypes: { [key in keyof Omit<launcher_system, 'id' | 'rain_admins'>]: boolean } = {
        RainJP: false,
        RainUS: false,
        RainEU: false,
        update: false,
        debug: false,
        client_data: false,
    };

    const editModeSwitch = <T extends keyof Omit<launcher_system, 'id' | 'rain_admins'>>(type: T): void | false => {
        // check if another cat type is already open
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // if an open cat is clicked (try to close it), close it
        if (catTypes[type]) {
            catTypes[type] = false;

            return false;
        }

        // if there is an open cat and a different category is cliked (try to open it)
        if (activeCat) {
            // set everything to false (close) in a loop.
            Object.keys(catTypes).forEach((_key) => {
                const key = _key as keyof Omit<launcher_system, 'id' | 'rain_admins'>;
                catTypes[key] = false;
            });

            // set the category clicked to true (open)
            catTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        catTypes[type] = !catTypes[type];
    };

    const updateSystemValue = (data: Record<string, any>): void => {
        const column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id' | 'rain_admins'> | 'client_data_0' | 'client_data_1' | 'maint_all';
        const value = Object.values(data)[0] as string;

        switch (column) {
            case 'RainJP': {
                RainJP = value === 'true';

                break;
            }

            case 'RainUS': {
                RainUS = value === 'true';

                break;
            }

            case 'RainEU': {
                RainEU = value === 'true';

                break;
            }

            case 'update': {
                update = value === 'true';

                break;
            }

            case 'debug': {
                debug = value === 'true';

                break;
            }

            case 'client_data_0': {
                client_data = [value.length === 1 ? `${value}.0` : value, Object.values(data)[1]] as string[];

                break;
            }

            case 'maint_all': {
                RainJP = value === 'true';
                RainUS = value === 'true';
                RainEU = value === 'true';

                break;
            }

            default: {
                throw new Error(`${column} is invalid column.`);
            }
        }
    };
</script>

<h2>
    <span class="material-icons">engineering</span>
    Servers Maintenance Settings
</h2>
<div class="console_contents">
    <p class="console_contents_note">* These data will be fetched when users run the Rain launcher.</p>

    <form
        action="?/updateSystemMode"
        method="POST"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    updateSystemValue(data);
                }
            };
        }}
    >
        <dl class="console_contents_list">
            <!-- Rain (JP) Maintenance Setting -->
            <dt class="contents_term">Rain (JP)</dt>
            <dd class="contents_desc">
                {RainJP ? 'Enable' : 'Disable'}

                {#if catTypes['RainJP']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('RainJP')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('RainJP')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['RainJP']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area select">
                            <p class="edit_area_title">Change Setting</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="rain_jp_enable">
                                        <input type="radio" name="RainJP" id="rain_jp_enable" value="true" checked={RainJP} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_jp_disable">
                                        <input type="radio" name="RainJP" id="rain_jp_disable" value="false" checked={!RainJP} />
                                        Disable
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('RainJP');
                                }}
                            >
                                <span class="btn_icon material-icons">check</span>
                                <span class="btn_text">Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </dd>

            <!-- Rain (US) Maintenance Setting -->
            <dt class="contents_term">Rain (US)</dt>
            <dd class="contents_desc">
                {RainUS ? 'Enable' : 'Disable'}

                {#if catTypes['RainUS']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('RainUS')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('RainUS')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['RainUS']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area select">
                            <p class="edit_area_title">Change Setting</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="rain_us_enable">
                                        <input type="radio" name="RainUS" id="rain_us_enable" value="true" checked={RainUS} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_us_disable">
                                        <input type="radio" name="RainUS" id="rain_us_disable" value="false" checked={!RainUS} />
                                        Disable
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('RainUS');
                                }}
                            >
                                <span class="btn_icon material-icons">check</span>
                                <span class="btn_text">Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </dd>

            <!-- Rain (EU) Maintenance Setting -->
            <dt class="contents_term">Rain (EU)</dt>
            <dd class="contents_desc">
                {RainEU ? 'Enable' : 'Disable'}

                {#if catTypes['RainEU']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('RainEU')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('RainEU')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['RainEU']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area select">
                            <p class="edit_area_title">Change Setting</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="rain_eu_enable">
                                        <input type="radio" name="RainEU" id="rain_eu_enable" value="true" checked={RainEU} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_eu_disable">
                                        <input type="radio" name="RainEU" id="rain_eu_disable" value="false" checked={!RainEU} />
                                        Disable
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('RainEU');
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

        <div id="change_all_settings" class="edit_area_box">
            <div class="edit_area select">
                <p class="edit_area_title">Change All Settings</p>
                <ul class="edit_area_box_parts radio">
                    <li>
                        <label style="width: 110px;" for="enable_all">
                            <input type="radio" name="maint_all" id="enable_all" value="true" />
                            Enable All
                        </label>
                    </li>
                    <li>
                        <label style="width: 110px;" for="disable_all">
                            <input type="radio" name="maint_all" id="disable_all" value="false" checked />
                            Disable All
                        </label>
                    </li>
                </ul>

                <button class="blue_btn" type="submit" formaction="?/updateAllMaintData" on:click={() => onSubmit.set(true)}>
                    <span class="btn_icon material-icons">check</span>
                    <span class="btn_text">Save</span>
                </button>
            </div>
        </div>
    </form>
</div>

<h2>
    <span class="material-icons">update</span>
    Launcher Update & Other Settings
</h2>
<div class="console_contents">
    <p class="console_contents_note">* These data will be fetched when users run the Rain launcher.</p>

    <form
        action="?/updateSystemMode"
        method="POST"
        use:enhance={({ formData }) => {
            const data = conv2DArrayToObject([...formData.entries()]);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    updateSystemValue(data);
                }
            };
        }}
    >
        <dl class="console_contents_list">
            <!-- Update Mode Setting -->
            <dt class="contents_term">Update Mode</dt>
            <dd class="contents_desc">
                {update ? 'Enable' : 'Disable'}

                {#if catTypes['update']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('update')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('update')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['update']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area select">
                            <p class="edit_area_title">Change Setting</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="update_enable">
                                        <input type="radio" name="update" id="update_enable" value="true" checked={update} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="update_disable">
                                        <input type="radio" name="update" id="update_disable" value="false" checked={!update} />
                                        Disable
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('update');
                                }}
                            >
                                <span class="btn_icon material-icons">check</span>
                                <span class="btn_text">Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </dd>

            <!-- Debug Mode Setting -->
            <dt class="contents_term">Debug Mode</dt>
            <dd class="contents_desc">
                {debug ? 'Enable' : 'Disable'}

                {#if catTypes['debug']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('debug')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('debug')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['debug']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area select">
                            <p class="edit_area_title">Change Setting</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="debug_enable">
                                        <input type="radio" name="debug" id="debug_enable" value="true" checked={debug} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="debug_disable">
                                        <input type="radio" name="debug" id="debug_disable" value="false" checked={!debug} />
                                        Disable
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('debug');
                                }}
                            >
                                <span class="btn_icon material-icons">check</span>
                                <span class="btn_text">Save</span>
                            </button>
                        </div>
                    </div>
                {/if}
            </dd>

            <!-- Client Version & Forced Updates -->
            <dt class="contents_term">Client Data</dt>
            <dd class="contents_desc">
                {client_data[0]} (The version of client data)
                <br />
                {client_data[1]} (Whether to force updating client data)

                {#if catTypes['client_data']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('client_data')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('client_data')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['client_data']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area enter">
                            <p class="edit_area_title">Change the Version of Client and Update Setting</p>
                            <p class="console_contents_note">* Empty isn't allowed.</p>
                            <dl class="edit_area_box_parts text">
                                <dt>Enter the version</dt>
                                <dd>
                                    <input type="number" name="client_data_0" step="0.1" inputmode="decimal" pattern="\d*" value={client_data[0]} placeholder="Enter the version" />
                                </dd>
                            </dl>
                        </div>

                        <div class="edit_area select">
                            <p class="edit_area_title">Select Whether to Force</p>
                            <ul class="edit_area_box_parts radio">
                                <li>
                                    <label for="update_force">
                                        <input type="radio" name="client_data_1" id="update_force" value="force" checked={client_data[1] === 'force'} />
                                        Force
                                    </label>
                                </li>
                                <li>
                                    <label for="update_not_force">
                                        <input type="radio" name="client_data_1" id="update_not_force" value="not_force" checked={client_data[1] === 'not_force'} />
                                        Not Force
                                    </label>
                                </li>
                            </ul>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('client_data');
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
</div>
