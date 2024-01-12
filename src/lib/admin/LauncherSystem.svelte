<script lang="ts">
    import { slide } from 'svelte/transition';
    import { clicked_submit, editMode } from '$ts/main';
    import type { launcher_system } from '@prisma/client/edge';

    export let systemData;
    const { RainJP, RainUS, RainEU, update, debug, client_data }: launcher_system = systemData;

    /* Below is the edit mode script
    ====================================================*/
    interface CategoryType {
        [key: string]: boolean;
    }
    const catTypes: CategoryType = {
        rainJP: false,
        rainUS: false,
        rainEU: false,
        update: false,
        debug: false,
        client_data: false,
    };

    const editModeHandle = (type: keyof CategoryType) => {
        // check if another cat type is already open
        const activeCat = Object.values(catTypes).some((boolean) => boolean === true);

        // if an open cat is clicked (try to close it), close it
        if (catTypes[type]) {
            catTypes[type] = false;
            editMode.set(false);

            return false;
        }

        // if there is an open cat and a different category is cliked (try to open it)
        if (activeCat) {
            // set everything to false (close) in a loop.
            Object.keys(catTypes).forEach((key) => {
                catTypes[key] = false;
            });

            // set the category clicked to true (open)
            catTypes[type] = true;

            return false;
        }

        // toggle true <-> false
        catTypes[type] = !catTypes[type];

        editMode.set(!$editMode ? true : false);
    };
</script>

<h2>
    <span class="material-icons">engineering</span>
    Servers Maintenance Settings
</h2>
<div class="console_contents">
    <p class="console_contents_note">* These data will be fetched when users click the login button on the launcher.</p>
    <dl class="console_contents_list">
        <!-- Rain (JP) Maintenance Setting -->
        <dt class="contents_term">Rain (JP)</dt>
        <dd class="contents_desc">
            {#if RainJP}
                Enable
            {:else}
                Disable
            {/if}

            {#if catTypes['rainJP']}
                <button class="red_btn" on:click={() => editModeHandle('rainJP')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('rainJP')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['rainJP']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area select">
                        <p class="edit_area_title">Change Setting</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>

        <!-- Rain (US) Maintenance Setting -->
        <dt class="contents_term">Rain (US)</dt>
        <dd class="contents_desc">
            {#if RainUS}
                Enable
            {:else}
                Disable
            {/if}

            {#if catTypes['rainUS']}
                <button class="red_btn" on:click={() => editModeHandle('rainUS')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('rainUS')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['rainUS']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area select">
                        <p class="edit_area_title">Change Setting</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>

        <!-- Rain (EU) Maintenance Setting -->
        <dt class="contents_term">Rain (EU)</dt>
        <dd class="contents_desc">
            {#if RainEU}
                Enable
            {:else}
                Disable
            {/if}

            {#if catTypes['rainEU']}
                <button class="red_btn" on:click={() => editModeHandle('rainEU')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('rainEU')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['rainEU']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area select">
                        <p class="edit_area_title">Change Setting</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>
    </dl>

    <form class="edit_area_form" action="?/updateSystemMode" method="POST">
        <div class="edit_area select">
            <p class="edit_area_title">Change All Settings</p>
            <ul class="edit_area_form_parts radio">
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

            <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                <span class="btn_icon material-icons">check</span>
                <span class="btn_text">Save</span>
            </button>
        </div>
    </form>
</div>

<h2>
    <span class="material-icons">update</span>
    Launcher Update & Other Settings
</h2>
<div class="console_contents">
    <dl class="console_contents_list">
        <!-- Update Mode Setting -->
        <dt class="contents_term">Update Mode</dt>
        <dd class="contents_desc">
            {#if update}
                Enable
            {:else}
                Disable
            {/if}
            <p class="console_contents_note">* This data will be fetched when users start the game.</p>

            {#if catTypes['update']}
                <button class="red_btn" on:click={() => editModeHandle('update')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('update')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['update']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area select">
                        <p class="edit_area_title">Change Setting</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>

        <!-- Debug Mode Setting -->
        <dt class="contents_term">Debug Mode</dt>
        <dd class="contents_desc">
            {#if debug}
                Enable
            {:else}
                Disable
            {/if}
            <p class="console_contents_note">* This data will be fetched when the users run the Rain launcher.</p>

            {#if catTypes['debug']}
                <button class="red_btn" on:click={() => editModeHandle('debug')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('debug')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['debug']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area select">
                        <p class="edit_area_title">Change Setting</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>

        <!-- Launcher Version -->
        <dt class="contents_term">Client Data</dt>
        <dd class="contents_desc">
            {client_data[0]} (The version of client data)
            <br />
            {client_data[1]} (Whether to force updating client data)
            <p class="console_contents_note">* This is an alternative to the patch server, but the installation isn't automatic.</p>

            {#if catTypes['client_data']}
                <button class="red_btn" on:click={() => editModeHandle('client_data')}>
                    <span class="btn_icon material-icons">close</span>
                    <span class="btn_text">Cancel</span>
                </button>
            {:else}
                <button class="normal_btn" on:click={() => editModeHandle('client_data')}>
                    <span class="btn_icon material-icons">mode_edit</span>
                    <span class="btn_text">Edit</span>
                </button>
            {/if}

            {#if catTypes['client_data']}
                <form transition:slide class="edit_area_form" action="?/updateSystemMode" method="POST">
                    <div class="edit_area enter">
                        <p class="edit_area_title">Change the Version of Client Data</p>
                        <dl class="edit_area_form_parts text">
                            <dt>Enter the version</dt>
                            <dd>
                                <input type="number" name="client_data_0" step="0.1" inputmode="decimal" pattern="\d*" value={client_data[0]} placeholder="Enter the version" />
                            </dd>
                        </dl>
                    </div>

                    <div class="edit_area select">
                        <p class="edit_area_title">Select Whether to Force</p>
                        <ul class="edit_area_form_parts radio">
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

                        <button on:click={() => clicked_submit.set(true)} class="blue_btn" type="submit">
                            <span class="btn_icon material-icons">check</span>
                            <span class="btn_text">Save</span>
                        </button>
                    </div>
                </form>
            {/if}
        </dd>
    </dl>
</div>
