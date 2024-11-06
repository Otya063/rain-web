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
} as const;
export type DistributionContentsType = (typeof DistributionContentsTypeObj)[keyof typeof DistributionContentsTypeObj];

// 配布扱い方法の種類
export const DistributionTypeObj = {
    'Bought': 0,
    'Event': 1,
    'Compensation': 2,
    'Promo': 4,
    'Subscription': 6,
    'Event Item': 7,
    'Promo Item': 8,
    'Subscription Item': 9,
};
export type DistributionType = (typeof DistributionTypeObj)[keyof typeof DistributionTypeObj];

// 選択されたアイテムデータ
export interface SelectedItemData {
    item_data: {
        code: string;
        name: string;
    };
    types: DistributionContentsType;
    amount: number;
}
