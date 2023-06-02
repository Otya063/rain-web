<script lang="ts">
    import { convUnixToDate } from '$ts/main';

    export let info: LauncherInfo[];

    interface LauncherInfo {
        id: number;
        title: string;
        url: string;
        type: string;
        created_at: number;
    }

    let adding: boolean = false;
    const addInfoMode = (isAddingMode: boolean) => {
        adding = isAddingMode;
    };

    let edit_id: number;
    const editInfoMode = (id: number) => {
        edit_id = id;
    };
</script>

{#if adding}
    <div class="info_list_group">
        <form class="create_info_form" action="?/createInfoData" method="POST">
            <p>Launcher Info Addition Form</p>
            <label for="info_title">
                Title:
                <input id="info_title" type="text" name="info_title" />
            </label>

            <label for="info_url">
                URL:
                <input id="info_url" type="text" name="info_url" />
            </label>

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

            <div class="save_cancel_btn">
                <button type="submit">[Save]</button>
                <button on:click={() => addInfoMode(false)}>[Cancel]</button>
            </div>
        </form>
    </div>
{:else}
    <ul class="info_list_group">
        <p>Launcher Information</p>
        {#each info as info_data}
            <li class="info_list_group_item">
                {#if edit_id === info_data.id}
                    <form class="update_info_form" action="?/updateInfoData" method="POST">
                        <p>[{info_data.type}]</p>

                        <input type="hidden" name="info_id" value={edit_id} />

                        <label for="info_title">
                            Title:
                            <input id="info_title" type="text" name="info_title" value={info_data.title} autocomplete="off" />
                        </label>

                        <label for="info_url">
                            URL:
                            <input id="info_url" type="text" name="info_url" value={info_data.url} autocomplete="off" />
                        </label>

                        <div class="info_type_group">
                            <label for="info_type">Info Type</label>

                            <label for="Important">
                                <input id="Important" type="radio" name="info_type" value="Important" checked={info_data.type === 'Important'} />
                                Important
                            </label>

                            <label for="Defects and Troubles">
                                <input id="Defects and Troubles" type="radio" name="info_type" value="Defects and Troubles" checked={info_data.type === 'Defects and Troubles'} />
                                Defects and Troubles
                            </label>

                            <label for="Management and Service">
                                <input id="Management and Service" type="radio" name="info_type" value="Management and Service" checked={info_data.type === 'Management and Service'} />
                                Management and Service
                            </label>

                            <label for="In-Game Events">
                                <input id="In-Game Events" type="radio" name="info_type" value="In-Game Events" checked={info_data.type === 'In-Game Events'} />
                                In-Game Events
                            </label>

                            <label for="Updates and Maintenance">
                                <input id="Updates and Maintenance" type="radio" name="info_type" value="Updates and Maintenance" checked={info_data.type === 'Updates and Maintenance'} />
                                Updates and Maintenance
                            </label>
                        </div>

                        <label for="info_date">
                            Date:
                            <input id="info_date" name="info_date" type="date" value={convUnixToDate(info_data.created_at, false)} />
                        </label>

                        <div class="save_cancel_btn">
                            <button type="submit">[Save]</button>
                            <button on:click={() => editInfoMode(0)}>[Cancel]</button>
                        </div>
                    </form>
                {:else}
                    <ul>
                        <p>[{info_data.type}]</p>
                        <li>
                            <p>Title:</p>
                            <span>{info_data.title}</span>
                        </li>
                        <li>
                            <p>URL:</p>
                            <span>{info_data.url}</span>
                        </li>
                        <li>
                            <p>Date:</p>
                            <span>{convUnixToDate(info_data.created_at, true)}</span>
                        </li>
                    </ul>
                    <button on:click={() => editInfoMode(info_data.id)}>[Edit]</button>
                {/if}
            </li>
        {/each}
    </ul>

    <button class="add_info_btn" on:click={() => addInfoMode(true)}>[Add]</button>
{/if}
