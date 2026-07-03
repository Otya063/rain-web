import { writable } from 'svelte/store';
import type { User } from '$types';

export const filterUserValue = writable<string>('');
export const filterUserParam = writable<string>('');
export const userDisplayState = writable<{
    [userId: number]: {
        icon: string;
        selectedCharacterIndex: number;
    };
}>({});
export const pagerUserData = writable<User[]>([]); // pager用
export const lastSearchUsersResult = writable<User[] | undefined>(undefined); // UserMain再マウント時のpager復元用
export const scrollHintFlag = writable<boolean>(false); // スクロールヒント表示フラグ