<script lang="ts">
    import { convUnixToDate } from '$ts/main';

    export let important_info_data;
    export let defects_and_troubles_info_data;
    export let management_and_service_info_data;
    export let ingame_events_info_data;
    export let updates_and_maintenance_info_data;

    interface LauncherInfo {
        id: number;
        title: string;
        url: string;
        type: string;
        created_at: number;
    }

    const info_type_data: Record<string, LauncherInfo[]> = {
        Important: important_info_data,
        'Defects and Troubles': defects_and_troubles_info_data,
        'Management and Service': management_and_service_info_data,
        'In-Game Events': ingame_events_info_data,
        'Updates and Maintenance': updates_and_maintenance_info_data,
    };

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
    <li class="console_contents_list_item">
        <form class="console_form_section" action="?/createInfoData" method="POST">
            <p class="console_head">Launcher Information Adding Form</p>
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

                {#each Object.keys(info_type_data) as key}
                    <label for={key}>
                        <input id={key} type="radio" name="info_type" value={key} />
                        {key}
                    </label>
                {/each}
            </div>

            <div class="save_cancel_btn">
                <button type="submit">[Save]</button>
                <button on:click={() => addInfoMode(false)}>[Cancel]</button>
            </div>
        </form>
    </li>
{:else}
    {#each Object.entries(info_type_data) as [typename, data]}
        <h2>
            <span class="material-icons">looks_one</span>
            {typename} Information
        </h2>
        {#if data.length === 0}
            <p style="color: red;">No Information Found</p>
        {/if}
        <div class="console_contents">
            {#each data || [] as data_item}
                <p class="console_contents_list_title">[ Information ID: {data_item.id} ]</p>
                <dl class="console_contents_list">
                    {#if edit_id === data_item.id}
                        <form class="console_form_section" action="?/updateInfoData" method="POST">
                            <input type="hidden" name="info_id" value={edit_id} />

                            <label for="info_title">
                                Title:
                                <input id="info_title" type="text" name="info_title" value={data_item.title} autocomplete="off" />
                            </label>

                            <label for="info_url">
                                URL:
                                <input id="info_url" type="text" name="info_url" value={data_item.url} autocomplete="off" />
                            </label>

                            <div class="info_type_group">
                                <label for="info_type">Info Type</label>

                                {#each Object.keys(info_type_data) as key}
                                    <label for={key}>
                                        <input id={key} type="radio" name="info_type" value={key} checked={data_item.type === key} />
                                        {key}
                                    </label>
                                {/each}
                            </div>

                            <label for="info_date">
                                Date:
                                <input id="info_date" name="info_date" type="date" value={convUnixToDate(data_item.created_at, true)} />
                            </label>

                            <div class="save_cancel_btn">
                                <button type="submit">[Save]</button>
                                <button on:click={() => editInfoMode(0)}>[Cancel]</button>
                            </div>

                            <button class="del_info_btn" type="submit" formaction="?/deleteInfoData" formmethod="POST">[Delete This Info]</button>
                        </form>
                    {:else}
                        <dt class="contents_term">Title</dt>
                        <dd class="contents_desc">{data_item.title}</dd>

                        <dt class="contents_term">URL</dt>
                        <dd class="contents_desc">{data_item.url}</dd>

                        <dt class="contents_term">
                            Date<br />
                            Unix Time
                        </dt>
                        <dd class="contents_desc">
                            {convUnixToDate(data_item.created_at, false)}<br />
                            {data_item.created_at}
                        </dd>

                        <!-- <button class="edit_btn" on:click={() => editInfoMode(data_item.id)}>[Edit]</button> -->
                    {/if}
                </dl>
            {/each}
        </div>
    {/each}

    <button class="add_info_btn" on:click={() => addInfoMode(true)}>[Add Info]</button>
{/if}
