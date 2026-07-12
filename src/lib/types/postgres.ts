import type { BinaryTypes, DistributionCategory, DistributionContentsType, DistributionEditableItemType, Replace, PaginatedClans, PaginatedAlliances } from '$types';

/**
 * データベース認証情報jsonデータ
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

/**
 * 引数の「アクション名」と「テーブル名」に基づく入力と戻り値の型マッピング
 */
export type ActionTableTypeMap = {
    create: {
        distribution: {
            input: {
                charId: number;
                category: number;
                deadline: Date | null;
                title: string;
                description: string;
                remaining: number;
                minHr: number | null;
                maxHr: number | null;
                minGr: number | null;
                maxGr: number | null;
                contentsData: DistributionContentsItem[];
            };
            return: Distribution;
        };
        // information: {
        //     input: {
        //         title: string;
        //         url: string | null;
        //         type: InfoType;
        //     };
        //     return: Information;
        // };
        banner: {
            input: {
                bnrName: string;
                bnrUrl: string | null;
                jaImgSrc: string;
                enImgSrc: string;
            };
            return: Banner;
        };
        rainServer: {
            input: {
                name: string;
                host: string;
                port: number;
                entrancePort: number;
            };
            return: RainServer;
        };
    };
    delete: {
        distribution: {
            input: {
                deleteDistId: number;
            };
            return: string;
        };
        claimedDistributions: {
            input: {
                charId: number;
                deleteDistIds: number[];
            };
            return: string[];
        };
        distributions: {
            input: {
                deleteDistIds: number[];
            };
            return: string[];
        };
        // information: {
        //     input: {
        //         deleteInfoIds: number[];
        //     };
        //     return: string[];
        // };
        banner: {
            input: {
                deleteBnrIds: number[];
            };
            return: void;
        };
        users: {
            input: {
                userIds: number[];
            };
            return: void;
        };
        character: {
            input: {
                charId: number;
                permanent: boolean;
            };
            return: void;
        };
        unlinkDiscord: {
            input: {
                discordId: string;
            };
            return: void;
        };
        deleteClans: {
            input: {
                clanIds: number[];
            };
            return: void;
        };
        deleteAlliances: {
            input: {
                allianceIds: number[];
            };
            return: void;
        };
        rainServer: {
            input: {
                deleteServerIds: number[];
            };
            return: void;
        };
    };
    get: {
        paginatedUsers: {
            input: {
                filterParam: 'username' | 'character_name' | 'user_id' | 'character_id';
                filterValue: string;
                // status: 'init' | 'back' | 'next';
                // cursor?: number;
            };
            return: User[] | [null];
        };
        authUser: {
            input: {
                loginKey: string;
                isMobile: boolean;
            };
            return: { id: number; username: string } | null;
        };
        adminDiscordId: {
            input: {
                username: string;
            };
            return: string | null;
        };
        character: {
            input: {
                charId: number;
            };
            return: CharacterRaw | null;
        };
        paginatedClans: {
            input: {
                filterParam: 'clan_name' | 'clan_id';
                filterValue: string;
            };
            return: PaginatedClans[] | [null];
        };
        paginatedAlliances: {
            input: {
                filterParam: 'alliance_name' | 'alliance_id';
                filterValue: string;
            };
            return: {
                alliances: PaginatedAlliances[] | [null];
                clanNames: string[];
            };
        };
        paginatedDistributions: {
            input: {
                filterParam: 'distribution_id' | 'event_name' | 'character_id';
                filterValue: string;
            };
            return: Distribution[] | [null];
        };
    };
    transactions: {
        initAdmin: {
            input: undefined; // 第三引数不要
            return: {
                launcherSystem: LauncherSystem;
                rainServers: RainServer[];
                // information: Information[];
                banners: Banner[];
                charIdNamePair: string[];
            };
        };
    };
    update: {
        characterBinary: {
            input: {
                charId: number;
                binaryData: { [key in BinaryTypes]?: ArrayBuffer };
            };
            return: void;
        };
        // information: {
        //     input: {
        //         infoId: number;
        //         column: InformationEditableItemType;
        //         value: string | null;
        //     };
        //     return: void;
        // };
        distribution: {
            input: {
                distId: number;
                column: DistributionEditableItemType;
                value: string | null | DistributionContentsItem[];
            };
            return: void;
        };
        banner: {
            input: {
                bnrId: number;
                value: string | null;
            };
            return: void;
        };
        charName: {
            input: {
                charId: number;
                newName: string;
                bountyCoin: number;
            };
            return: {
                success: boolean;
                message: string;
            };
        };
        launcherSystem: {
            input: {
                column: keyof Omit<LauncherSystem, 'id'>;
                value: string; // boolean系: 'true'/'false'
            };
            return: void;
        };
        rainServer: {
            input: {
                id: number;
                column: keyof Omit<RainServer, 'id' | 'maintenance'>;
                value: string;
            };
            return: void;
        };
        rainServerMaintenance: {
            input: {
                id: number;
                value: string; // boolean系: 'true'/'false'
            };
            return: void;
        };
        user: {
            input: {
                id: number;
                column: string;
                value: string | number | null;
            };
            return: void;
        };
        courseControl: {
            input: {
                rights: number;
                userIds?: number[]; // 未指定 = 全ユーザー対象
            };
            return: void;
        };
        suspendUsers: {
            input: {
                entries: {
                    userId: number;
                    username: string;
                    reasonType: number;
                    permanent: boolean;
                    untilAt?: string;
                    otherReason?: string;
                }[];
                zoneName: string;
                byWhom: number | null;
            };
            return: void;
        };
        unsuspendUsers: {
            input: {
                userIds: number[];
            };
            return: void;
        };
        bounty: {
            input: {
                charId: number;
                amount: number;
            };
            return: void;
        };
        leaveClan: {
            input: {
                charId: number;
                clanId: number;
                isLastMember: boolean;
            };
            return: void;
        };
        rebuildClans: {
            input: {
                clanIds: number[];
            };
            return: { oldId: number; newId: number; name: string | null }[];
        };
        restoreCharacter: {
            input: {
                charId: number;
            };
            return: void;
        };
        linkDiscord: {
            input: {
                userId: number;
                charId: number;
                discordId: string;
            };
            return: void;
        };
        allianceData: {
            input: {
                allianceId: number;
                sub1Id: number;
                sub2Id: number | null;
            };
            return: void;
        };
    };
};

