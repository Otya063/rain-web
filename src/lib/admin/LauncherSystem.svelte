<script lang="ts">
    export let system_data;
    const { RainJP, RainUS, RainEU, update }: { RainJP: boolean; RainUS: boolean; RainEU: boolean; update: boolean } = system_data;

    let editing: boolean = false;
    const editSystemMode = (isEditing: boolean) => {
        editing = isEditing;
    };
</script>

{#if editing}
    <form class="console_form_section" style="align-items: center;" action="?/updateSystemData" method="POST">
        <ul class="each_item_contents_list">
            <p class="console_head">Launcher Maintenance Status</p>
            <li class="each_item_contents">
                <label for="rain_jp">Rain (JP)</label>
                <input id="rain_jp" type="checkbox" name="rain_jp" checked={RainJP} />
            </li>

            <li class="each_item_contents">
                <label for="rain_us">Rain (US)</label>
                <input id="rain_us" type="checkbox" name="rain_us" checked={RainUS} />
            </li>

            <li class="each_item_contents">
                <label for="rain_eu">Rain (EU)</label>
                <input id="rain_eu" type="checkbox" name="rain_eu" checked={RainEU} />
            </li>
        </ul>

        <ul class="each_item_contents_list">
            <p class="console_head">Launcher Update Mode Status</p>
            <li class="each_item_contents">
                <label for="update_mode">Update Mode</label>
                <input id="update_mode" type="checkbox" name="update_mode" checked={update} />
            </li>
        </ul>

        <div class="save_cancel_btn">
            <button type="submit">[Save]</button>
            <button on:click={() => editSystemMode(false)}>[Cancel]</button>
        </div>
    </form>
{:else}
    <h2>
        <span class="material-icons">engineering</span>
        Launcher Maintenance Status
    </h2>
    <div class="console_contents">
        <dl class="console_contents_form">
            <dt class="contents_term">Rain (JP)</dt>
            <dd class="contents_desc">
                <div class="edit_area">
                    <p class="edit_area_title">Change Settings</p>
                    <ul class="edit_form">
                        <li>
                            <label for="rain_jp_enable">
                                <input type="radio" name="rain_jp" id="rain_jp_enable" />
                                Enable
                            </label>
                        </li>
                        <li>
                            <label for="rain_jp_disable">
                                <input type="radio" name="rain_jp" id="rain_jp_disable" />
                                Disable
                            </label>
                        </li>
                    </ul>
                </div>
            </dd>

            <dt class="contents_term">Rain (US)</dt>
            <dd class="contents_desc">{RainUS}</dd>

            <dt class="contents_term">Rain (EU)</dt>
            <dd class="contents_desc">{RainEU}</dd>
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

    <button class="edit_btn" on:click={() => editSystemMode(true)}>[Edit]</button>
{/if}
