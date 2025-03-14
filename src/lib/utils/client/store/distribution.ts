import { writable } from 'svelte/store';
import type { Distribution, DistributionRawData, Replace } from '$types';
import type { Pager } from '..';

export const allDistributionData = writable<Distribution[]>([]);
export const pagerDistributionData = writable<Distribution[]>([]); // pager用
export const claimedDistributions = writable<{ userId: number; charId: number; data: Replace<Distribution, { deadline: string | null }>[] }>({ userId: 0, charId: 0, data: [] });
export const distributionContentsData = writable<DistributionRawData[]>([
    {
        item_data: {
            code: '',
            name: '',
        },
        types: 65535,
        amount: 1,
        disabled: false,
        showDropdown: false,
        selectedContentsType: 65535,
    },
]);
export const createDistDataTitle = writable<string>('');
export const createDistDataDesc = writable<string>('');
export const distributionFilterText = writable<string>('');
export const openDistributionEditField = writable<number[]>([]);
export const distributionPagerInstance = writable<Pager<Distribution>>(); // DistributionListとDistributionEditorでpagerインスタンスを共有するため
