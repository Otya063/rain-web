import { writable } from 'svelte/store';
import type { ModalType, ModalDataMap } from '$types';

/**
 * モーダルの状態を管理するストア
 */
export const modalStates = writable<Record<ModalType, boolean>>({
    deleteInfo: false,
    deleteBnr: false,
    suspendUser: false,
    deleteCharacter: false,
    linkDiscord: false,
    rebuildClan: false,
    downloadBinary: false,
    deleteDistribution: false,
    distributionEditor: false,
    deleteUser: false,
});

/**
 * モーダルコンテンツを管理するストア
 */
export const modalData = writable<ModalDataMap[ModalType] | null>(null);

/**
 * モーダルコンテンツを準備し、ウィンドウを開く
 *
 * @param {T} type モーダルの種類
 * @param {ModalDataMap[T]} data モーダルに渡すデータ
 */
export const openModal = <T extends ModalType>(type: T, data: ModalDataMap[T]): void => {
    modalStates.update((states) => {
        // 全モーダルが閉じていることを確認
        for (const key in states) {
            states[key as ModalType] = false;
        }

        // 指定モーダルを開く
        states[type] = true;
        return states;
    });

    modalData.set(data);
};

/**
 * モーダルウィンドウを閉じる
 */
export const closeModal = (): void => {
    modalStates.update((states) => {
        // すべてのモーダルを閉じる
        for (const key in states) {
            states[key as ModalType] = false;
        }
        return states;
    });
    
    modalData.set(null);
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

/**
 * モーダルの種類からコンテンツデータの型ガードを行う
 * 
 * @param {T} type モーダルの種類
 * @param {any} data モーダルコンテンツ
 * @returns {data is ModalDataMap[T]}
 */
export const checkModalType = <T extends ModalType>(type: T, data: any): data is ModalDataMap[T] => {
    // dataがオブジェクトで、かつlabelプロパティが存在し、その値がtypeと一致するかを確認
    return typeof data === 'object' && data !== null && data.label === type;
}