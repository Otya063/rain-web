import { writable } from 'svelte/store';
import type { Information } from '$types';

export const allInformationData = writable<Information[]>([]);
export const pagerInformationData = writable<Information[]>([]); // pager用
