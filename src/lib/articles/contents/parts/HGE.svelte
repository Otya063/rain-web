<script lang="ts">
    import LL from '$i18n/i18n-svelte';

    const articleData = $LL.articles['begin'].start;
    const { 1: spec } = articleData.section;
    const { column_name, row_data } = spec.table_data['hge'];
</script>

<tr class="table_row">
    <th class="table_header" scope="row" />
    <td style="border-left: black solid 2px" class="table_data table_data_center no_border_right table_header_hge">{column_name()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.resolution['name']()}</th>
    <td class="table_data table_data_center no_border_right">{row_data.resolution['data_common']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.os['name']()}</th>
    <td class="table_data no_border_right" colspan="2">
        <ul>
            <li>{row_data.os['data_common'][0]()}</li>
            <li style="color: red;">{row_data.os['data_common'][1]()}</li>
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.cpu['name']()}</th>
    <td class="table_data table_data_center no_border_right">{row_data.cpu['data_common']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.memory['name']()}</th>
    <td class="table_data table_data_center no_border_right">{row_data.memory['data_common']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.card['name']()}</th>
    <td class="table_data table_data_center no_border_right">
        <ul>
            {#each Object.values(row_data.card['data_common']) as text}
                <li class="table_data_list_item">{text()}</li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">DirectX®</th>
    <td colspan="2" class="table_data no_border_right">
        <ul style="padding-left: 1em;">
            <li style="text-align: center; padding-right: 1em">{row_data.directx['data_common'][0]()}</li>
            <li style="text-indent: -1em; color:red;">
                {@html row_data.directx['data_common'][1]()}
            </li>
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.sound['name']()}</th>
    <td colspan="2" class="table_data table_data_center no_border_right">
        <ul>
            {#each Object.values(row_data.sound['data_common']) as text}
                <li>{text()}</li>
            {/each}
        </ul>
    </td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{row_data.hdd['name']()}</th>
    <td class="table_data table_data_center no_border_right" colspan="2">{row_data.hdd['data_common']()}</td>
</tr>

<tr class="table_row">
    <th class="table_header" scope="row">{@html row_data.internet['name']()}</th>
    <td class="table_data table_data_center no_border_right" colspan="2">{row_data.internet['data_common']()}</td>
</tr>
