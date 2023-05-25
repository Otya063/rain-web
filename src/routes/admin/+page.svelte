<script lang="ts">
    export let data;
    const { maint_jp, maint_us, maint_eu, update } = data.launcher_system!;
</script>

<p>This is an admin page.</p>

<form action="?/storeData" method="POST">
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
</form>

<section class="data_transfer_section">
    <dl class="maintenance">
        <dt>RainJP</dt>
        <dd>
            {#if maint_jp}
                true
            {:else}
                false
            {/if}
        </dd>

        <dt>RainUS</dt>
        <dd>
            {#if maint_us}
                true
            {:else}
                false
            {/if}
        </dd>

        <dt>RainEU</dt>
        <dd>
            {#if maint_eu}
                true
            {:else}
                false
            {/if}
        </dd>
    </dl>

    <dl class="update">
        <dt>UpdateMode</dt>
        <dd>
            {#if update}
                true
            {:else}
                false
            {/if}
        </dd>
    </dl>
</section>
