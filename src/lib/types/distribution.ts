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
} as const;
export type DistributionContentsType = (typeof DistributionContentsTypeObj)[keyof typeof DistributionContentsTypeObj];
export type DistributionContentsTypeName = keyof typeof DistributionContentsTypeObj

// 配布扱い方法の種類
export const DistributionTypeObj = {
    'Bought': 0, // アイテム販売商品
    'Event': 1, // イベント報酬
    'Compensation': 2, // お詫びアイテム
    'Promotion': 4, // キャンペーン
    'Subscription': 6, // 各種利用権
    'Event Item': 7,
    'Promotion Item': 8,
    'Subscription Item': 9,
};
export type DistributionType = (typeof DistributionTypeObj)[keyof typeof DistributionTypeObj];
export type DistributionTypeName = keyof typeof DistributionTypeObj;

// 選択されたアイテムデータ
export interface SelectedItemData {
    item_data: {
        code: string; // リトルエンディアン
        name: string;
    };
    types: DistributionContentsType;
    amount: number;
}
