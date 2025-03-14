import { writable } from 'svelte/store';
import type { PaginationMeta, PaginatedClans, PaginatedAlliances, Banner } from '$types';

export const filterClanValue = writable<string>('');
export const filterClanParam = writable<string>('');
export const filterAllianceValue = writable<string>('');
export const filterAllianceParam = writable<string>('');
export const adminTabValue = writable<string>('');
export const onSubmit = writable(false);
export const allBanners = writable<Banner[]>([]);
export const paginatedClansData = writable<PaginatedClans[]>([]);
export const paginationClansMetaData = writable<PaginationMeta>({
    hasPrevPage: false,
    hasNextPage: false,
    prevCursor: 0,
    nextCursor: 0,
});
export const paginatedAlliancesData = writable<PaginatedAlliances[]>([]);
export const paginationAlliancesMetaData = writable<PaginationMeta>({
    hasPrevPage: false,
    hasNextPage: false,
    prevCursor: 0,
    nextCursor: 0,
});
export const clanNameData = writable<string[]>(['']);

/**
 * Rain APIを介してファイルをアップロードする
 *
 * @param {string} origin オリジン（リクエストの発信元）
 * @param {File} file アップロードするファイル
 * @param {string} lang 言語コード
 * @returns {Promise<boolean>} アップロードが成功した場合はtrue、失敗した場合はfalse
 */
export const uploadFileViaApi = async (origin: string, file: File, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'POST',
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            lang,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const uploadToR2Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    return uploadToR2Response.ok ? true : false;
};

/**
 * Rain APIを介してファイルを削除する
 *
 * @param {string} origin オリジン（リクエストの発信元）
 * @param {string} fileName 削除するファイルの名前
 * @param {string} lang 言語コード
 * @returns {Promise<boolean>} 削除が成功した場合はtrue、失敗した場合はfalse
 */
export const deleteFileViaApi = async (origin: string, fileName: string, lang: string): Promise<boolean> => {
    const getPresignedUrlResponse = await fetch('https://api.rain-server.com/banner', {
        method: 'DELETE',
        body: JSON.stringify({
            lang,
            fileName,
        }),
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin,
        },
    });

    const { presignedUrl } = await getPresignedUrlResponse.json();

    const deleteToR2Response = await fetch(presignedUrl, {
        method: 'DELETE',
    });

    return deleteToR2Response.ok ? true : false;
};

/**
 * 認証中のボタンの状態を切り替える
 *
 * @param {boolean} enable ボタンを有効化するか無効化するかのフラグ
 * @param {HTMLElement | null} btnElm 対象のボタン要素
 * @param {HTMLCollectionOf<Element> | null} [labelElm] 対象のラベル要素
 * @param {NodeListOf<Element> | null} [inputElm] 対象の入力フィールド要素
 */
export const switchBtnInAuth = (enable: boolean, btnElm: HTMLElement | null, labelElm: HTMLCollectionOf<Element> | null = null, inputElm: NodeListOf<Element> | null = null): void => {
    if (enable) {
        btnElm?.classList.remove('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.remove('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.remove('disabled_elm');
        });
    } else {
        btnElm?.classList.add('loading_btn', 'disabled_elm');

        if (labelElm) {
            Array.from(labelElm).forEach((elm) => {
                elm.classList.add('disabled_elm');
            });
        }

        inputElm?.forEach((elm) => {
            elm.classList.add('disabled_elm');
        });
    }
};

/**
 * 編集モードを切り替える
 *
 * @param {number} id 編集対象のID
 * @param {T} type 切り替えたいカテゴリのタイプ
 * @param {Record<T, boolean>} catTypes 現在のカテゴリ状態
 * @returns {{ updatedCatTypes: Record<T, boolean>, updatedEditingId: number }} 更新後の状態
 */
export const editModeSwitch = <T extends string>(id: number, type: T, catTypes: Record<T, boolean>): { updatedCatTypes: Record<T, boolean>; updatedEditingId: number } => {
    const isAnyActive = Object.values(catTypes).some((isActive) => isActive);
    const updatedCatTypes = { ...catTypes };

    let updatedEditingId = 0;

    if (isAnyActive && id !== 0) {
        // 既に別のカテゴリが表示中の場合、編集対象切り替え
        Object.keys(updatedCatTypes).forEach((key) => {
            updatedCatTypes[key as T] = false;
        });

        updatedCatTypes[type] = true;
        updatedEditingId = id;
    } else {
        // 通常時、開閉トグル
        updatedCatTypes[type] = !updatedCatTypes[type];
        updatedEditingId = updatedCatTypes[type] ? id : 0;
    }

    return { updatedCatTypes, updatedEditingId };
};
