import { writable } from 'svelte/store';
import { browser } from '$app/environment';

let cached;
let browser_lang;
if (browser) {
	//get value of key item languange from cache
	cached = localStorage.getItem('lang');
	//get value of browser language (otya)
	browser_lang = navigator.language;
}

//set global language state with language cache or browser language if cache empty
export const cached_lang = writable(cached || browser_lang);
