import type { discord, suspended_account } from '@prisma/client/edge';

/* Paginated User Type
====================================================*/
export interface PaginatedUsers {
    id: number;
    username: string;
    password: string;
    item_box: Buffer | null;
    rights: number;
    last_character: number | null;
    last_login: Date | null;
    return_expires: Date | null;
    gacha_premium: number | null;
    gacha_trial: number | null;
    frontier_points: number | null;
    web_login_key: string | null;
    characters: PaginatedCharacter[];
    suspended_account: suspended_account | null;
}

interface PaginatedCharacter {
    id: number;
    last_login: number | null;
    user_id: number | null;
    is_new_character: boolean | null;
    name: string | null;
    gr: number | null;
    hrp: number | null;
    weapon_type: number | null;
    weapon_id: number;
    deleted: boolean;
    discord: discord | null;
}

export interface PaginationMeta {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevCursor: number;
    nextCursor: number;
}
