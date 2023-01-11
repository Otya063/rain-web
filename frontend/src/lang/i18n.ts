import { writable } from 'svelte/store';

//get value of key item languange from cache
const cached = localStorage.getItem('lang');

//set global variable to chached value or default english
export const cached_lang = writable(cached);
export const browser_lang = navigator.language;

//monitor the value of 'lang', update the cache if the value changed
//cached_lang.subscribe((e) => localStorage.setItem('lang', e));
