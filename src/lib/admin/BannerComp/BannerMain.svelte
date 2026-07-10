<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        onSubmit,
        msgClosed,
        allBannerData,
        conv2DArrayToObject,
        discordLinkConvertor,
        timeOut,
        closeMsgDisplay,
        editModeSwitch as _editModeSwitch,
        tooltip,
        tooltipWhenOverflowText,
        handleCommonEditField,
    } from '$utils/client';
    import type { BannerEditableItemType, BannerMainProps } from '$types/banner';

    let { bnrAddMode = $bindable(), isMobile }: BannerMainProps = $props();
    let editingId: number = $state(0);
    let catTypes: Record<BannerEditableItemType, boolean> = $state({
        bnr_url: false,
        ja_img_src: false,
        en_img_src: false,
    });
    let selectedRowCount = $state(0);
    let checkAll = $state(false);
    let isChecked: boolean[] = $state(new Array($allBannerData.length).fill(false));
    let openBannerEditField: number[] = $state([]);
    let formEl: HTMLFormElement | null = $state(null);
    let fileInputs: Record<string, HTMLInputElement | null> = {
        jaFile: null,
        enFile: null,
    };

    const selectedBanners = $derived($allBannerData.filter((_, i) => isChecked[i]));

    const imgFields = [
        { key: 'jaFile' as const, label: 'Japanese Source', inputName: 'ja_file', editType: 'ja_img_src' as const, langSuffix: 'ja' as const },
        { key: 'enFile' as const, label: 'English Source', inputName: 'en_file', editType: 'en_img_src' as const, langSuffix: 'en' as const },
    ];

    const editModeSwitch = (bnrId: number, type: BannerEditableItemType): void => {
        const { updatedCatTypes, updatedEditingId } = _editModeSwitch<typeof type>(bnrId, type, catTypes);
        catTypes = updatedCatTypes;
        editingId = updatedEditingId;

        return;
    };

    const triggerFileInput = (inputKey: 'jaFile' | 'enFile') => {
        inputKey === 'jaFile' && fileInputs.enFile && (fileInputs.enFile.value = '');
        inputKey === 'enFile' && fileInputs.jaFile && (fileInputs.jaFile.value = '');
        fileInputs[inputKey]?.click();

        return;
    };

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files?.length) {
            formEl?.requestSubmit(); // submit()ではformのuse:enhanceをbypassしてしまう
            onSubmit.set(true);
            $timeOut && closeMsgDisplay($timeOut);
        }

        return;
    };

    const reloadImages = (bnrId: number) => {
        const jaImg = document.getElementById(`banner_ja_${bnrId}`) as HTMLImageElement;
        const enImg = document.getElementById(`banner_en_${bnrId}`) as HTMLImageElement;
        if (!jaImg || !enImg) {
            return;
        }

        const baseJaSrc = jaImg.src.split('?')[0];
        const baseEnSrc = enImg.src.split('?')[0];

        jaImg.src = '';
        enImg.src = '';

        setTimeout(() => {
            jaImg.src = `${baseJaSrc}?${Date.now()}`;
            enImg.src = `${baseEnSrc}?${Date.now()}`;
        }, 10);

        return;
    };
</script>

<h2>
    <span class="material-symbols-outlined">newspaper</span>
    Banner
</h2>

