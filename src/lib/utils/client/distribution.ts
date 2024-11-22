import { get } from 'svelte/store';
import { DistributionContentsTypeObj, type DistributionContentsType, type DistributionType, type SelectedItemData } from '$types';
import { getDistributionContentsTypeName, armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson } from '.';

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
 * 文字列を逆順にする補助関数
 * @param {string} hex 逆順にしたい16進数文字列
 * @returns {string} 逆順にした16進数文字列
 */
const reverseHex = (hex: string): string => {
    return hex.match(/../g)?.reverse().join('') || hex;
};

/**
 * 配布物を処理するためのクラス
 */
export class ManageDistribution {
    /**
     * @param {SelectedItemData[]} items 処理対象の選択されたアイテムデータ
     */
    constructor(private items: SelectedItemData[]) {}

    /**
     * 16進数表記にして、指定された桁数まで0埋めする
     * @param {number} num 変換する数値
     * @param {number} padding 0埋めする桁数
     * @returns {string} 0埋めされた16進数の文字列
     */
    private formatHex(num: number, padding: number): string {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    }

    /**
     * 選択されたアイテムを16進数文字列に変換
     * @returns {string} アイテムデータを含む16進数文字列、選択されたアイテムがない場合は空文字を返す
     */
    private getHexString(): string {
        // アイテム未選択の場合、空文字を返す
        if (this.items.length === 0) {
            return '';
        }

        let result = this.formatHex(this.items.length, 4);
        for (const item of this.items) {
            result += `${this.formatHex(item.types, 2)}0000${reverseHex(item.item_data.code)}0000${this.formatHex(item.amount, 4)}00000000`;
        }

        return result;
    }

    /**
     * hex文字列を解析し、各データ値を取得する
     * @param {string} hexString 解析対象の16進数文字列
     * @returns {SelectedItemData[]} SelectedItemDataの配列
     */
    public static parseHexString(hexString: string): SelectedItemData[] {
        const items: SelectedItemData[] = [];
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

            // item_data.code（4文字）を逆順で取得
            const codeHex = hexString.slice(currentIndex, currentIndex + 4);
            const code = reverseHex(codeHex).toUpperCase();
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
            const itemData: SelectedItemData = {
                types,
                item_data: { code, name: '' },
                amount,
            };

            itemData.item_data.name = getDistContentsNameByType(types, code);

            items.push(itemData);
        }

        return items;
    }

    /**
     * sqlクエリを生成する
     * @param {string} name イベント名
     * @param {DistributionType} distType 配布扱い方法の種類
     * @param {string} description イベントの説明
     * @param {number} character_id キャラクターID
     * @returns {string} distributionテーブルに挿入するためのSQLクエリ文字列、hex文字列が存在しない場合は空文字を返す
     */
    public getSqlQuery(name: string, distType: DistributionType, description: string, character_id: number): string {
        const hex = this.getHexString();
        if (!hex) {
            return '';
        }

        return `INSERT INTO distribution (character_id,data,type,bot,event_name,description) VALUES (${character_id},DECODE(${hex},'hex'),${distType},false,"${name}","~C05 ${description}")`;
    }
}
