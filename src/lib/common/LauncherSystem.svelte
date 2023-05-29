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

<form action="?/maintUpdateData" method="POST">
    {#if editing === false}
        <dl class="maintenance">
            <dt>RainJP</dt>
            <dd>
                {maint_jp}
            </dd>

            <dt>RainUS</dt>
            <dd>
                {maint_us}
            </dd>

            <dt>RainEU</dt>
            <dd>
                {maint_eu}
            </dd>
        </dl>
        <dl class="update">
            <dt>UpdateMode</dt>
            <dd>
                {update}
            </dd>
        </dl>
        <button on:click={() => setEditing(true)}>Edit</button>
    {:else}
        <div>
            <label for="rain_jp">Rain (JP)</label>
            <input id="rain_jp" type="checkbox" name="rain_jp" checked={maint_jp} />
        </div>

        <div>
            <label for="rain_us">Rain (US)</label>
            <input id="rain_us" type="checkbox" name="rain_us" checked={maint_us} />
        </div>

        <div>
            <label for="rain_eu">Rain (EU)</label>
            <input id="rain_eu" type="checkbox" name="rain_eu" checked={maint_eu} />
        </div>

        <div>
            <label for="update_mode">Update Mode</label>
            <input id="update_mode" type="checkbox" name="update_mode" checked={update} />
        </div>
        <button type="submit">Save</button>
        <button on:click={() => setEditing(false)}>Cancel</button>
    {/if}
</form>
