import { writable } from 'svelte/store';
import type { User, PaginationMeta } from '$types';

export const filterUserValue = writable<string>('');
export const filterUserParam = writable<string>('');
export const paginatedUsersData = writable<User[]>([]);
export const paginationMetaData = writable<PaginationMeta>({
    hasPrevPage: false,
    hasNextPage: false,
    prevCursor: 0,
    nextCursor: 0,
});
export const userDisplayState = writable<{
    [userId: number]: {
        icon: string;
        selectedCharacterIndex: number;
        enableMoreActions: boolean;
    };
}>({});
