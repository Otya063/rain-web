<script lang="ts">
    export let system_data;
    const { RainJP, RainUS, RainEU, update } = system_data;

    let editing: boolean = false;
    const editSystemMode = (isEditing: boolean) => {
        editing = isEditing;
    };
</script>

<li class="console_contents_list_item">
    <form class="console_form_section" style="align-items: center;" action="?/updateSystemData" method="POST">
        {#if editing}
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
        {:else}
            <ul class="each_item_contents_list maintenance">
                <p class="console_head">Launcher Maintenance Status</p>
                <li class="each_item_contents">
                    <p>Rain (JP)</p>
                    <span>
                        {RainJP}
                    </span>
                </li>

                <li class="each_item_contents">
                    <p>Rain (US)</p>
                    <span>
                        {RainUS}
                    </span>
                </li>

                <li class="each_item_contents">
                    <p>Rain (EU)</p>
                    <span>
                        {RainEU}
                    </span>
                </li>
            </ul>

            <ul class="each_item_contents_list update">
                <p class="console_head">Launcher Update Mode Status</p>
                <li class="each_item_contents">
                    <p>Update Mode</p>
                    <span>
                        {update}
                    </span>
                </li>
            </ul>

            <button class="edit_btn" on:click={() => editSystemMode(true)}>[Edit]</button>
        {/if}
    </form>
</li>
