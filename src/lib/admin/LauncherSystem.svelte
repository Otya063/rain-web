<script lang="ts">
    import type { launcher_system } from '@prisma/client/edge';
    import { applyAction, enhance } from '$app/forms';
    import { onSubmit, msgClosed, conv2DArrayToObject } from '$lib/utils';
    import { slide } from 'svelte/transition';

    export let systemData: launcher_system;
    let { RainJP, RainUS, RainEU, update, debug, client_data, rain_admins }: launcher_system = systemData;

    /* Below is the edit mode script
    ====================================================*/
    const catTypes: { [key in keyof Omit<launcher_system, 'id'>]: boolean } = {
        RainJP: false,
        RainUS: false,
        RainEU: false,
        update: false,
        debug: false,
        client_data: false,
        rain_admins: false,
    };

    const editModeSwitch = <T extends keyof Omit<launcher_system, 'id'>>(type: T): void | false => {
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
                const key = _key as keyof Omit<launcher_system, 'id'>;
                catTypes[key] = false;
            });

            // set the category clicked to true (open)
            catTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        catTypes[type] = !catTypes[type];
    };

    const updateSystemValue = async (data: Record<string, any>): Promise<void> => {
        const column = Object.keys(data)[0] as keyof Omit<launcher_system, 'id'> | 'client_data_0' | 'client_data_1' | 'maint_all';
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

            case 'rain_admins': {
                rain_admins = value.split(',');
                break;
            }

            default: {
                throw new Error(`${column} is invalid column.`);
            }
        }
    };

    const onChangeInputElm = (e: Event, type?: 'jp' | 'us' | 'eu' | 'all' | 'update' | 'debug' | 'force') => {
        switch (type) {
            case 'jp':
            case 'us':
            case 'eu':
            case 'all':
            case 'update':
            case 'debug':
            case 'force': {
                document.getElementsByClassName(type)[0].textContent = 'radio_button_unchecked';
                document.getElementsByClassName(type)[1].textContent = 'radio_button_unchecked';
                const elm = (e.currentTarget as HTMLInputElement).previousElementSibling;
                elm!.textContent = 'radio_button_checked';

                break;
            }

            default: {
                throw new Error(`${type} is invalid type.`);
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
                    await updateSystemValue(data);
                }
            };
        }}
    >
        <dl class="console_contents_list">
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
                                        <span class="material-icons-outlined jp">{RainJP ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainJP" id="rain_jp_enable" value="true" checked={RainJP} on:change={(e) => onChangeInputElm(e, 'jp')} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_jp_disable">
                                        <span class="material-icons-outlined jp">{!RainJP ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainJP" id="rain_jp_disable" value="false" checked={!RainJP} on:change={(e) => onChangeInputElm(e, 'jp')} />
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
                                        <span class="material-icons-outlined us">{RainUS ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainUS" id="rain_us_enable" value="true" checked={RainUS} on:change={(e) => onChangeInputElm(e, 'us')} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_us_disable">
                                        <span class="material-icons-outlined us">{!RainUS ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainUS" id="rain_us_disable" value="false" checked={!RainUS} on:change={(e) => onChangeInputElm(e, 'us')} />
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
                                        <span class="material-icons-outlined eu">{RainEU ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainEU" id="rain_eu_enable" value="true" checked={RainEU} on:change={(e) => onChangeInputElm(e, 'eu')} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="rain_eu_disable">
                                        <span class="material-icons-outlined eu">{!RainEU ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="RainEU" id="rain_eu_disable" value="false" checked={!RainEU} on:change={(e) => onChangeInputElm(e, 'eu')} />
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
                <ul class="edit_area_box_parts radio" class:disabled_elm={catTypes.RainJP || catTypes.RainEU || catTypes.RainUS}>
                    <li>
                        <label style="width: 110px;" for="enable_all">
                            <span class="material-icons-outlined all">radio_button_unchecked</span>
                            <input type="radio" name="maint_all" id="enable_all" value="true" on:change={(e) => onChangeInputElm(e, 'all')} />
                            Enable All
                        </label>
                    </li>
                    <li>
                        <label style="width: 110px;" for="disable_all">
                            <span class="material-icons-outlined all">radio_button_checked</span>
                            <input type="radio" name="maint_all" id="disable_all" value="false" checked on:change={(e) => onChangeInputElm(e, 'all')} />
                            Disable All
                        </label>
                    </li>
                </ul>

                <button
                    class="blue_btn"
                    class:disabled_elm={catTypes.RainJP || catTypes.RainEU || catTypes.RainUS}
                    type="submit"
                    formaction="?/updateAllMaintData"
                    on:click={() => {
                        onSubmit.set(true);
                    }}
                >
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
                                        <span class="material-icons-outlined update">{update ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="update" id="update_enable" value="true" checked={update} on:change={(e) => onChangeInputElm(e, 'update')} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="update_disable">
                                        <span class="material-icons-outlined update">{!update ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="update" id="update_disable" value="false" checked={!update} on:change={(e) => onChangeInputElm(e, 'update')} />
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
                                        <span class="material-icons-outlined debug">{debug ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="debug" id="debug_enable" value="true" checked={debug} on:change={(e) => onChangeInputElm(e, 'debug')} />
                                        Enable
                                    </label>
                                </li>
                                <li>
                                    <label for="debug_disable">
                                        <span class="material-icons-outlined debug">{!debug ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="debug" id="debug_disable" value="false" checked={!debug} on:change={(e) => onChangeInputElm(e, 'debug')} />
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

            <dt class="contents_term">Client Data</dt>
            <dd class="contents_desc">
                {client_data[0]} [ version of client data ]
                <br />
                {client_data[1]} [ whether to force an update ]

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
                                        <span class="material-icons-outlined force">{client_data[1] === 'force' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input type="radio" name="client_data_1" id="update_force" value="force" checked={client_data[1] === 'force'} on:change={(e) => onChangeInputElm(e, 'force')} />
                                        Force
                                    </label>
                                </li>
                                <li>
                                    <label for="update_not_force">
                                        <span class="material-icons-outlined force">{client_data[1] === 'not_force' ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        <input
                                            type="radio"
                                            name="client_data_1"
                                            id="update_not_force"
                                            value="not_force"
                                            checked={client_data[1] === 'not_force'}
                                            on:change={(e) => onChangeInputElm(e, 'force')}
                                        />
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

            <dt class="contents_term">Rain Admins</dt>
            <dd class="contents_desc">
                {rain_admins.join(' / ')}

                {#if catTypes['rain_admins']}
                    <button class="red_btn" type="button" on:click={() => editModeSwitch('rain_admins')}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">Cancel</span>
                    </button>
                {:else}
                    <button class="normal_btn" type="button" on:click={() => editModeSwitch('rain_admins')}>
                        <span class="btn_icon material-icons">mode_edit</span>
                        <span class="btn_text">Edit</span>
                    </button>
                {/if}

                {#if catTypes['rain_admins']}
                    <div transition:slide class="edit_area_box">
                        <div class="edit_area enter">
                            <p class="edit_area_title">Change the Admins' Username</p>
                            <p class="console_contents_note">* Empty isn't allowed.</p>
                            <dl class="edit_area_box_parts text">
                                <dt>Enter the Username</dt>
                                <dd>
                                    <input type="text" name="rain_admins" value={rain_admins} autocomplete="off" />
                                </dd>
                            </dl>

                            <button
                                class="blue_btn"
                                type="submit"
                                on:click={() => {
                                    onSubmit.set(true);
                                    editModeSwitch('rain_admins');
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
