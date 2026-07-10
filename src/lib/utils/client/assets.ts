import { writable } from 'svelte/store';
import type { JsonData } from '$types';

export const headJson = writable<JsonData>();
export const chestJson = writable<JsonData>();
export const armJson = writable<JsonData>();
export const waistJson = writable<JsonData>();
export const legJson = writable<JsonData>();
export const meleeJson = writable<JsonData>();
export const rangedJson = writable<JsonData>();
export const itemJson = writable<JsonData>();
export const poogieJson = writable<JsonData>();
