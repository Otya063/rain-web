<script lang="ts">
    import LL from '$i18n/i18n-svelte';

    const articleData = $LL.manual["article"].begin['start'];
    const { 1: spec } = articleData.section;
    const { columnName, rowData } = spec.tableData["original"];
</script>

<tr class="table_row">
    <th class="table_header" scope="row" />
    <td style="border-left: black solid 2px" class="table_data table_data_center table_header_original">{columnName.min()}</td>
    <td class="table_data table_data_center no_border_right table_header_original">{columnName.rec()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.resolution['name']()}</th>
    <td class="table_data table_data_center">{rowData.resolution['dataMin']()}</td>
    <td class="table_data table_data_center no_border_right">{rowData.resolution['dataRec']()}</td>
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
    <th scope="row" class="table_header" rowspan="2">{rowData.cpu['name']()}</th>
    <td class="table_data">
        <ul class="table_data_list">
            {#each Object.values(rowData.cpu['dataMin']) as text}
                <li class="table_data_list_item">{text()}<span class="table_data_list_item_part" /></li>
            {/each}
        </ul>
    </td>
    <td class="table_data no_border_right">
        <ul class="table_data_list">
            {#each Object.values(rowData.cpu['dataRec']) as text}
                <li class="table_data_list_item">{text()}<span class="table_data_list_item_part" /></li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <td colspan="2" class="table_data table_data_center no_border_right">{rowData.cpu['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{rowData.memory['name']()}</th>
    <td class="table_data table_data_center">{rowData.memory['dataMin']()}</td>
    <td class="table_data table_data_center no_border_right">{rowData.memory['dataRec']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{@html rowData.card['name']()}</th>
    <td class="table_data">
        <ul class="table_data_list">
            {#each Object.values(rowData.card['dataMin']) as text}
                <li class="table_data_list_item">{text()}<span class="table_data_list_item_part" /></li>
            {/each}
        </ul>
    </td>
    <td class="table_data no_border_right">
        <ul class="table_data_list">
            {#each Object.values(rowData.card['dataRec']) as text}
                <li class="table_data_list_item">{text()}<span class="table_data_list_item_part" /></li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">DirectX®</th>
    <td colspan="2" class="table_data table_data_center no_border_right">{rowData.directx['dataCommon']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{@html rowData.sound['name']()}</th>
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
    <td class="table_data no_border_right" colspan="2">
        <ul style="padding-left: 1em;">
            <li style="text-indent: -1em; text-align: center;">{rowData.hdd['dataCommon'][0]()}</li>
            <li style="text-indent: -1em; color: red;">{rowData.hdd['dataCommon'][1]()}</li>
            <li style="text-indent: -1em; color:red;">{rowData.hdd['dataCommon'][2]()}</li>
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{@html rowData.internet['name']()}</th>
    <td class="table_data table_data_center no_border_right" colspan="2">{rowData.internet['dataCommon']()}</td>
</tr>