<div class="console_contents">
    <form
        id="deleteBanner"
        action="?/deleteBanner"
        method="POST"
        use:enhance={({ formData }) => {
            const selectedIds: number[] = String(formData.get('selectedBannerId')).split(',').map(Number);

            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allBannerData.update((data) => data.filter((banner) => !selectedIds.includes(banner.id)));
                    isChecked = new Array($allBannerData.length).fill(false);
                    checkAll = false;
                    selectedRowCount = 0;
                    openBannerEditField = openBannerEditField.filter((id) => !selectedIds.includes(id));
                }
            };
        }}
    >
        <input name="selectedBannerId" type="hidden" value={selectedBanners.map((b) => b.id)} />
        <input name="selectedBannerName" type="hidden" value={selectedBanners.map((b) => b.bnr_name)} />
    </form>

    <div class="temp_operation_area">
        <button class="green_btn" type="button" onclick={() => (bnrAddMode = true)}>
            <span class="btn_icon material-symbols-outlined">add</span>
            <span class="btn_text">Add Item</span>
        </button>

        <button
            form="deleteBanner"
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
        <table class="console_contents_table" class:no_mobile_scroll={isMobile && !$allBannerData.length} style="width: 100%;">
            <thead class="console_contents_table_head banner">
                <tr class="table_row" class:hide_text={!$allBannerData.length}>
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

                    <th class="console_contents_table_head_header other" class:center={isMobile}>
                        {#if openBannerEditField.length}
                            <button class="material-symbols-outlined" type="button" use:tooltip={isMobile ? '' : 'Collapse all edit fields.'} onclick={() => (openBannerEditField = [])}>
                                collapse_all
                            </button>
                        {/if}
                    </th>
                </tr>
            </thead>

            <tbody>
                {#each $allBannerData as banner, i}
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

                        <td class="console_contents_table_data">{banner.id}</td>

                        <td class="console_contents_table_data" use:tooltipWhenOverflowText={banner.bnr_name}>{banner.bnr_name}</td>

                        <td class="console_contents_table_data" class:center={isMobile}>
                            <button
                                class="material-symbols-outlined"
                                type="button"
                                use:tooltip={isMobile ? '' : !openBannerEditField.includes(banner.id) ? 'Show details.' : 'Hide details.'}
                                onclick={() => (openBannerEditField = handleCommonEditField(openBannerEditField, banner.id))}
                            >
                                {openBannerEditField.includes(banner.id) ? 'close' : 'expand_circle_down'}
                            </button>
                        </td>
                    </tr>

                    {#if openBannerEditField.includes(banner.id)}
                        <tr class="detail_row">
                            <td colspan="100">
                                <form
                                    action="?/updateBanner"
                                    method="POST"
                                    enctype="multipart/form-data"
                                    use:enhance={({ formData }) => {
                                        const data = conv2DArrayToObject([...formData.entries()]);
                                        const id = Number(data.bnr_id);
                                        const isBnrUrlEdited = data.hasOwnProperty('bnr_url');

                                        return async ({ result }) => {
                                            msgClosed.set(false);
                                            onSubmit.set(false);
                                            await applyAction(result);

                                            if (result.type === 'success' && isBnrUrlEdited) {
                                                const bnrUrl = data.bnr_url;

                                                allBannerData.update((data) =>
                                                    data.map((banner) => {
                                                        if (banner.id === id) {
                                                            return {
                                                                ...banner,
                                                                bnr_url: !bnrUrl ? null : bnrUrl.indexOf('discord.com') ? discordLinkConvertor(bnrUrl) : bnrUrl,
                                                            };
                                                        }

                                                        return banner;
                                                    }),
                                                );
                                            } else {
                                                reloadImages(id);
                                            }
                                        };
                                    }}
                                    bind:this={formEl}
                                >
                                    <input type="hidden" name="bnr_id" value={editingId} />
                                    <input type="hidden" name="bnr_name" value={banner.bnr_name} />

                                    <dl class="console_contents_list">
                                        <dt class="contents_term">ID</dt>
                                        <dd class="contents_desc">{banner.id}</dd>

                                        {#each imgFields as field}
                                            <dt class="contents_term">{field.label}</dt>
                                            <dd class="contents_desc">
                                                <div class="contents_desc_item" style="height: auto;">
                                                    <p class="contents_desc_item_text">
                                                        <img
                                                            id={`banner_${field.langSuffix}_${banner.id}`}
                                                            src={`${banner[field.editType]}?${Date.now()}`}
                                                            alt={`${banner.bnr_name}_${field.langSuffix}`}
                                                        />
                                                    </p>
                                                </div>

                                                <div class="contents_desc_item_group_btn">
                                                    <input
                                                        name={field.inputName}
                                                        type="file"
                                                        accept=".png"
                                                        bind:this={fileInputs[field.key]}
                                                        style="display: none;"
                                                        onchange={(e) => {
                                                            handleFileChange(e);
                                                            setTimeout(() => {
                                                                // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                editModeSwitch(0, field.editType);
                                                            }, 100);
                                                        }}
                                                    />
                                                    <button
                                                        class="normal_btn"
                                                        type="button"
                                                        onclick={() => {
                                                            editModeSwitch(banner.id, field.editType);
                                                            triggerFileInput(field.key);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">upload_file</span>
                                                        <span class="btn_text">Re-upload</span>
                                                    </button>
                                                </div>
                                            </dd>
                                        {/each}

                                        <dt class="contents_term">Hyperlink</dt>
                                        <dd class="contents_desc">
                                            <div class="contents_desc_item">
                                                <p class="contents_desc_item_text">
                                                    {#if editingId === banner.id && catTypes.bnr_url}
                                                        <input class="long" type="text" name="bnr_url" value={banner.bnr_url} placeholder="Enter banner url." autocomplete="off" />
                                                    {:else}
                                                        {banner.bnr_url || 'None'}
                                                    {/if}
                                                </p>
                                            </div>

                                            <div class="contents_desc_item_group_btn">
                                                {#if editingId === banner.id && catTypes.bnr_url}
                                                    <button class="red_btn" type="button" onclick={() => editModeSwitch(0, 'bnr_url')}>
                                                        <span class="btn_icon material-symbols-outlined">close</span>
                                                        <span class="btn_text">Cancel</span>
                                                    </button>

                                                    <button
                                                        class="blue_btn"
                                                        type="submit"
                                                        onclick={() => {
                                                            onSubmit.set(true);
                                                            $timeOut && closeMsgDisplay($timeOut);
                                                            setTimeout(() => {
                                                                // 送信時にeditingIdが「0」となって送られるのを防ぐため、リセットは少し遅らせる
                                                                editModeSwitch(0, 'bnr_url');
                                                            }, 100);
                                                        }}
                                                    >
                                                        <span class="btn_icon material-symbols-outlined">check</span>
                                                        <span class="btn_text">Save</span>
                                                    </button>
                                                {:else}
                                                    <button class="normal_btn" type="button" onclick={() => editModeSwitch(banner.id, 'bnr_url')}>
                                                        <span class="btn_icon material-symbols-outlined">mode_edit</span>
                                                        <span class="btn_text">Edit</span>
                                                    </button>
                                                {/if}
                                            </div>
                                        </dd>

                                        <dt class="contents_term">Name</dt>
                                        <dd class="contents_desc">
                                            {banner.bnr_name}
                                        </dd>
                                    </dl>
                                </form>
                            </td>
                        </tr>
                    {/if}
                {:else}
                    <tr class="table_row">
                        <td class="console_contents_table_data no_data" colspan="4">No banner data.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
