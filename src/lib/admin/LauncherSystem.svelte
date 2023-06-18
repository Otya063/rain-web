<script lang="ts">
    export let system_data;
    const { RainJP, RainUS, RainEU, update }: { RainJP: boolean; RainUS: boolean; RainEU: boolean; update: boolean } = system_data;

    let forms: Record<string, boolean> = {
        form1: false,
        form2: false,
        form3: false,
    };
    let editing: boolean = false;
    let active_form: string | '' = '';
    const editMode = (index: number) => {
        if (!editing) {
            // when editing
            editing = true;
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
                    editing = false;
                }
            }
        }
    };
</script>

<h2>
    <span class="material-icons">engineering</span>
    Launcher Maintenance Mode
</h2>
<div class="console_contents">
    <dl class="console_contents_form">
        <!-- Rain (JP) Maintenance Setting -->
        <dt class="contents_term">Rain (JP)</dt>
        <dd class="contents_desc">
            {#if RainJP}
                Enable
            {:else}
                Disable
            {/if}

            {#if forms['form1']}
                <button class="cancel_btn" on:click={() => editMode(1)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>

                <form action="?/updateMaintenanceMode" method="POST">
                    <div class="edit_area">
                        <p class="edit_area_title">Change Settings</p>
                        <ul class="edit_area_form">
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

                        <button class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
                        </button>
                    </div>
                </form>
            {:else}
                <button class="edit_btn" on:click={() => editMode(1)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
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
                <button class="cancel_btn" on:click={() => editMode(2)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>

                <form action="?/updateMaintenanceMode" method="POST">
                    <div class="edit_area">
                        <p class="edit_area_title">Change Settings</p>
                        <ul class="edit_area_form">
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

                        <button class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
                        </button>
                    </div>
                </form>
            {:else}
                <button class="edit_btn" on:click={() => editMode(2)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
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
                <button class="cancel_btn" on:click={() => editMode(3)}>
                    <span class="material-icons">close</span>
                    Cancel
                </button>

                <form action="?/updateMaintenanceMode" method="POST">
                    <div class="edit_area">
                        <p class="edit_area_title">Change Settings</p>
                        <ul class="edit_area_form">
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

                        <button class="save_btn" type="submit">
                            <span class="material-icons">check</span>
                            Save
                        </button>
                    </div>
                </form>
            {:else}
                <button class="edit_btn" on:click={() => editMode(3)}>
                    <span class="material-icons">mode_edit</span>
                    Edit
                </button>
            {/if}
        </dd>
    </dl>
</div>

<h2>
    <span class="material-icons">update</span>
    Launcher Update Mode Status
</h2>
<div class="console_contents">
    <li class="each_item_contents">
        <p>Update Mode</p>
        <span>
            {update}
        </span>
    </li>
</div>
