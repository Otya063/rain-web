export type ModalType = 'deleteInfo' | 'deleteBnr' | 'suspendUser' | 'deleteCharacter' | 'linkDiscord' | 'rebuildClan' | 'downloadBinary';

/* Modal in Admin Console
====================================================*/
export interface ModalCommonData {
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
    until_at?: Date;
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

export interface RebuildClanData extends ModalCommonData {
    clan_id: number;
    clan_name: string;
    clan_leader: string;
    created_at: Date | null;
}