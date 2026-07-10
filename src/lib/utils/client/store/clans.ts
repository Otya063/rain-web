import { writable } from 'svelte/store';
import type { PaginatedAlliances, PaginatedClans } from '$types';

export const pagerClansData = writable<PaginatedClans[]>([]);
export const lastSearchClansResult = writable<PaginatedClans[] | undefined>(undefined); // Clans再マウント時のpager復元用

export const pagerAlliancesData = writable<PaginatedAlliances[]>([]);
export const lastSearchAlliancesResult = writable<PaginatedAlliances[] | undefined>(undefined); // Alliance再マウント時のpager復元用
