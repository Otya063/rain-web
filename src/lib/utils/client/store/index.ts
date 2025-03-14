import { writable } from 'svelte/store';

export * from './distribution';
export * from './information';
export * from './readable';
export * from './user';

export const preventHorizScrollOnDetailRow = writable<boolean>(false); // テーブル内横スクロールを詳細データ展開エリアでは無効にするフラグ（モバイル用）
