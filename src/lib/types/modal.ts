import type { discord, suspended_account } from '@prisma/client/edge';

/* Modal in Admin Console
====================================================*/
interface ModalCommonData {
    title: string;
    form_action: string;
}

export interface DeleteInfoData extends ModalCommonData {
    info_id: number;
    info_title: string;
    info_url: string | null;
    info_created_at: string;
    info_type: string;
}

export interface DeleteBnrData extends ModalCommonData {
    bnr_id: number;
    bnr_url: string;
    bnr_name: string;
}

export interface SuspendUserData extends ModalCommonData {
    user_id: number;
    username: string;
    char_name: string[];
}

export interface DeleteCharacterData extends ModalCommonData {
    char_id: number;
    char_name: string | null;
}

export interface LinkDiscordData extends ModalCommonData {
    user_id: number;
    username: string;
    char_id: number;
    char_name: string;
    discord_id?: string;
}

/* Paginated User Type
====================================================*/
export interface PaginatedUsers1 {
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
}

export interface PaginatedUsers2 extends PaginatedUsers1 {
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
    totalPages?: number;
    count?: number;
    nextPage?: () => Promise<unknown>;
    exceedCount?: boolean;
    exceedTotalPages?: boolean;
}
