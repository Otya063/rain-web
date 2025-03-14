import { DateTime } from 'luxon';
import type { DistributionEditableItemType, InformationEditableItemType } from '$types';
import { getDistributionUpdatedValue, getInformationUpdatedValue } from '.';

export class Pager<T extends { id: number; type: number }> {
    private readonly limit: number = 5; // ページあたりの項目数
    private currentPage: number = 1; // 現在のページ数
    private originalItems: T[] = []; // ページ分割する元項目リスト（未フィルター）
    private isAscending: boolean = true; // 現在のソート順、デフォルトは昇順
    private storeUpdater: ((data: T[]) => void) | null = null; // データ更新用のコールバック
    private filters: { [key: string]: (item: T) => boolean } = {}; // フィルター関数のマップ

    constructor(items: Iterable<T>) {
        this.originalItems = Array.from(items);
    }

    /**
     * 最大ページ数を取得する
     *
     * @returns {number} Pagerリストの最大ページ数
     */
    get max(): number {
        return Math.max(1, Math.ceil(this.getPagerItems().length / this.limit));
    }

    /**
     * 現在のページに対応するデータを取得する
     *
     * @returns {T[]} 現在のページの項目リスト
     */
    private get page(): T[] {
        const items = this.getPagerItems();
        const startIndex = (this.currentPage - 1) * this.limit;
        return items.slice(startIndex, startIndex + this.limit);
    }

    /**
     * 現在のPagerリストを取得する（すべてのフィルターを適用）
     *
     * @returns {T[]} フィルター適用後のリスト
     */
    private getPagerItems(): T[] {
        let items = [...this.originalItems];

        // すべてのフィルターを適用
        for (const filter of Object.values(this.filters)) {
            items = items.filter(filter);
        }

        return this.isAscending ? items.sort((a, b) => a.id - b.id) : items.sort((a, b) => b.id - a.id);
    }

    /**
     * バインドしているストア変数のデータを更新する
     */
    private updateStore(): void {
        if (this.storeUpdater) {
            this.storeUpdater(this.page);
        }
    }

    /**
     * ストア変数にページネーションデータをバインドする
     *
     * @param {(data: T[]) => void} updater データ更新用のコールバック関数
     * @description
     * - このコールバックはページデータが更新されるたびに呼び出される
     * - Pagerクラスのインスタンス生成後、これを呼び出してページネーションデータの格納先ストア変数をバインドする
     * - 呼び出し以降、対象ストアは各メソッド（`getContent`、`setFilter`、`clearFilters`、`toggleSortOrder`、`updatePagerDistribution`、`updatePagerInformation`、`deleteItem`）使用時動的に更新される
     */
    bindStore(updater: (data: T[]) => void): void {
        this.storeUpdater = updater;
        this.updateStore();
    }

    /**
     * 指定ページのコンテンツを取得
     *
     * @param {number} pageNumber 表示したいページ番号
     */
    getContent(pageNumber: number): void {
        this.currentPage = Math.max(1, Math.min(pageNumber, this.max));
        this.updateStore();
    }

    /**
     * フィルターを追加または更新
     */
    private setFilter(key: string, filterFunction: ((item: T) => boolean) | null): void {
        if (filterFunction) {
            this.filters[key] = filterFunction;
        } else {
            delete this.filters[key]; // フィルターを削除
        }

        this.currentPage = 1;
        this.updateStore();
    }

    /**
     * 指定したフィルターをクリア（複数指定可）
     *
     * @param {string | string[]} keys 削除するフィルターのキー（"all" を指定すると全フィルターを削除）
     */
    clearFilters(keys: string | string[] = 'all'): void {
        if (keys === 'all') {
            this.filters = {}; // すべてのフィルターを削除
        } else {
            const keysArray = Array.isArray(keys) ? keys : [keys]; // 単一文字列を配列に変換
            keysArray.forEach((key) => delete this.filters[key]); // 指定キーを削除
        }

        this.currentPage = 1;
        this.updateStore();
    }

    /**
     * ソート順を切り替え（昇順⇔降順）
     */
    toggleSortOrder(): void {
        this.isAscending = !this.isAscending;
        this.updateStore();
    }

