<script lang="ts">
    export let system;
    const { maint_jp, maint_us, maint_eu, update } = system;

    let editing: boolean = false;
    const editSystemMode = (isEditing: boolean) => {
        editing = isEditing;
    };
</script>

<ul class="console_contents">
    <li class="console_contents_list_item">
        <form class="console_form_section" style="align-items: center;" action="?/maintUpdateData" method="POST">
            {#if editing === false}
                <ul class="each_item_contents_list maintenance">
                    <p class="console_head">Launcher Maintenance Status</p>
                    <li class="each_item_contents">
                        <p>Rain (JP)</p>
                        <span>
                            {maint_jp}
                        </span>
                    </li>

                    <li class="each_item_contents">
                        <p>Rain (US)</p>
                        <span>
                            {maint_us}
                        </span>
                    </li>

                    <li class="each_item_contents">
                        <p>Rain (EU)</p>
                        <span>
                            {maint_eu}
                        </span>
                    </li>
                </ul>

                <ul class="each_item_contents_list update">
                    <p class="console_head">Launcher Update Mode Statue</p>
                    <li class="each_item_contents">
                        <p>Update Mode</p>
                        <span>
                            {update}
                        </span>
                    </li>
                </ul>

                <button class="edit_btn" on:click={() => editSystemMode(true)}>[Edit]</button>
            {:else}
                <ul class="each_item_contents_list">
                    <p class="console_head">Launcher Maintenance Status</p>
                    <li class="each_item_contents">
                        <label for="rain_jp">Rain (JP)</label>
                        <input id="rain_jp" type="checkbox" name="rain_jp" checked={maint_jp} />
                    </li>

                    <li class="each_item_contents">
                        <label for="rain_us">Rain (US)</label>
                        <input id="rain_us" type="checkbox" name="rain_us" checked={maint_us} />
                    </li>

                    <li class="each_item_contents">
                        <label for="rain_eu">Rain (EU)</label>
                        <input id="rain_eu" type="checkbox" name="rain_eu" checked={maint_eu} />
                    </li>
                </ul>

                <ul class="each_item_contents_list">
                    <p class="console_head">Launcher Update Mode Statue</p>
                    <li class="each_item_contents">
                        <label for="update_mode">Update Mode</label>
                        <input id="update_mode" type="checkbox" name="update_mode" checked={update} />
                    </li>
                </ul>

                <div class="save_cancel_btn">
                    <button type="submit">[Save]</button>
                    <button on:click={() => editSystemMode(false)}>[Cancel]</button>
                </div>
            {/if}
        </form>
    </li>
</ul>
