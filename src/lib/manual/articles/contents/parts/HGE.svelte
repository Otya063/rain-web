<script lang="ts">
    import LL from '$i18n/i18n-svelte';

    const articleData = $LL.manual["article"].begin['start'];
    const { 1: spec } = articleData.section;
    const { columnName, rowData } = spec.tableData['hge'];
</script>

<tr class="table_row">
    <th class="table_header" scope="row"></th>
    <td style="border-left: black solid 2px" class="table_data table_data_center no_border_right table_header_hge">{columnName()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.resolution['name']()}</th>
    <td class="table_data table_data_center no_border_right">{rowData.resolution['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.os['name']()}</th>
    <td class="table_data no_border_right" colspan="2">
        <ul>
            <li>{rowData.os['dataCommon'][0]()}</li>
            <li style="color: red;">{rowData.os['dataCommon'][1]()}</li>
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.cpu['name']()}</th>
    <td class="table_data table_data_center no_border_right">{rowData.cpu['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.memory['name']()}</th>
    <td class="table_data table_data_center no_border_right">{rowData.memory['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.card['name']()}</th>
    <td class="table_data table_data_center no_border_right">
        <ul>
            {#each Object.values(rowData.card['dataCommon']) as text}
                <li class="table_data_list_item">{text()}</li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">DirectX®</th>
    <td colspan="2" class="table_data no_border_right">
        <ul style="padding-left: 1em;">
            <li style="text-align: center; padding-right: 1em">{rowData.directx['dataCommon'][0]()}</li>
            <li style="text-indent: -1em; color:red;">
                {@html rowData.directx['dataCommon'][1]()}
            </li>
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.sound['name']()}</th>
    <td colspan="2" class="table_data table_data_center no_border_right">
        <ul>
            {#each Object.values(rowData.sound['dataCommon']) as text}
                <li>{text()}</li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.hdd['name']()}</th>
    <td class="table_data table_data_center no_border_right" colspan="2">{rowData.hdd['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{@html rowData.internet['name']()}</th>
    <td class="table_data table_data_center no_border_right" colspan="2">{rowData.internet['dataCommon']()}</td>
</tr>
