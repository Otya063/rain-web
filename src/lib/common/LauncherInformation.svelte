<script lang="ts">
    export let info: LauncherInfo[];

    interface LauncherInfo {
        id: string;
        title: string;
        url: string;
        info_type: string;
        created_at: Date;
    }

    let adding: boolean = false;
    const addInfoMode = (isAddingMode: boolean) => {
        adding = isAddingMode;
    };

    let edit_id: string;
    const editInfoMode = (id: string = '') => {
        edit_id = id;
    };
</script>

<form class="console_form" action="?/infoData" method="POST">
    {#if adding === false}
        <ul class="info_list_group">
            <p>Launcher Information</p>
            {#each info as info_data}
                <li class="info_list_group_item">
                    {#if edit_id !== info_data.id}
                        <p>[{info_data.info_type}]</p>
                        <p>{info_data.title}</p>
                        <p>{info_data.url}</p>
                        <p>{info_data.created_at}</p>
                        <button on:click={() => editInfoMode(info_data.id)}>[Edit]</button>
                    {:else}
                        <label for="info_title">Title</label>
                        <input id="info_title" type="text" name="info_title" value={info_data.title} autocomplete="off" />

                        <label for="info_url">URL</label>
                        <input id="info_url" type="text" name="info_url" value={info_data.url} autocomplete="off" />

                        <div class="info_type_group">
                            <label for="info_type">Info Type</label>

                            <label for="Important">
                                <input id="Important" type="radio" name="info_type" value="Important" checked={info_data.info_type === 'Important'} />
                                Important
                            </label>

                            <label for="Defects and Troubles">
                                <input id="Defects and Troubles" type="radio" name="info_type" value="Defects and Troubles" checked={info_data.info_type === 'Defects and Troubles'} />
                                Defects and Troubles
                            </label>

                            <label for="Management and Service">
                                <input id="Management and Service" type="radio" name="info_type" value="Management and Service" checked={info_data.info_type === 'Management and Service'} />

                                Management and Service
                            </label>

                            <label for="In-Game Events">
                                <input id="In-Game Events" type="radio" name="info_type" value="In-Game Events" checked={info_data.info_type === 'In-Game Events'} />
                                In-Game Events
                            </label>

                            <label for="Updates and Maintenance">
                                <input id="Updates and Maintenance" type="radio" name="info_type" value="Updates and Maintenance" checked={info_data.info_type === 'Updates and Maintenance'} />
                                Updates and Maintenance
                            </label>
                        </div>

                        <div>
                            <button type="submit">[Save]</button>
                            <button on:click={() => editInfoMode()}>[Cancel]</button>
                        </div>
                    {/if}
                </li>
            {/each}
        </ul>

        <button on:click={() => addInfoMode(true)}>[Add]</button>
    {:else}
        <ul class="info_list_group">
            <p>Launcher Information</p>
            <li class="info_list_group_item">
                <label for="info_title">Title</label>
                <input id="info_title" type="text" name="info_title" />

                <label for="info_url">URL</label>
                <input id="info_url" type="text" name="info_url" />

                <div class="info_type_group">
                    <label for="info_type">Info Type</label>

                    <label for="Important">
                        <input id="Important" type="radio" name="info_type" value="Important" />
                        Important
                    </label>

                    <label for="Defects and Troubles">
                        <input id="Defects and Troubles" type="radio" name="info_type" value="Defects and Troubles" />
                        Defects and Troubles
                    </label>

                    <label for="Management and Service">
                        <input id="Management and Service" type="radio" name="info_type" value="Management and Service" />
                        Management and Service
                    </label>

                    <label for="In-Game Events">
                        <input id="In-Game Events" type="radio" name="info_type" value="In-Game Events" />
                        In-Game Events
                    </label>

                    <label for="Updates and Maintenance">
                        <input id="Updates and Maintenance" type="radio" name="info_type" value="Updates and Maintenance" />
                        Updates and Maintenance
                    </label>
                </div>
            </li>
        </ul>

        <div>
            <button type="submit">[Save]</button>
            <button on:click={() => addInfoMode(false)}>[Cancel]</button>
        </div>
    {/if}
</form>
