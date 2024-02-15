import type { guild_characters, suspended_account } from '@prisma/client/edge';

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

export interface PaginatedCharacter {
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
    discord: {
        id: number;
        char_id: number;
        discord_id: string;
        is_male: boolean | null;
        bounty: number;
        road_champion: boolean;
        rain_demolizer: boolean;
        bounty_champion: boolean;
        bounty_master: boolean;
        bounty_expert: boolean;
        gacha: number;
        pity: number;
        newbie: boolean;
        latest_bounty: string;
        title: number | null;
        gold: number | null;
        silver: number | null;
        bronze: number | null;
    } | null;
    guild_characters: {
        guilds: {
            id: number;
            name: string | null;
            guild_characters: guild_characters[]
        } | null;
    } | null;
}

export interface PaginationMeta {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevCursor: number;
    nextCursor: number;
}
