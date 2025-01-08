import { get, writable } from 'svelte/store';
import { DistributionContentsTypeObj, type DistributionContentsType, type DistributionType, type DistContentsData, DistributionTypeObj, type DistributionTypeName, type Distribution } from '$types';
import { getDistributionContentsTypeName, armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson, getDistItemsData, convertColorString, convHrToHrp } from '.';
import { DateTime } from 'luxon';

export const distributionContentsData = writable<DistContentsData[]>([]);
export const createDistDataTitle = writable<string>('');
export const createDistDataDesc = writable<string>('');

/**
 * 配布コンテンツの種類に応じたデータ名を取得する
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
     * @param {number} num 変換する数値
     * @param {number} padding 0埋めする桁数
     * @returns {string} 0埋めされた16進数の文字列
     */
    private static formatHex(num: number, padding: number): string {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    }
    /**
     * 16進数のエンディアン変換を行う
     * @param {string} hex エンディアン変換対象の16進数
     * @returns {string} 変換後の16進数
     */

    private static reverseHex = (hex: string): string => {
        return hex.match(/../g)?.reverse().join('') || hex;
    };

    private static sortContentsDataArray = (contDataArr: DistContentsData[]): DistContentsData[] => {
        return contDataArr
            .slice() // 元の配列が変化しないよう、浅いコピー作成
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
     * 選択されたアイテムを16進数文字列に変換
     * @param {Record<string, any>} data クライアントから送られてきた変換元データ
     * @returns {string} アイテムデータを含む16進数文字列、選択されたアイテムがない場合は空文字を返す
     */
    public static getHexString(data: Record<string, any>): string {
        let contDataArr: DistContentsData[] = Object.entries(data).map(([key, amount]) => {
            const match = key.match(/^(\d{1,2})-(\w{4})-\[(.+)\]$/);
            if (!match) {
                // マッチしないもの（適切な形式で送信されなかった）は無効とする
                return {
                    item_data: {
                        code: '0000',
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

        // 一要素でもitem_data.codeが「0000」であった場合、空文字列を返す
        if (contDataArr.some((item) => item.item_data.code === '0000')) {
            return '';
        }

        // アイテム空の場合、空文字を返す
        if (contDataArr.length === 0) {
            return '';
        }

        // 配列を昇順にソートする
        contDataArr = this.sortContentsDataArray(contDataArr);

        let result = this.formatHex(contDataArr.length, 4);
        for (const item of contDataArr) {
            result += `${this.formatHex(item.types, 2)}0000${this.reverseHex(item.item_data.code)}0000${this.formatHex(item.amount, 4)}00000000`;
        }

        return result;
    }

    /**
     * hex文字列を解析し、各データ値を取得する
     * @param {string} hexString 解析対象の16進数文字列
     * @returns {DistContentsData[]} SelectedItemDataの配列
     */
    public static parseHexString(hexString: string): DistContentsData[] {
        const items: DistContentsData[] = [];
        let currentIndex = 0;

        // アイテムの数を取得（最初の4文字）
        const itemCountHex = hexString.slice(currentIndex, currentIndex + 4);
        const itemCount = parseInt(itemCountHex, 16);
        currentIndex += 4;

        // 各アイテムデータを解析
        for (let i = 0; i < itemCount; i++) {
            // type（2文字）を取得
            const typesHex = hexString.slice(currentIndex, currentIndex + 2);
            const types = parseInt(typesHex, 16) as DistributionContentsType;
            currentIndex += 2;

            //「0000」のプレースホルダ部分をスキップ
            currentIndex += 4;

            // item_data.code（4文字、BE -> LE）をLE形式で取得
            const codeHex = hexString.slice(currentIndex, currentIndex + 4);
            const code = this.reverseHex(codeHex).toUpperCase();
            currentIndex += 4;

            //「0000」のプレースホルダ部分をスキップ
            currentIndex += 4;

            // amount（4文字）を取得
            const amountHex = hexString.slice(currentIndex, currentIndex + 4);
            const amount = parseInt(amountHex, 16);
            currentIndex += 4;

            //「00000000」のプレースホルダ部分をスキップ
            currentIndex += 8;

            // データをSelectedItemDataとして追加
            const itemData: DistContentsData = {
                types,
                item_data: { code, name: '' },
                amount,
                disabled: false, // アイテム無効化フラグ
                showDropdown: false, // アイテムリスト表示フラグ
                selectedContentsType: 65535, // セレクトボックスから選んだ時に設定
            };

            itemData.item_data.name = getDistContentsNameByType(types, code);

            items.push(itemData);
        }

        return items;
    }

    /**
     *
     * @param {DistributionContentsType} contentsType 配布コンテンツタイプ
     * @param {string} value アイテム名
     * @returns {string} 配布アイテムの16進数コード
     */
    public static getCodeFromItemName = (contentsType: DistributionContentsType, value: string): string => {
        const object = getDistItemsData(contentsType);
        return Object.keys(object).find((key) => object[key] === value) || '';
    };

    /**
     * sqlクエリを生成する
     * @param {string} title イベントタイトル
     * @param {DistributionType} distType 配布扱い方法の種類
     * @param {string} description イベントの説明
     * @param {number} character_id キャラクターID
     * @returns {string} distributionテーブルに挿入するためのSQLクエリ文字列、hex文字列が存在しない場合は空文字を返す
     */
    /* public getSqlQuery(title: string, distType: DistributionType, description: string, character_id: number): string {
        const hex = this.getHexString();
        if (!hex) {
            return '';
        }

        return `INSERT INTO distribution (character_id,data,type,bot,event_name,description) VALUES (${character_id},DECODE(${hex},'hex'),${distType},false,"${title}","~C05 ${description}")`;
    } */
}

/**
 * 指定された配布物データを更新する
 * @param {Distribution[]} data 更新対象の配布物配列
 * @param {number} distId 更新する配布物ID
 * @param {keyof Omit<Distribution, 'id'>} column 更新するカラム名
 * @param {string | null} value カラム名に代入する値
 * @param {string} updatedContentsData カラム名が`data`の場合に使用される更新された配布コンテンツデータ
 * @returns {Distribution[]} 更新後の配列
 */
export const updateDistributionData = (data: Distribution[], distId: number, column: keyof Omit<Distribution, 'id'>, value: string | null, updatedContentsData: string): Distribution[] => {
    return data.map((distribution) => {
        if (distribution.id === distId) {
            return {
                ...distribution,
                [column]:
                    column === 'type'
                        ? DistributionTypeObj[value as DistributionTypeName]
                        : column === 'event_name' || column === 'description'
                          ? convertColorString('colorNum', value!, column) // ゲーム内カラーコードに変換
                          : column === 'deadline'
                            ? !value
                                ? null // 無期限
                                : DateTime.fromISO(value).toJSDate()
                            : column === 'times_acceptable'
                              ? Number(value!) // number型なので変換必要
                              : column === 'min_hr' || column === 'max_hr'
                                ? convHrToHrp(Number(value!))
                                : column === 'min_sr' || column === 'max_sr' || column === 'min_gr' || column === 'max_gr'
                                  ? Number(value!) === 0
                                      ? 65535 // 0の時は無条件なので65535
                                      : Number(value!) // それ以外はそのままgr
                                  : column === 'data'
                                    ? updatedContentsData // サーバー側からformData経由で取得
                                    : column === 'character_id'
                                      ? !value
                                          ? null // 特定キャラクター指定なし
                                          : Number(value!) // number型なので変換必要
                                      : value,
            };
        }

        return distribution;
    });
};
