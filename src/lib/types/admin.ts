import type { guild_characters, suspended_account, discord } from '@prisma/client/edge';

/* Binary Data
====================================================*/
export type BinaryTypes =
    | 'savedata'
    | 'decomyset'
    | 'hunternavi'
    | 'otomoairou'
    | 'partner'
    | 'platebox'
    | 'platedata'
    | 'platemyset'
    | 'rengokudata'
    | 'savemercenary'
    | 'skin_hist'
    | 'minidata'
    | 'scenariodata'
    | 'savefavoritequest';

/* Paginated User Type
====================================================*/
export interface PaginatedUsers {
    id: number;
    username: string;
    password: string;
    rights: number;
    last_character: number | null;
    last_login: Date | null;
    return_expires: Date | null;
    gacha_premium: number | null;
    gacha_trial: number | null;
    frontier_points: number | null;
    psn_id: string | null;
    wiiu_key: string | null;
    web_login_key: string | null;
    web_login_key_mobile: string | null;
    characters: PaginatedCharacter[];
    suspended_account: suspended_account | null;
}

export interface PaginatedCharacter {
    id: number;
    user_id: number | null;
    is_new_character: boolean | null;
    name: string | null;
    gr: number | null;
    hrp: number | null;
    weapon_type: number | null;
    weapon_id: number;
    last_login: number | null;
    deleted: boolean;
    discord: discord | null;
    guild_characters: {
        guilds: {
            id: number;
            name: string | null;
            guild_characters: guild_characters[];
        } | null;
    } | null;
}

export interface PaginationMeta {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevCursor: number;
    nextCursor: number;
}

/* Paginated Clan Type
====================================================*/
export interface PaginatedClans {
    id: number;
    name: string | null;
    created_at: Date | null;
    leader_id: number;
    leader_name: string | null;
    guild_characters: {
        characters: {
            id: number;
            name: string | null;
            hrp: number | null;
            gr: number | null;
        } | null;
        order_index: number;
    }[];
}
