import { writable } from 'svelte/store';

export const filterClanValue = writable<string>('');
export const filterClanParam = writable<string>('');
export const filterAllianceValue = writable<string>('');
export const filterAllianceParam = writable<string>('');
export const clanNameData = writable<string[]>(['']);
