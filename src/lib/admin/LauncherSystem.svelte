<script lang="ts">
    import { slide } from 'svelte/transition';
    import { clicked_submit, editMode } from '$ts/main';

    export let systemData;
    const { RainJP, RainUS, RainEU, update }: { RainJP: boolean; RainUS: boolean; RainEU: boolean; update: boolean } = systemData;

    /* Below is the edit mode script
    ====================================================*/
    let active_form: string | '' = '';
    interface FormType {
        [key: string]: boolean;
    }
    const forms: FormType = {
        form1: false,
        form2: false,
        form3: false,
        form4: false,
    };
    const editModeHandle = (index: number) => {
        if (!$editMode) {
            // when editing
            editMode.set(true);
            const form_key = `form${index}`;

            if (active_form !== '') {
                forms[active_form] = false;
            }

            forms[form_key] = true;
            active_form = form_key;
        } else {
            // when finished editing
            const form_key = `form${index}`;

            if (active_form !== '' && active_form !== form_key) {
                forms[active_form] = false;
                forms[form_key] = true;
                active_form = form_key;
            } else {
                forms[form_key] = !forms[form_key];
                if (forms[form_key] === false) {
                    active_form = '';
                    editMode.set(false);
                }
            }
        }
    };
</script>

<h2>
    <span class="material-icons">engineering</span>
    Servers Maintenance Status
</h2>
<div class="console_contents">
    <p class="console_contents_note">* This data will be fetched when users click the login button on the launcher.</p>
    <dl class="console_contents_list">
        <!-- Rain (JP) Maintenance Setting -->
        <dt class="contents_term">Rain (JP)</dt>
        <dd class="contents_desc">
            {#if RainJP}
                Enable
            {:else}
                Disable
            {/if}

            {#if forms['form1']}
                <button class="cancel_btn" on:click={() => editModeHandle(1)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>
            {:else}
                <button class="edit_btn" on:click={() => editModeHandle(1)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
            {/if}

            {#if forms['form1']}
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

                        <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
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

            {#if forms['form2']}
                <button class="cancel_btn" on:click={() => editModeHandle(2)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>
            {:else}
                <button class="edit_btn" on:click={() => editModeHandle(2)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
            {/if}

            {#if forms['form2']}
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

                        <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
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

            {#if forms['form3']}
                <button class="cancel_btn" on:click={() => editModeHandle(3)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>
            {:else}
                <button class="edit_btn" on:click={() => editModeHandle(3)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
            {/if}

            {#if forms['form3']}
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

                        <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
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

            <button style="width: 15%;" on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                <span class="material-icons">check</span>
                Save
            </button>
        </div>
    </form>
</div>

<h2>
    <span class="material-icons">update</span>
    Launcher Update Status
</h2>
<div class="console_contents">
    <p class="console_contents_note">* This data will be fetched when users start the game.</p>
    <dl class="console_contents_list">
        <!-- Update Setting -->
        <dt class="contents_term">Update Mode</dt>
        <dd class="contents_desc">
            {#if update}
                Enable
            {:else}
                Disable
            {/if}

            {#if forms['form4']}
                <button class="cancel_btn" on:click={() => editModeHandle(4)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>
            {:else}
                <button class="edit_btn" on:click={() => editModeHandle(4)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
            {/if}

            {#if forms['form4']}
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

                        <button on:click={() => clicked_submit.set(true)} class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
                        </button>
                    </div>
                </form>
            {/if}
        </dd>
    </dl>
</div>