    /**
     * 指定した文字列を含む項目を絞り込む
     *
     * @param {keyof T} column フィルターを適用するカラム名
     * @param {string} searchTerm 検索する文字列
     */
    filterStringInclude(column: keyof T, searchTerm: string | null): void {
        if (!searchTerm) {
            this.setFilter(`text_${String(column)}`, null);
            return;
        }

        this.setFilter(`text_${String(column)}`, (item) => {
            const value = item[column];
            return typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }

    /**
     * 指定した数値配列を含む項目を絞り込む
     *
     * @param {keyof T} column フィルターを適用するカラム名
     * @param {number[]} numbers 許可する数値の配列
     */
    filterNumberArrInclude(column: keyof T, numbers: number[]): void {
        if (!numbers.length) {
            this.setFilter(`number_${String(column)}`, null);
            return;
        }

        this.setFilter(`number_${String(column)}`, (item) => {
            const value = item[column];
            return typeof value === 'number' && numbers.includes(value);
        });
    }

    /**
     * 指定したカラムの値が完全一致するデータのみを絞り込む
     *
     * @param {keyof T} column フィルターを適用するカラム名
     * @param {string | number | null} value フィルター対象の値（nullで解除）
     */
    filterExactMatch(column: keyof T, value: string | number | null): void {
        if (value === null) {
            this.setFilter(`exact_${String(column)}`, null);
            return;
        }

        this.setFilter(`exact_${String(column)}`, (item) => item[column] === value);
    }

    /**
     * Pagerにバインドされている配布データストアの指定項目を更新する
     *
     * @param {number} distId 更新する配布ID
     * @param {DistributionEditableItemType} column 更新するカラム名
     * @param {any} value 設定する新しい値
     */
    updatePagerDistribution(distId: number, column: DistributionEditableItemType, value: any): void {
        this.originalItems = this.originalItems.map((distribution) => {
            if (distribution.id === distId) {
                const updatedValue = getDistributionUpdatedValue(column, value);

                return {
                    ...distribution,
                    [column]: column === 'deadline' && updatedValue ? DateTime.fromISO(updatedValue as string).toJSDate() : updatedValue, // deadlineカラムはstringなのでDateに変換（nullの可能性があるため、updatedValue存在確認必要）
                    ...(column === 'character_id' && { type: !updatedValue ? 0 : 1 }),
                };
            }

            return distribution;
        });

        this.updateStore();
    }

    /**
     * Pagerにバインドされているインフォメーションデータストアの指定項目を更新する
     *
     * @param {number} infoId 更新するインフォメーションID
     * @param {InformationEditableItemType} column 更新するカラム名
     * @param {any} value 設定する新しい値
     */
    updatePagerInformation(infoId: number, column: InformationEditableItemType, value: any): void {
        this.originalItems = this.originalItems.map((information) => {
            const updatedValue = getInformationUpdatedValue(column, value);

            if (information.id === infoId) {
                return {
                    ...information,
                    [column]: column === 'created_at' ? DateTime.fromISO(updatedValue as string).toJSDate() : updatedValue, // created_atカラムはstringなのでDateに変換
                };
            }

            return information;
        });

        this.updateStore();
    }

    /**
     * 指定したIDを持つデータを削除する
     *
     * @param {number[]} ids 削除するデータのIDリスト
     */
    deleteItem(ids: number[]): void {
        this.originalItems = this.originalItems.filter((item) => !ids.includes(item.id));
        this.currentPage = Math.min(this.currentPage, this.max);
        this.updateStore();
    }
}

// export const generatePaginationBtn = (currentPage: number, totalPages: number, btnCount: number): (number | string)[] => {
//     //const btnCount = 5; // 現在のページ（ボタン中央）の両端に並ぶボタンの数
//     const left = currentPage - btnCount;
//     const right = currentPage + btnCount + 1;
//     const range: number[] = [];
//     const rangeWithDots: (number | string)[] = [];
//     let lastPage: number | undefined;

//     for (let page = 1; page <= totalPages; page++) {
//         if (page === 1 || page === totalPages || (page >= left && page < right)) {
//             range.push(page);
//         }
//     }

//     for (let page of range) {
//         if (lastPage !== undefined) {
//             if (page - lastPage === 2) {
//                 rangeWithDots.push(lastPage + 1);
//             } else if (page - lastPage !== 1) {
//                 rangeWithDots.push('...');
//             }
//         }
//         rangeWithDots.push(page);
//         lastPage = page;
//     }

//     return rangeWithDots;
// };
/**
 * ページネーションのために表示されるページ番号の範囲を生成する。必要に応じて省略記号（...）を含む
 *
 * @param {number} currentPage 現在アクティブなページ番号
 * @param {number} maxPages 総ページ数
 * @param {7 | 9} totalButtons 総ボタン数
 * @returns {(number | '...')[]} ページ番号と省略記号 ('...') の配列
 */
export const generatePaginationBtn = (currentPage: number, maxPages: number, totalButtons: 7 | 9): (number | '...')[] => {
    if (maxPages <= totalButtons) {
        return Array.from({ length: maxPages }, (_, i) => i + 1);
    }

    const buttons: (number | '...')[] = [];
    const minPage = 1;
    const sideButtons = Math.floor(totalButtons / 4);

    // 最小ページ番号
    buttons.push(minPage);

    if (currentPage > minPage + sideButtons + 1) {
        buttons.push('...');
    }

    let start = Math.max(minPage + 1, currentPage - sideButtons);
    let end = Math.min(maxPages - 1, currentPage + sideButtons);

    if (currentPage <= minPage + sideButtons + 1) {
        start = minPage + 1;
        end = minPage + totalButtons - 3;
    } else if (currentPage >= maxPages - sideButtons - 1) {
        end = maxPages - 1;
        start = maxPages - totalButtons + 3;
    }

    for (let i = start; i <= end; i++) {
        buttons.push(i);
    }

    if (currentPage < maxPages - sideButtons - 1) {
        buttons.push('...');
    }

    // 最大ページ番号
    buttons.push(maxPages);

    return buttons;
};
