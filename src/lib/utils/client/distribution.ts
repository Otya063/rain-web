import { DistributionContentsTypeObj, type DistributionContentsType, type DistributionType, type SelectedItemData } from '$types';
import { getDistributionContentsTypeName } from '.';

/**
 * アイテムのtypeに応じてnameを動的にロードする
 * @param {DistributionContentsType} type DistributionContentsTypeの値
 * @param {string} code item_data.codeの値
 * @returns {Promise<string>} 該当するname文字列または空文字列
 */
const getDistContentsNameByType = async (type: DistributionContentsType, code: string): Promise<string> => {
    switch (type) {
        case DistributionContentsTypeObj.Leg: {
            const { legEn } = await import('$i18n/en/leg');

            return legEn[code];
        }

        case DistributionContentsTypeObj.Head: {
            const { headEn } = await import('$i18n/en/head');

            return headEn[code];
        }

        case DistributionContentsTypeObj.Chest: {
            const { chestEn } = await import('$i18n/en/chest');

            return chestEn[code];
        }

        case DistributionContentsTypeObj.Arm: {
            const { armEn } = await import('$i18n/en/arm');

            return armEn[code];
        }

        case DistributionContentsTypeObj.Waist: {
            const { waistEn } = await import('$i18n/en/waist');

            return waistEn[code];
        }

        case DistributionContentsTypeObj.Melee: {
            const { meleeEn } = await import('$i18n/en/melee');

            return meleeEn[code];
        }

        case DistributionContentsTypeObj.Ranged: {
            const { rangedEn } = await import('$i18n/en/ranged');

            return rangedEn[code];
        }

        case DistributionContentsTypeObj.Item: {
            const { itemEn } = await import('$i18n/en/item');

            return itemEn[code];
        }

        case DistributionContentsTypeObj['Poogie Outfit']: {
            const { poogieEn } = await import('$i18n/en/poogie');

            return poogieEn[code];
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
     * @returns {Promise<SelectedItemData[]>} SelectedItemDataの配列
     */
    public static async parseHexString(hexString: string): Promise<SelectedItemData[]> {
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

            itemData.item_data.name = await getDistContentsNameByType(types, code);

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
