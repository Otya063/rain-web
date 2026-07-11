import { writable } from 'svelte/store';
import type { RainServer } from '$types';

export const allRainServerData = writable<RainServer[]>([]);
