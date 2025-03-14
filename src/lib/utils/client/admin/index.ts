export * from './distribution';
export * from './information';
export * from './modal';
export * from './temp';
export * from './user';

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
