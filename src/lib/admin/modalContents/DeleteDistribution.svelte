<script lang="ts">
    import { applyAction, enhance } from '$app/forms';
    import {
        onSubmit,
        closeModal,
        deleteDistributionData,
        conv2DArrayToObject,
        msgClosed,
        timeOut,
        closeMsgDisplay,
        getDistributionTypeName,
        specificDistributionData,
        commonDistributionData,
    } from '$utils/client';
</script>

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
                        if ($deleteDistributionData.isSpecific) {
                            $specificDistributionData = $specificDistributionData.filter((data) => data.id !== id);
                        } else {
                            $commonDistributionData = $commonDistributionData.filter((data) => data.id !== id);
                        }
                    }

                    closeModal();
                };
            }}
        >
            <input type="hidden" name="dist_id" value={$deleteDistributionData.distId} />

            <div class="modal_header">
                <h1>Delete Distribution Data</h1>
            </div>
            <div class="modal_body">
                <p>{$deleteDistributionData.title}</p>
                <ul class="modal_list">
                    <li class="modal_list_item">
                        <p>Distribution ID</p>
                        <span>{$deleteDistributionData.distId}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Distribution Title</p>
                        <span>{$deleteDistributionData.distTitle}</span>
                    </li>

                    <li class="modal_list_item">
                        <p>Distribution Type</p>
                        <span>{getDistributionTypeName($deleteDistributionData.distType)}</span>
                    </li>
                </ul>
            </div>
            <div class="btn_group">
                <button class="red_btn" type="button" onclick={() => closeModal()}>
                    <span class="btn_icon material-symbols-outlined">close</span>
                    <span class="btn_text">Close</span>
                </button>

                <button
                    class="blue_btn"
                    type="submit"
                    formaction="?/{$deleteDistributionData.formAction}"
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
