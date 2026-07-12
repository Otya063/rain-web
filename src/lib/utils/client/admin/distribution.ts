import { DateTime } from 'luxon';
import { get } from 'svelte/store';
import { DistributionContentsTypeObj, type DistributionContentsType, type DistributionContentsItem, type DistributionRawData, type DistributionEditableItemType } from '$types';
import {
    getDistributionContentsTypeName,
    armJson,
    chestJson,
    headJson,
    itemJson,
    legJson,
    meleeJson,
    poogieJson,
    rangedJson,
    waistJson,
    getDistItemsData,
    convHrToHrp,
    openDistributionEditField,
} from '..';

/**
 * 配布コンテンツの種類に応じたデータ名を取得する
 *
 * @param {DistributionContentsType} type 配布コンテンツの種類
 * @param {string} code 各データのLE
 * @returns {string} 該当するデータ名文字列
 */
const getDistContentsNameByType = (type: DistributionContentsType, code: string): string => {
    switch (type) {
        case DistributionContentsTypeObj.Leg: {
            const legData = get(legJson);
            return legData[code] || 'Unknown Armor';
        }

        case DistributionContentsTypeObj.Head: {
            const headData = get(headJson);
            return headData[code] || 'Unknown Armor';
        }

        case DistributionContentsTypeObj.Chest: {
            const chestData = get(chestJson);
            return chestData[code] || 'Unknown Armor';
        }

        case DistributionContentsTypeObj.Arm: {
            const armData = get(armJson);
            return armData[code] || 'Unknown Armor';
        }

        case DistributionContentsTypeObj.Waist: {
            const waistData = get(waistJson);
            return waistData[code] || 'Unknown Armor';
        }

        case DistributionContentsTypeObj.Melee: {
            const meleeData = get(meleeJson);
            return meleeData[code] || 'Unknown Weapon';
        }

        case DistributionContentsTypeObj.Ranged: {
            const rangedData = get(rangedJson);
            return rangedData[code] || 'Unknown Weapon';
        }

        case DistributionContentsTypeObj.Item: {
            const itemData = get(itemJson);
            return itemData[code] || 'Unknown Item';
        }

        case DistributionContentsTypeObj['Poogie Outfit']: {
            const poogieData = get(poogieJson);
            return poogieData[code] || 'Unknown Outfit';
        }

        default: {
            return getDistributionContentsTypeName(type);
        }
    }
};

/**
 * 配布物を処理するためのクラス
 */
export class ManageDistribution {
    /**
     * 16進数表記にして、指定された桁数まで0埋めする
     *
     * @param {number} num 変換する数値
     * @param {number} padding 0埋めする桁数
     * @returns {string} 0埋めされた16進数の文字列
     */
    private static formatHex(num: number, padding: number): string {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    }

    /**
     * 16進数のエンディアン変換を行う
     *
     * @param {string} hex エンディアン変換対象の16進数
     * @returns {string} 変換後の16進数
     */
    private static reverseHex = (hex: string): string => {
        return hex.match(/../g)?.reverse().join('') || hex;
    };

    /**
     * 加工前配布物配列データをtypes->code順に昇順ソートする
     *
     * @param {DistributionRawData[]} contDataArr ソートする配列
     * @returns {DistributionRawData[]} ソート後配列
     */
    private static sortContentsDataArray = (contDataArr: DistributionRawData[]): DistributionRawData[] => {
        return contDataArr
            .slice() // 元の配列が変化しないように
            .sort((a, b) => {
                // まずはtypesを基に昇順
                if (a.types !== b.types) {
                    return a.types - b.types;
                }

                // 同じtypess同士の中で更にitem_data.codeを10進数に変換して昇順にする
                const aDecimal = parseInt(this.reverseHex(a.item_data.code), 16);
                const bDecimal = parseInt(this.reverseHex(b.item_data.code), 16);

                return aDecimal - bDecimal;
            });
    };

    /**
     * 選択されたアイテムを配布アイテムデータ配列に変換
     *
     * @param {Record<string, any>} data クライアントから送られてきた変換元データ
     * @returns {DistributionContentsItem[] | null} 変換後の配布アイテムデータ配列、選択されたアイテムがない場合や不正な形式の場合はnullを返す
     */
    public static getContentsDataArray(data: Record<string, any>): DistributionContentsItem[] | null {
        let contDataArr: DistributionRawData[] = Object.entries(data).map(([key, amount]) => {
            const match = key.match(/^(\d{1,2})-(\w{4})-\[(.+)\]$/);
            if (!match) {
                // マッチしないもの（適切な形式で送信されなかった）は無効とする
                return {
                    item_data: {
                        code: '----',
                        name: '',
                    },
                    types: 0,
                    amount: 0,
                    disabled: false,
                    showDropdown: false,
                    selectedContentsType: 65535,
                };
            }

            const [, types, code, name] = match;
            return {
                item_data: {
                    code,
                    name,
                },
                types: Number(types) as DistributionContentsType,
                amount: Number(amount),
                disabled: false,
                showDropdown: false,
                selectedContentsType: 65535,
            };
        });

        // 一要素でもitem_data.codeが「----」であった場合（正規表現にマッチしない）、nullを返す
        if (contDataArr.some((item) => item.item_data.code === '----')) {
            return null;
        }

        // アイテム空の場合、nullを返す
        if (contDataArr.length === 0) {
            return null;
        }

        // 配列を昇順にソートする
        contDataArr = this.sortContentsDataArray(contDataArr);

        return contDataArr.map((item) => ({
            item_type: item.types,
            item_id: parseInt(this.reverseHex(item.item_data.code), 16),
            quantity: item.amount,
        }));
    }