/**
 * 引数の「アクション名」と「テーブル名」に基づいて第三引数に渡す`データの型`を抽出するユーティリティタイプ
 */
export type InputType<O extends keyof ActionTableTypeMap, T extends keyof ActionTableTypeMap[O]> = 'input' extends keyof ActionTableTypeMap[O][T] ? ActionTableTypeMap[O][T]['input'] : never;

/**
 * 引数の「アクション名」と「テーブル名」に基づいて`戻り値の型`を抽出するユーティリティタイプ
 */
export type ReturnType<O extends keyof ActionTableTypeMap, T extends keyof ActionTableTypeMap[O]> = 'return' extends keyof ActionTableTypeMap[O][T] ? ActionTableTypeMap[O][T]['return'] : never;

/**
 * コンストラクタ引数用条件型\
 * 第一引数と第二引数の値に応じて、第三引数が必要かどうか判断する
 */
export type ConstructorParams<O extends keyof ActionTableTypeMap, T extends keyof ActionTableTypeMap[O]> = InputType<O, T> extends undefined ? [O, T] : [O, T, InputType<O, T>];

/**
 * 配布データ
 */
export type Distribution = {
    id: number;
    character_id: number | null;
    category: DistributionCategory;
    deadline: Date | null;
    event_name: string;
    description: string;
    times_acceptable: number;
    min_hr: number | null;
    max_hr: number | null;
    min_sr: number | null;
    max_sr: number | null;
    min_gr: number | null;
    max_gr: number | null;
    contentsData: DistributionContentsItem[];
    type: 0 | 1;
};

/**
 * 配布アイテムデータ（distribution_itemsテーブルの行）
 */
export type DistributionItem = {
    id: number;
    distribution_id: number;
    item_type: DistributionContentsType;
    item_id: number;
    quantity: number;
};

/**
 * 配布アイテムデータのうち、配布コンテンツとして送受信される部分
 */
export type DistributionContentsItem = Pick<DistributionItem, 'item_type' | 'item_id' | 'quantity'>;

/**
 * システムデータ
 */
export type LauncherSystem = {
    id: number;
    update: boolean;
    download: boolean;
};

/**
 * Rainサーバー一覧データ
 */
export type RainServer = {
    id: number;
    name: string;
    host: string;
    port: number;
    entrance_port: number;
    maintenance: boolean;
};

/**
 * 各種お知らせデータ
 */
export type Information = {
    id: number;
    title: string;
    url: string | null;
    type: InfoType;
    created_at: Date;
};

/**
 * お知らせの種類（`Information`インデックスに対応）
 *
 * 0: 重要\
 * 1: イベント\
 * 2: アップデート
 */
export const InfoTypeObj = {
    Important: 0,
    Event: 1,
    Update: 2,
} as const;
export type InfoType = (typeof InfoTypeObj)[keyof typeof InfoTypeObj];

/**
 * バナーデータ
 */
export type Banner = {
    id: number;
    bnr_name: string;
    bnr_url: string | null;
    ja_img_src: string;
    en_img_src: string;
};

/**
 * キャラクターバイナリ生データ（ダウンロード用）
 */
export type CharacterRaw = {
    name: string | null;
} & { [K in BinaryTypes]: Uint8Array | null };

/**
 * ユーザーデータ
 */
export type User = {
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
    characters: Character[];
    suspended_status: SuspendedStatus;
};

/**
 * 検索メタデータ
 */
export type SearchMeta = {
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevCursor: number;
    nextCursor: number;
};

/**
 * キャラクターデータ
 */
export type Character = {
    id: number;
    is_female: boolean | null;
    is_new_character: boolean | null;
    name: string | null;
    gr: number | null;
    hrp: number | null;
    weapon_type: number | null;
    weapon_id: number;
    last_login: number | null;
    savedata: string | null;
    playtime: number;
    deleted: boolean;
    linked_discord_id: string | null;
    bounty_coin: number | null;
    clan: JoinedClan;
    claim_distribution: Omit<Replace<Distribution, { deadline: string | null }>, 'contentsData'>[];
};

/**
 * 所属猟団データ
 */
type JoinedClan = {
    id: number;
    name: string | null;
    members: number;
};

/**
 * アカウント停止状態参照データ\
 * （is_suspendedプロパティは停止状態を表す）
 */
type SuspendedStatus =
    | {
          is_suspended: false;
          username: null;
          user_id: null;
          reason: null;
          until_at: null;
          permanent: null;
          other_reason: null;
          by_whom: null;
          by_whom_username: null;
      }
    | {
          is_suspended: true;
          username: string;
          user_id: number;
          reason: number;
          until_at: Date;
          permanent: boolean;
          other_reason: string | null;
          by_whom: number;
          by_whom_username: string | null;
      };
