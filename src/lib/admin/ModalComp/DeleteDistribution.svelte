<!-- 未使用コンポーネント 2025/02/01 -->
<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        onSubmit,
        closeModal,
        modalData,
        conv2DArrayToObject,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        getDistributionCategoryName,
        // specificDistributionData,
        // commonDistributionData,
        allDistributionData,
        checkModalType,
    } from '$utils/client';
</script>

{#if checkModalType('deleteDistribution', $modalData)}
    <div class="modal">
        <div class="modal_content">
            <form
                method="POST"
                use:enhance={({ formData }) => {
                    const data = conv2DArrayToObject([...formData.entries()]);
                    const id = Number(data.dist_id);

                    return async ({ result }) => {
                        msgClosed.set(false);
                        onSubmit.set(false);
                        await applyAction(result);

                        if (result.type === 'success') {
                            $allDistributionData = $allDistributionData.filter((data) => data.id !== id); // DistributionList.svelteのscriptはページ遷移で常時実行されるため、全データからも削除しておく、これを忘れるとページ遷移で削除したものが見た目上は復活する

                            // if ($modalData.isSpecific) {
                            //     $specificDistributionData = $specificDistributionData.filter((data) => data.id !== id);
                            // } else {
                            //     $commonDistributionData = $commonDistributionData.filter((data) => data.id !== id);
                            // }
                        }

                        closeModal();
                    };
                }}
            >
                <input type="hidden" name="dist_id" value={$modalData.distId} />

                <div class="modal_header">
                    <h1>Delete Distribution Data</h1>
                </div>
                <div class="modal_body">
                    <p>The following distribution will be deleted:</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Distribution ID</p>
                            <span>{$modalData.distId}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Distribution Title</p>
                            <span>{$modalData.distTitle}</span>
                        </li>

                        <li class="modal_list_item">
                            <p>Distribution Type</p>
                            <span>{getDistributionCategoryName($modalData.distType)}</span>
                        </li>
                    </ul>
                </div>
                <div class="btn_group">
                    <button class="blue_btn" type="button" onclick={() => closeModal()}>
                        <span class="btn_icon material-symbols-outlined">close</span>
                        <span class="btn_text">Close</span>
                    </button>

                    <button
                        class="red_btn"
                        type="submit"
                        formaction="?/deleteDistribution"
                        onclick={() => {
                            onSubmit.set(true);
                            $timeOut && closeMsgDisplay($timeOut);
                        }}
                    >
                        <span class="btn_icon material-symbols-outlined">check</span>
                        <span class="btn_text">Delete</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