    /**
     * 配布アイテムデータ配列を解析し、フォーム編集用のデータ値を取得する
     *
     * @param {DistributionContentsItem[]} items 解析対象の配布アイテムデータ配列
     * @returns {DistributionRawData[]} 解析後の配布物データオブジェクト配列
     */
    public static buildRawDataFromContentsData(items: DistributionContentsItem[]): DistributionRawData[] {
        return items.map((item) => {
            const code = this.reverseHex(this.formatHex(item.item_id, 4));

            return {
                types: item.item_type,
                item_data: { code, name: getDistContentsNameByType(item.item_type, code) },
                amount: item.quantity,
                disabled: false, // アイテム無効化フラグ
                showDropdown: false, // アイテムリスト表示フラグ
                selectedContentsType: item.item_type, // セレクトボックスから選んだ時に設定（デフォルト値はtypesと同じ）
            };
        });
    }

    /**
     * 対象アイテム（`DistributionContentsType`とアイテム名から特定）の16進数コードを取得する
     *
     * @param {DistributionContentsType} contentsType 配布コンテンツタイプ
     * @param {string} value アイテム名
     * @returns {string} 配布アイテムの16進数コード
     */
    public static getCodeFromItemName = (contentsType: DistributionContentsType, value: string): string => {
        const object = getDistItemsData(contentsType);

        return Object.keys(object).find((key) => object[key] === value) || '';
    };
}

/**
 * カーソル位置に指定したテキストを挿入する
 *
 * @param {string} text 挿入するテキスト
 * @param {HTMLInputElement | HTMLTextAreaElement | undefined} targetElement 操作対象の入力要素
 * @param {boolean} isInputFocused 現在の入力フィールドがフォーカスされているかどうか
 * @param {(newValue: string) => void} updatePreview プレビュー値を更新するためのコールバック関数
 */
export const insertTextAtCursor = (text: string, targetElement: HTMLInputElement | HTMLTextAreaElement | undefined, isInputFocused: boolean, updatePreview: (newValue: string) => void): void => {
    if (!targetElement || !isInputFocused) {
        return;
    }

    const start = targetElement.selectionStart;
    const end = targetElement.selectionEnd;
    const currentValue = targetElement.value;

    if (start === null || end === null) {
        return;
    }

    // カーソル位置に新しいテキストを挿入
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

    // テキストエリアの値を更新し、カーソル位置を調整
    targetElement.value = newValue;
    targetElement.setSelectionRange(start + text.length, start + text.length);

    // プレビューを更新
    updatePreview(newValue);
};

/**
 * テキストエリアで「Enter」キーが押された際に、改行を`<br>`に変換する
 *
 * @param {KeyboardEvent} event キーボードイベント
 * @param {HTMLTextAreaElement | undefined} textAreaElement 操作対象のテキストエリア要素
 * @param {boolean} isInputFocused テキストエリアがフォーカスされているかどうか
 * @param {(newValue: string) => void} updatePreview プレビュー値を更新するためのコールバック関数
 */
export const handleKeyDownInTextArea = (event: KeyboardEvent, textAreaElement: HTMLTextAreaElement | undefined, isInputFocused: boolean, updatePreview: (newValue: string) => void) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // 改行のデフォルト動作を防ぐ
        insertTextAtCursor('<br>', textAreaElement, isInputFocused, updatePreview);
    }
};

/**
 * 配布データ編集フィールドの開閉処理を制御する
 *
 * @param {number} distributionId 処理対象の配布データID
 */
export const handleDistributionEditField = (distributionId: number): void => {
    openDistributionEditField.update((items) => {
        if (items.includes(distributionId)) {
            return items.filter((id) => id !== distributionId); // 削除
        } else {
            return [...items, distributionId]; // 追加
        }
    });
};

/**
 * 配布データにおけるカラムごとの更新値を取得
 *
 * @param {DistributionEditableItemType} column カラム名
 * @param {string | null} value 値
 * @returns {string | number | Date | null} 更新後の値
 */
export const getDistributionUpdatedValue = (column: DistributionEditableItemType, value: string | null): string | number | Date | null => {
    if (!value) {
        // deadline: 無期限、character_id: 特定キャラクター指定なし
        return column === 'deadline' || column === 'character_id' ? null : value;
    }

    switch (column) {
        // case 'category': {
        //     return DistributionCategoryObj[value as DistributionCategoryName];
        // }
        case 'category': {
            return Number(value);
        }

        case 'event_name':
        case 'description': {
            return value.replace(/ /g, ' ');
        } // スペースのバグ（16進数：20ではなくなぜか803Fになる）を修正する

        case 'deadline': {
            // postgres処理において、クエリを変数に格納して実行するためDateはstringである必要がある
            return DateTime.fromISO(value).setZone('utc').toString();
        } // valueは現地時間なので、UTCに変換して保存（ゲーム内では+9日本時間に変換される）

        case 'times_acceptable':
        case 'character_id': {
            return Number(value);
        }

        case 'min_hr':
        case 'max_hr': {
            return Number(value) === 0 ? null : convHrToHrp(Number(value));
        }

        case 'min_sr':
        case 'max_sr':
        case 'min_gr':
        case 'max_gr': {
            return Number(value) === 0 ? null : Number(value);
        }

        // クライアント側でdataカラムを更新する際は、サーバー側からformData経由で取得するためそのままvalueを返す

        default: {
            return value;
        }
    }
};

/**
 * 配布タイトル編集時、改行を禁止する
 *
 * @param {HTMLDivElement} editorContainer エディター要素
 * @param {KeyboardEvent} event キーボードイベント
 */
export const preventEnterKeyInEditor = (editorContainer: HTMLDivElement, event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        editorContainer.innerHTML = `<p>${editorContainer.innerHTML.replace(/<\/?p>/g, '')}</p>`;
    }
};
