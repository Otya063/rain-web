export type ModalType = 'deleteInfo' | 'deleteBnr' | 'suspendUser' | 'deleteCharacter' | 'linkDiscord' | 'rebuildClan' | 'downloadBinary' | 'deleteDistribution' | 'distDescEditor' | 'distTitleEditor';
export type ModalUnionData = DeleteInfoData | DeleteBnrData | SuspendUserData | DeleteCharacterData | LinkDiscordData | RebuildClanData | DeleteDistributionData | DistEditorData;

/* Admin Consoleにおけるモーダルデータ
====================================================*/
interface ModalCommonData {
    title: string;
    formAction: string;
}

export interface DeleteInfoData extends ModalCommonData {
    infoId: number;
    infoTitle: string;
    infoUrl: string | null;
    createdAt: string;
    infoType: string;
}

export interface DeleteBnrData extends ModalCommonData {
    bnrId: number;
    bnrUrl: string;
    bnrName: string;
}

export interface SuspendUserData extends ModalCommonData {
    userId: number;
    username: string;
    charName: string[];
    untilAt?: Date;
}

export interface DeleteCharacterData extends ModalCommonData {
    charId: number;
    charName: string | null;
}

export interface LinkDiscordData extends DeleteCharacterData {
    userId: number;
    username: string;
    discordId?: string;
}

export interface RebuildClanData extends ModalCommonData {
    clanId: number;
    clanName: string;
    clanLeader: string;
    createdAt: Date | null;
}

export interface DeleteDistributionData extends ModalCommonData {
    distId: number;
    distTitle: string;
    distType: number;
    isSpecific: boolean;
}

export interface DistEditorData {
    distId: number;
    contents: string;
    showCharacterId: boolean;
}
