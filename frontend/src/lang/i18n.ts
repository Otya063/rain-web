import { writable } from 'svelte/store';

//get value of key item languange from cache
const cached = localStorage.getItem('lang');

//get value of browser language (otya)
const browser_lang = navigator.language;

//set global language state with language cache or browser language if cache empty
export const cached_lang = writable(cached || browser_lang);


