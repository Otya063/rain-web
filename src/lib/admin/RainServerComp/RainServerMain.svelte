<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        onSubmit,
        msgClosed,
        allRainServerData,
        conv2DArrayToObject,
        timeOut,
        closeMsgDisplay,
        editModeSwitch as _editModeSwitch,
        tooltip,
        tooltipWhenOverflowText,
        handleCommonEditField,
    } from '$utils/client';
    import type { RainServerEditableItemType, RainServerMainProps } from '$types';

    let { rainServerAddMode = $bindable(), isMobile }: RainServerMainProps = $props();
    let editingId: number = $state(0);
    let catTypes: Record<RainServerEditableItemType, boolean> = $state({
        name: false,
        host: false,
        port: false,
        entrance_port: false,
    });
    let selectedRowCount = $state(0);
    let checkAll = $state(false);
    let isChecked: boolean[] = $state(new Array($allRainServerData.length).fill(false));
    let openRainServerEditField: number[] = $state([]);

    const selectedRainServers = $derived($allRainServerData.filter((_, i) => isChecked[i]));

    const editModeSwitch = (serverId: number, type: RainServerEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = _editModeSwitch<typeof type>(serverId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;

        return;
    };
</script>

{#snippet fieldButtons(col: RainServerEditableItemType, serverId: number)}
    {#if editingId === serverId && catTypes[col]}
        <button class="red_btn" type="button" onclick={() => editModeSwitch(0, col)}>
            <span class="btn_icon material-symbols-outlined">close</span>
            <span class="btn_text">Cancel</span>
        </button>

        <button
            class="blue_btn"
            type="submit"
            onclick={() => {
                onSubmit.set(true);
                $timeOut && closeMsgDisplay($timeOut);
            }}
        >
            <span class="btn_icon material-symbols-outlined">check</span>
            <span class="btn_text">Save</span>
        </button>
    {:else}
        <button class="normal_btn" type="button" onclick={() => editModeSwitch(serverId, col)}>
            <span class="btn_icon material-symbols-outlined">mode_edit</span>
            <span class="btn_text">Edit</span>
        </button>
    {/if}
{/snippet}

<h2>
    <span class="material-symbols-outlined">dns</span>
    Rain Server List
</h2>

<div class="console_contents">
    <form
        id="deleteRainServer"
        action="?/deleteRainServer"
        method="POST"
        use:enhance={({ formData }) => {
            const selectedIds: number[] = String(formData.get('selectedServerId')).split(',').map(Number);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allRainServerData.update((data) => data.filter((server) => !selectedIds.includes(server.id)));
                    isChecked = new Array($allRainServerData.length).fill(false);
                    checkAll = false;
                    selectedRowCount = 0;
                    openRainServerEditField = openRainServerEditField.filter((id) => !selectedIds.includes(id));
                }
            };
        }}
    >
        <input name="selectedServerId" type="hidden" value={selectedRainServers.map((s) => s.id)} />
        <input name="selectedServerName" type="hidden" value={selectedRainServers.map((s) => s.name)} />
    </form>

    <div class="temp_operation_area">
        <button class="green_btn" type="button" onclick={() => (rainServerAddMode = true)}>
            <span class="btn_icon material-symbols-outlined">add</span>
            <span class="btn_text">Add Server</span>
        </button>

        <button
            form="deleteRainServer"
            class="red_btn"
            class:disabled_elm={selectedRowCount < 1}
            use:tooltip={isMobile ? '' : `Delete ${selectedRowCount} selected row(s).`}
            type="submit"
            onclick={() => {
                $timeOut && closeMsgDisplay($timeOut);
                onSubmit.set(true);
            }}
        >
            <span class="btn_icon material-symbols-outlined">delete</span>
            <span class="btn_text">Delete</span>
        </button>
    </div>

    <div class="console_contents_table_wrapper">
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$allRainServerData.length} style="width: 100%;">
            <thead class="console_contents_table_head rain_server">
                <tr class="table_row" class:hide_text={!$allRainServerData.length}>
                    <th class="console_contents_table_head_header select center">
                        <button
                            class="material-symbols-outlined"
                            type="button"
                            use:tooltip={isMobile ? '' : selectedRowCount >= 1 ? `Deselect ${selectedRowCount} row(s).` : 'Select all rows to delete.'}
                            onclick={() => {
                                if (!checkAll && selectedRowCount >= 1) {
                                    selectedRowCount = 0;
                                    isChecked.fill(false);
                                } else {
                                    isChecked.fill(!checkAll);
                                    checkAll = !checkAll;
                                    selectedRowCount = checkAll ? isChecked.length : 0;
                                }
                            }}
                        >
                            {checkAll ? 'check_box' : selectedRowCount >= 1 ? 'indeterminate_check_box' : 'check_box_outline_blank'}
                        </button>
                    </th>

                    <th class="console_contents_table_head_header id no_sort">ID</th>

                    <th class="console_contents_table_head_header name">Name</th>

                    <th class="console_contents_table_head_header maintenance">Maintenance</th>

                    <th class="console_contents_table_head_header other" class:center={isMobile}>
                        {#if openRainServerEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openRainServerEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            </thead>

            <tbody>
                {#each $allRainServerData as server, i}
                    <tr class="table_row" class:selected={isChecked[i]}>
                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !isChecked[i] ? 'Select a row to delete.' : 'Deselect a row.'}
                                onclick={() => {
                                    isChecked[i] = !isChecked[i];
                                    isChecked[i] ? selectedRowCount++ : selectedRowCount--;

                                    if (checkAll && selectedRowCount === 0) {
                                        checkAll = false;
                                    }
                                }}
                            >
                                {isChecked[i] ? 'check_box' : 'check_box_outline_blank'}
                            </button>
                        </td>

                        <td class="console_contents_table_data">{server.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={server.name}>{server.name}</td>

                        <td class="console_contents_table_data center">
                            <form
                                action="?/updateRainServerMaintenance"
                                method="POST"
                                use:enhance={({ formData }) => {
                                    const value = String(formData.get('maintenance')) === 'true';
                                    onSubmit.set(true);
                                    $timeOut && closeMsgDisplay($timeOut);
                                    return async ({ result }) => {
                                        msgClosed.set(false);
                                        onSubmit.set(false);
                                        await applyAction(result);

                                        if (result.type === 'success') {
                                            allRainServerData.update((data) => data.map((s) => (s.id === server.id ? { ...s, maintenance: value } : s)));
                                        }
                                    };
                                }}
                            >
                                <input type="hidden" name="server_id" value={server.id} />
                                <input type="hidden" name="maintenance" value={server.maintenance ? 'false' : 'true'} />
                                <button
                                    type="submit"
                                    class="toggle_switch"
                                    class:on={server.maintenance}
                                    use:tooltip={isMobile ? '' : server.maintenance ? 'Disable maintenance mode.' : 'Enable maintenance mode.'}
                                    aria-label={server.maintenance ? 'Disable' : 'Enable'}><span></span></button
                                >
                            </form>
                        </td>

                        <td class="console_contents_table_data center">
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openRainServerEditField.includes(server.id) ? 'Show details.' : 'Hide details.'}
                                onclick={() => (openRainServerEditField = handleCommonEditField(openRainServerEditField, server.id))}
                            >
                                {openRainServerEditField.includes(server.id) ? 'close' : 'expand_circle_down'}
                            </button>
                        </td>
                    </tr>

                    {#if openRainServerEditField.includes(server.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateRainServer"
                                    method="POST"
                                    use:enhance={({ formData }) => {
                                        const data = conv2DArrayToObject([...formData.entries()]);
                                        const id = Number(data.server_id);
                                        const column = Object.keys(data)[1] as RainServerEditableItemType;
                                        const value = Object.values(data)[1] as string;
                                        editModeSwitch(0, column);

                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success') {
                                                allRainServerData.update((data) =>
                                                    data.map((s) => (s.id === id ? { ...s, [column]: column === 'port' || column === 'entrance_port' ? Number(value) : value } : s)),
                                                );
                                            }
                                        };
                                    }}
                                >
                                    <input type="hidden" name="server_id" value={server.id} />

                                    <dl class="console_contents_list">
                                        <dt class="contents_term">ID</dt>
                                        <dd class="contents_desc">{server.id}</dd>

                                        <dt class="contents_term">
                                            Name{#if isMobile}&nbsp;{:else}<br />{/if}
                                            <span class="contents_term_required">[Required]</span>
                                        </dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === server.id && catTypes.name}
                                                        <input class="long" type="text" name="name" value={server.name} autocomplete="off" />
                                                    {:else}
                                                        {server.name}
                                                    {/if}
                                                </p>
                                            </div>
                                            <div class="contents_desc_item_group_btn">
                                                {@render fieldButtons('name', server.id)}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">
                                            Host{#if isMobile}&nbsp;{:else}<br />{/if}
                                            <span class="contents_term_required">[Required]</span>
                                        </dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === server.id && catTypes.host}
                                                        <input class="long" type="text" name="host" value={server.host} autocomplete="off" />
                                                    {:else}
                                                        {server.host}
                                                    {/if}
                                                </p>
                                            </div>
                                            <div class="contents_desc_item_group_btn">
                                                {@render fieldButtons('host', server.id)}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Port</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === server.id && catTypes.port}
                                                        <input type="number" name="port" value={server.port} autocomplete="off" />
                                                    {:else}
                                                        {server.port}
                                                    {/if}
                                                </p>
                                            </div>
                                            <div class="contents_desc_item_group_btn">
                                                {@render fieldButtons('port', server.id)}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Entrance Port</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === server.id && catTypes.entrance_port}
                                                        <input type="number" name="entrance_port" value={server.entrance_port} autocomplete="off" />
                                                    {:else}
                                                        {server.entrance_port}
                                                    {/if}
                                                </p>
                                            </div>
                                            <div class="contents_desc_item_group_btn">
                                                {@render fieldButtons('entrance_port', server.id)}
                                            </div>
                                        </dd>
                                    </dl>
                                </form>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="100">No server data.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
