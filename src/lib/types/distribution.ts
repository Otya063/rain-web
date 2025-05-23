import type { Distribution } from '$types';

// 配布内容物の種類
export const DistributionContentsTypeObj = {
    'Leg': 0,
    'Head': 1,
    'Chest': 2,
    'Arm': 3,
    'Waist': 4,
    'Melee': 5,
    'Ranged': 6,
    'Item': 7,
    'Furniture': 8,
    'Zenny': 10,
    'Festi Point': 12,
    'Tore Point': 14,
    'Poogie Outfit': 15,
    'Restyle Point': 16,
    'N Point': 17,
    'Goocoo Outfit': 18,
    'Premium Coin G': 19,
    'Trial Coin G': 20,
    'Frontier Point': 21,
    'Clan Point (IGN: RP)': 23,
    'Bond Point': 25,
    'Special Hall': 28,
    'Song Note': 29,
    'Item Box Page': 30,
    'Equipment Box Page': 31,
    'None': 65535,
} as const;
export type DistributionContentsType = (typeof DistributionContentsTypeObj)[keyof typeof DistributionContentsTypeObj];
export type DistributionContentsTypeName = keyof typeof DistributionContentsTypeObj;

// 配布カテゴリ
export const DistributionCategoryObj = {
    'Paid Item': 0, // アイテム販売商品の受取（各種特典の受取）
    'Event Item': 1, // イベント報酬の受取（各種特典の受取）
    'Compensation Item': 2, // お詫びアイテムの受取（各種特典の受取）
    'Promotion Item': 4, // キャンペーンの受取（各種特典の受取）
    'Subscription': 6, // 各種利用権の受取
    'Event Exchange': 7, // イベントの交換（アイテム・利用権交換）
    'Promotion Exchange': 8, // キャンペーンの交換（アイテム・利用権交換）
    'Subscription Exchange': 9, // 各種利用権の交換（アイテム・利用権交換）
} as const;
export type DistributionCategory = (typeof DistributionCategoryObj)[keyof typeof DistributionCategoryObj];
export type DistributionCategoryName = keyof typeof DistributionCategoryObj;

// 配布コンテンツデータ
export interface DistributionRawData {
    item_data: {
        code: string; // リトルエンディアン
        name: string;
    };
    types: DistributionContentsType;
    amount: number;
    disabled: boolean; // アイテム無効化フラグ
    showDropdown: boolean; // アイテムリスト表示フラグ
    selectedContentsType: DistributionContentsType; // セレクトボックスから選んだ時に設定
}

/**
 * 編集可能な配布データの項目
 */
export type DistributionEditableItemType = keyof Omit<Distribution, 'id' | 'type'>;
