<script lang="ts">
    export let maint_jp: boolean;
    export let maint_us: boolean;
    export let maint_eu: boolean;
    export let update: boolean;
    let editing: boolean = false;

    const setEditing = (isEditing: boolean) => {
        editing = isEditing;
    };
</script>

<form class="console_form" action="?/maintUpdateData" method="POST">
    {#if editing === false}
        <ul class="setting_list_group maintenance">
            <p>Launcher Maintenance Status</p>
            <li class="setting_list_group_item">
                <p>Rain (JP)</p>
                <span>
                    {maint_jp}
                </span>
            </li>

            <li class="setting_list_group_item">
                <p>Rain (US)</p>
                <span>
                    {maint_us}
                </span>
            </li>

            <li class="setting_list_group_item">
                <p>Rain (EU)</p>
                <span>
                    {maint_eu}
                </span>
            </li>
        </ul>
        <ul class="setting_list_group update">
            <p>Launcher Update Mode Statue</p>
            <li class="setting_list_group_item">
                <p>Update Mode</p>
                <span>
                    {update}
                </span>
            </li>
        </ul>
        <button on:click={() => setEditing(true)}>[Edit]</button>
    {:else}
        <ul class="setting_list_group">
            <p>Launcher Maintenance Status</p>
            <li class="setting_list_group_item">
                <label for="rain_jp">Rain (JP)</label>
                <input id="rain_jp" type="checkbox" name="rain_jp" checked={maint_jp} />
            </li>

            <li class="setting_list_group_item">
                <label for="rain_us">Rain (US)</label>
                <input id="rain_us" type="checkbox" name="rain_us" checked={maint_us} />
            </li>

            <li class="setting_list_group_item">
                <label for="rain_eu">Rain (EU)</label>
                <input id="rain_eu" type="checkbox" name="rain_eu" checked={maint_eu} />
            </li>
        </ul>

        <ul class="setting_list_group">
            <p>Launcher Update Mode Statue</p>
            <li class="setting_list_group_item">
                <label for="update_mode">Update Mode</label>
                <input id="update_mode" type="checkbox" name="update_mode" checked={update} />
            </li>
        </ul>

        <div>
            <button type="submit">[Save]</button>
            <button on:click={() => setEditing(false)}>[Cancel]</button>
        </div>
    {/if}
</form>
