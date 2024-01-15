<script lang="ts">
    import { deleteFileViaApi, clicked_submit, cancelModal, deleteBnr, deleteBnrData } from '$ts/main';
    import _ from 'lodash';

    /* delete file function
    ====================================================*/
    const deleteAllBnrFiles = () => {
        if ($deleteBnrData.bnr_name === '') {
            return false;
        }

        deleteFileViaApi('ja', `${$deleteBnrData.bnr_name}_ja`);
        deleteFileViaApi('en', `${$deleteBnrData.bnr_name}_en`);
    };
</script>

{#if $deleteBnr}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="bnr_id" value={$deleteBnrData.bnr_id} />
                <input type="hidden" name="bnr_name" value={$deleteBnrData.bnr_name} />
                <div class="modal_header">
                    <h1>Delete Banner Data</h1>
                </div>
                <div class="modal_body">
                    <p>{$deleteBnrData.title}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Banner Preview</p>
                            <img src={$deleteBnrData.bnr_url} alt={$deleteBnrData.bnr_name} />
                        </li>

                        <li class="modal_list_item">
                            <p>Banner Name</p>
                            <span>{$deleteBnrData.bnr_name}</span>
                        </li>
                    </ul>
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$deleteBnrData.form_action}" type="submit" on:click={() => (clicked_submit.set(true), deleteAllBnrFiles())}>
                        <span class="btn_icon material-icons">check</span>
                        <span class="btn_text">Yes</span>
                    </button>
                    <button class="red_btn" type="button" on:click={() => cancelModal()}>
                        <span class="btn_icon material-icons">close</span>
                        <span class="btn_text">No</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
