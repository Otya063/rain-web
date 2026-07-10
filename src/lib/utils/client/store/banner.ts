import { writable } from 'svelte/store';
import type { Banner } from '$types';

export const allBannerData = writable<Banner[]>([]);
// export const pagerBannerData = writable<Banner[]>([]); // pager用
