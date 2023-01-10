import { writable } from "svelte/store"

//get value of key item languange from cache
const cached = localStorage.getItem('lang')

//set global variable to chached value or default english
export const lang = writable(cached||'en')

//monitor the value of 'lang', update the cache if the value changed
lang.subscribe(e=>localStorage.setItem('lang',e))

