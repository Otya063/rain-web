import type { DistributionCategory } from '$types';

/**
 * モーダルの状態を管理するストア用型定義マッピング
 */
export type ModalDataMap = {
    deleteInformation: DeleteInformationData;
    deleteBanner: DeleteBannerData;
    deleteCharacter: DeleteCharacterData;
    linkDiscord: LinkDiscordData;
    rebuildClan: RebuildClanData;
    deleteClans: DeleteClanData;
    downloadBinary: DownloadBinary;
    deleteDistribution: DeleteDistributionData;
    distributionEditor: DistributionEditorData;
    deleteUsers: DeleteUserData;
    suspendUsers: SuspendUserData;
    deleteAlliance: DeleteAllianceData;
};
export type ModalType = keyof ModalDataMap;

/* モーダル各コンテンツ型定義
====================================================*/
type DeleteInformationData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    infoId: number;
    infoTitle: string;
    infoUrl: string | null;
    createdAt: string;
    infoType: number;
};

type DeleteBannerData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    bnrId: number;
    bnrUrl: string;
    bnrName: string;
};

type SuspendUserData = {
    label: ModalType;
    type: 0 | 1; // 0: アカウント停止、1: アカウント停止解除
    users: { id: number; username: string; charName?: string[]; untilAt?: Date | null }[];
    onSuccess?: (entries: { id: number; permanent: boolean; reason: number; otherReason: string | null; suspendedBy: { id: number; username: string | null } | null }[]) => void;
};

type DeleteCharacterData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    type: 0 | 1; // 0: 削除、1: 復元
    charId: number;
    charName: string;
    onSuccess?: (charId: number, type: 0 | 1, permanent: boolean) => void;
};

type LinkDiscordData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    type: 0 | 1; // 0: 連携、1: 連携解除
    userId: number;
    username: string;
    charId: number;
    charName: string;
    discordId?: string | null;
    onSuccess?: (charId: number, discordId: string | null) => void;
};

type RebuildClanData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    clans: { id: number; name: string | null; leaderName: string | null; createdAt: Date | null }[];
    onSuccess?: (results: { oldId: number; newId: number; name: string | null }[]) => void;
};

type DownloadBinary = Omit<DeleteCharacterData, 'type'>;

type DeleteDistributionData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    distId: number;
    distTitle: string;
    distCat: DistributionCategory;
    isSpecific: boolean;
};

export type DistributionEditorData = {
    label: ModalType;
    type: 0 | 1; // 0: 配布タイトル、1: 配布説明文
    distId: number;
    contents: string;
    showCharacterId: boolean;
};

type DeleteUserData = {
    label: ModalType;
    users: { id: number; username: string }[];
    onSuccess?: (ids: number[]) => void;
};

type DeleteClanData = {
    label: ModalType;
    clans: { id: number; name: string | null }[];
    onSuccess?: (ids: number[]) => void;
};

type DeleteAllianceData = {
    label: ModalType;
    alliances: { id: number; name: string }[];
    onSuccess?: (ids: number[]) => void;
};
