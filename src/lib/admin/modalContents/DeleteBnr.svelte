<script lang="ts">
    import _ from 'lodash';
    import { deleteFileViaApi, clicked_submit, modalTitle, modalFormAction, cancelModal, deleteBnr, bnrId, bnrURL, bnrName } from '$ts/main';

    /* delete file function
    ====================================================*/
    const deleteAllBnrFiles = () => {
        if ($bnrName === '') {
            return false;
        }

        deleteFileViaApi('ja', `${$bnrName}_ja`);
        deleteFileViaApi('en', `${$bnrName}_en`);
    };
</script>

{#if $deleteBnr}
    <div class="modal">
        <div class="modal_content">
            <form method="POST">
                <input type="hidden" name="bnr_id" value={$bnrId} />
                <input type="hidden" name="bnr_name" value={$bnrName} />
                <div class="modal_header">
                    <h1>Delete Banner Data</h1>
                </div>
                <div class="modal_body">
                    <p>{$modalTitle}</p>
                    <ul class="modal_list">
                        <li class="modal_list_item">
                            <p>Banner Preview</p>
                            <img src={$bnrURL} alt={String($bnrName)} />
                        </li>

                        <li class="modal_list_item">
                            <p>Banner Name</p>
                            <span>{$bnrName}</span>
                        </li>
                    </ul>
                </div>
                <div class="ban_btn_group">
                    <button class="blue_btn" formaction="?/{$modalFormAction}" type="submit" on:click={() => (clicked_submit.set(true), deleteAllBnrFiles())}>
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
