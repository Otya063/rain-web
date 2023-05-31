<script lang="ts">
    export let info: LauncherInfo[];

    interface LauncherInfo {
        id: number;
        title: string;
        url: string;
        info_type: string;
        created_at: Date;
    }

    let adding: boolean = false;
    const addInfoMode = (isAddingMode: boolean) => {
        adding = isAddingMode;
    };
</script>

<form class="console_form" action="?/infoData" method="POST">
    {#if adding === false}
        <ul class="info_list_group">
            <p>Launcher Information</p>
            {#each info as info_data}
                <li class="setting_list_group_item">
                    <p>[Launcher Info Data]</p>
                    <p>{info_data.title}</p>
                    <p>{info_data.url}</p>
                    <p>{info_data.info_type}</p>
                    <p>{info_data.created_at}</p>

                    <button>[Edit]</button>
                </li>
            {/each}
        </ul>

        <button on:click={() => addInfoMode(true)}>[Add]</button>
    {:else}
        <ul class="info_list_group">
            <p>Launcher Information</p>
            <li class="system_list_group_item">
                <label for="info_title">Title</label>
                <input id="info_title" type="text" name="info_title" />

                <label for="info_url">URL</label>
                <input id="info_url" type="text" name="info_url" />

                <div>
                    <label for="info_type">Info Type</label>
                    <input id="Important" type="radio" name="info_type" value="Important" />
                    <label for="Important">Important</label>

                    <input id="Defects and Troubles" type="radio" name="info_type" value="Defects and Troubles" />
                    <label for="Defects and Troubles">Defects and Troubles</label>

                    <input id="Management and Service" type="radio" name="info_type" value="Management and Service" />
                    <label for="Management and Service">Management and Service</label>

                    <input id="In-Game Events" type="radio" name="info_type" value="In-Game Events" />
                    <label for="In-Game Events">In-Game Events</label>

                    <input id="Updates and Maintenance" type="radio" name="info_type" value="Updates and Maintenance" />
                    <label for="Updates and Maintenance">Updates and Maintenance</label>
                </div>
            </li>
        </ul>

        <div>
            <button type="submit">[Save]</button>
            <button on:click={() => addInfoMode(false)}>[Cancel]</button>
        </div>
    {/if}
</form>
