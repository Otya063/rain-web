import { error } from '@sveltejs/kit';
import { writable } from 'svelte/store';
import type { ModalType, ModalUnionData, DeleteBnrData, DeleteCharacterData, DeleteInfoData, LinkDiscordData, RebuildClanData, SuspendUserData, DeleteDistributionData, DistEditorData } from '$types';

export const deleteInfo = writable(false);
export const deleteInfoData = writable<DeleteInfoData>();
export const deleteBnr = writable(false);
export const deleteBnrData = writable<DeleteBnrData>();
export const suspendUser = writable(false);
export const suspendUserData = writable<SuspendUserData>();
export const deleteChar = writable(false);
export const deleteCharacterData = writable<DeleteCharacterData>();
export const linkDiscord = writable(false);
export const linkDiscordData = writable<LinkDiscordData>();
export const rebuildClan = writable(false);
export const rebuildClanData = writable<RebuildClanData>();
export const downloadBinary = writable(false);
export const downloadBinaryData = writable<DeleteCharacterData>();
export const deleteDistribution = writable(false);
export const deleteDistributionData = writable<DeleteDistributionData>();
export const distDescEditor = writable(false);
export const distEditorData = writable<DistEditorData>();
export const distTitleEditor = writable(false);

/**
 * モーダルウィンドウに表示するデータを準備する
 *
 * @param {ModalType} type モーダルの種類
 * @param {ModalUnionData} data モーダルに渡すデータ
 */
export const prepareModal = (type: ModalType, data?: ModalUnionData): void => {
    switch (type) {
        case 'deleteInfo': {
            deleteInfo.set(true);
            deleteInfoData.set(data as DeleteInfoData);

            break;
        }

        case 'deleteBnr': {
            deleteBnr.set(true);
            deleteBnrData.set(data as DeleteBnrData);

            break;
        }

        case 'suspendUser': {
            suspendUser.set(true);
            suspendUserData.set(data as SuspendUserData);

            break;
        }

        case 'deleteCharacter': {
            deleteChar.set(true);
            deleteCharacterData.set(data as DeleteCharacterData);

            break;
        }

        case 'linkDiscord': {
            linkDiscord.set(true);
            linkDiscordData.set(data as LinkDiscordData);

            break;
        }

        case 'rebuildClan': {
            rebuildClan.set(true);
            rebuildClanData.set(data as RebuildClanData);

            break;
        }

        case 'downloadBinary': {
            downloadBinary.set(true);
            downloadBinaryData.set(data as DeleteCharacterData); // DeleteCharacterDataを再利用

            break;
        }

        case 'deleteDistribution': {
            deleteDistribution.set(true);
            deleteDistributionData.set(data as DeleteDistributionData);

            break;
        }

        case 'distDescEditor': {
            distDescEditor.set(true);
            distEditorData.set(data as DistEditorData);

            break;
        }

        case 'distTitleEditor': {
            distTitleEditor.set(true);
            distEditorData.set(data as DistEditorData);

            break;
        }

        default: {
            error(400, { message: '', message1: '', message2: ['Invalid type.'], message3: undefined });
        }
    }
};

/**
 * モーダルウィンドウを閉じる
 */
export const closeModal = (): void => {
    deleteInfo.set(false);
    suspendUser.set(false);
    deleteBnr.set(false);
    linkDiscord.set(false);
    deleteChar.set(false);
    rebuildClan.set(false);
    downloadBinary.set(false);
    deleteDistribution.set(false);
    distDescEditor.set(false);
    distTitleEditor.set(false);
};

/**
 * ユーザーのバイナリデータ（セーブデータ）をダウンロードする\
 * ダウンロードファイルの形式は「(キャラクター名)_binary.zip」
 * @param {string} charId 対象のキャラクターID
 * @param {string} charName 対象のキャラクター名
 * @returns {Promise<boolean>} ダウンロードに成功したか否か
 */
export const downloadUserBinary = async (charId: string, charName: string): Promise<boolean> => {
    try {
        const response = await fetch(`https://api.rain-server.com/download-binary/${charId}`);

        const blob = await response.blob();
        if (blob.size === 0) {
            // キャラクターがいないもしくは、全セーブデータのサイズが０
            return false;
        }

        // 一時的なアンカー要素を作成し、ダウンロードイベント発火
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${charName}_binary.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // ダウンロード後、オブジェクトURLをリリース
        URL.revokeObjectURL(url);

        return true;
    } catch (err) {
        return false;
    }
};
