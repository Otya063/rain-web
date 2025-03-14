/**
 * モーダルの状態を管理するストア用型定義マッピング
 */
export type ModalDataMap = {
    deleteInfo: DeleteInfoData;
    deleteBnr: DeleteBnrData;
    suspendUser: SuspendUserData;
    deleteCharacter: DeleteCharacterData;
    linkDiscord: LinkDiscordData;
    rebuildClan: RebuildClanData;
    downloadBinary: DownloadBinary;
    deleteDistribution: DeleteDistributionData;
    distributionEditor: DistEditorData;
    deleteUser: Omit<SuspendUserData, 'type' | 'charName' | 'untilAt'>; // SuspendUserData一部再利用
};
export type ModalType = keyof ModalDataMap;

/* モーダル各コンテンツ型定義
====================================================*/
type DeleteInfoData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    infoId: number;
    infoTitle: string;
    infoUrl: string | null;
    createdAt: string;
    infoType: number;
};

type DeleteBnrData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    bnrId: number;
    bnrUrl: string;
    bnrName: string;
};

type SuspendUserData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    type: 0 | 1; // 0: アカウント停止、1: アカウント停止解除
    userId: number;
    username: string;
    charName: string[];
    untilAt?: Date | null; // アカウント停止時には省略され、アカウント停止解除時に必要となる
};

type DeleteCharacterData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    type: 0 | 1; // 0: 削除、1: 復元
    charId: number;
    charName: string;
};

type LinkDiscordData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    type: 0 | 1; // 0: 連携、1: 連携解除
    userId: number;
    username: string;
    charId: number;
    charName: string;
    discordId?: string | null;
};

type RebuildClanData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    clanId: number;
    clanName: string;
    clanLeader: string;
    createdAt: Date | null;
};

type DownloadBinary = Omit<DeleteCharacterData, 'type'>;

type DeleteDistributionData = {
    label: ModalType; // 型ガード時のデータ判別に使用する
    distId: number;
    distTitle: string;
    distType: number;
    isSpecific: boolean;
};

export type DistEditorData = {
    label: ModalType;
    type: 0 | 1; // 0: 配布タイトル、1: 配布説明文
    distId: number;
    contents: string;
    showCharacterId: boolean;
};
