import type { DistributionType, SelectedItemData } from '$lib/types';

/**
 * 選択されたアイテムのデータを処理するためのクラス
 */
export class BinaryOpration {
    /**
     * @param items 処理対象の選択されたアイテムデータ
     */
    constructor(public items: SelectedItemData[]) {}

    /**
     * 16進数表記にして、指定された桁数まで0埋めする
     * @param num 変換する数値
     * @param padding 0埋めする桁数
     * @returns 0埋めされた16進数の文字列
     */
    private formatHex(num: number, padding: number): string {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    }

    /**
     * エンディアン変換を行う
     * @param hex 反転する16進数の文字列
     * @returns 順序が反転した16進数の文字列
     */
    private reverseHex(hex: string): string {
        return hex.slice(2, 4) + hex.slice(0, 2);
    }

    /**
     * 選択されたアイテムを16進数文字列に変換
     * @returns アイテムデータを含む16進数文字列、選択されたアイテムがない場合は無効化される
     */
    private getHexString() {
        // アイテム未選択の場合、処理を無効化
        if (this.items.length === 0) {
            return;
        }

        let result = this.formatHex(this.items.length, 4);
        for (const item of this.items) {
            result += `${this.formatHex(item.types, 2)}0000${this.reverseHex(item.item_data.code)}0000${this.formatHex(item.amount, 4)}00000000`;
        }

        return result;
    }

    /**
     * SQLクエリを生成する
     * @param name イベント名
     * @param description イベントの説明
     * @param character_id キャラクターID
     * @returns distributionテーブルに挿入するためのSQLクエリ文字列、アイテムが選択されていない場合は無効
     */
    getSqlQuery(name: string, distType: DistributionType, description: string, character_id: number) {
        const hex = this.getHexString();
        if (hex === undefined) {
            return;
        }

        return `INSERT INTO distribution (character_id,data,type,bot,event_name,description) VALUES (${character_id},DECODE(${hex},'hex'),${distType},false,"${name}","~C05 ${description}")`;
    }
}
