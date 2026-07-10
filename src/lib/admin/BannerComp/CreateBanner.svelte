<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import type { CreateBannerProps } from '$types';
    import { onSubmit, msgClosed, allBannerData, timeOut, closeMsgDisplay, tooltip } from '$utils/client';

    let { createdBanner, bnrAddMode = $bindable(), isMobile }: CreateBannerProps = $props();

    const bannerFields = [
        { key: 'jaFile' as const, label: 'Japanese Banner', inputName: 'ja_file', altText: 'ja_banner_preview', tooltipText: '- Banner width is 515px and height is 120px.<br />- File name format: [Name]_ja.png' },
        { key: 'enFile' as const, label: 'English Banner', inputName: 'en_file', altText: 'en_banner_preview', tooltipText: '- Banner width is 515px and height is 120px.<br />- File name format: [Name]_en.png' },
    ];

    let fileInputs: Record<string, HTMLInputElement | null> = {
        jaFile: null,
        enFile: null,
    };
    let filePreviews: Record<string, string | null> = $state({
        jaFile: null,
        enFile: null,
    });

    const handleFileChange = (inputKey: 'jaFile' | 'enFile') => {
        const file = fileInputs[inputKey]?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                filePreviews[inputKey] = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else {
            filePreviews[inputKey] = null;
        }
    };
</script>

<h2>
    <span class="material-symbols-outlined">post_add</span>
    Add New Banner
</h2>

<div class="console_contents">
    <form
        action="?/createBanner"
        method="POST"
        enctype="multipart/form-data"
        use:enhance={() => {
            return async ({ result }) => {
                msgClosed.set(false);
                onSubmit.set(false);
                await applyAction(result);

                if (result.type === 'success') {
                    allBannerData.update((banner) => {
                        return [...banner, createdBanner];
                    });

                    bnrAddMode = false;
                }
            };
        }}
    >
        <dl class="console_contents_list">
            {#each bannerFields as field}
                <dt class="contents_term">
                    {field.label}
                    <span class="help_btn material-symbols-outlined" use:tooltip={field.tooltipText}>help</span>
                    {#if isMobile}&nbsp;{:else}<br />{/if}
                    <span class="contents_term_required">[Required]</span>
                </dt>
                <dd class="contents_desc vertical_center">
                    <div class="contents_desc_item">
                        <p class="contents_desc_item_text">
                            {#if filePreviews[field.key]}
                                <img style="margin-bottom: 3%;" src={filePreviews[field.key]} alt={field.altText} />
                            {/if}

                            <input name={field.inputName} type="file" accept=".png" bind:this={fileInputs[field.key]} style="display: none;" onchange={() => handleFileChange(field.key)} />
                            <button class="normal_btn" type="button" onclick={() => fileInputs[field.key]?.click()}>
                                <span class="btn_icon material-symbols-outlined">upload_file</span>
                                <span class="btn_text">Upload</span>
                            </button>
                        </p>
                    </div>
                </dd>
            {/each}

            <dt class="contents_term">
                Hyperlink
                <span class="help_btn material-symbols-outlined" use:tooltip={'The site url to which the banner is redirected when clicked.'}>help</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input class="long" type="text" name="bnr_url" placeholder="Enter banner url." autocomplete="off" />
                    </p>
                </div>
            </dd>

            <dt class="contents_term">
                Name
                <span class="help_btn material-symbols-outlined" use:tooltip={'- Must be the same as [Name] in the banner file name.<br />- Name is permanent, not editable.'}> help </span>
                {#if isMobile}&nbsp;{:else}<br />{/if}
                <span class="contents_term_required">[Required]</span>
            </dt>
            <dd class="contents_desc vertical_center">
                <div class="contents_desc_item">
                    <p class="contents_desc_item_text">
                        <input class="long" type="text" name="bnr_name" placeholder="Enter banner name." autocomplete="off" />
                    </p>
                </div>
            </dd>
        </dl>

        <div class="group_btns">
            <button class="red_btn" type="button" onclick={() => (bnrAddMode = false)}>
                <span class="btn_icon material-symbols-outlined">close</span>
                <span class="btn_text">Cancel</span>
            </button>

            <button
                onclick={() => {
                    onSubmit.set(true);
                    $timeOut && closeMsgDisplay($timeOut);
                }}
                class="blue_btn"
                type="submit"
            >
                <span class="btn_icon material-symbols-outlined">check</span>
                <span class="btn_text">Save</span>
            </button>
        </div>
    </form>
</div>
