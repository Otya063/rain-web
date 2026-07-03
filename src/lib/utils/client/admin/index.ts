import { writable } from 'svelte/store';

export * from './distribution';
export * from './modal';
export * from './temp';
export * from './user';

export const adminTabValue = writable<string>('system');
export const onSubmit = writable(false);

/**
 * フィルター機能付きチェックボックスにおける選択要素の「追加/削除」処理を行う
 *
 * @param {number[]} selectedTypeFilterCheckbox 選択した要素を格納している元データ
 * @param {number} typeIndex 追加もしくは削除する対象のデータ
 * @returns {number[]} 更新後の選択要素データ
 */
export const toggleFilterCheckbox = (selectedTypeFilterCheckbox: number[], typeIndex: number): number[] => {
    if (selectedTypeFilterCheckbox.includes(typeIndex)) {
        // 削除
        return selectedTypeFilterCheckbox.filter((type) => type !== typeIndex);
    } else {
        // 追加
        return [...selectedTypeFilterCheckbox, typeIndex];
    }
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

/**
 * ストア変数でない編集フィールドの開閉処理を制御する
 *
 * @param {number} dataId 処理対象のデータID
 */
export const handleCommonEditField = (fields: number[], dataId: number): number[] => {
    if (fields.includes(dataId)) {
        return fields.filter((id) => id !== dataId); // 削除
    } else {
        return [...fields, dataId]; // 追加
    }
};
