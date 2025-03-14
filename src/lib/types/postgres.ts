import type { BinaryTypes, DistributionCategory, DistributionEditableItemType, InformationEditableItemType, Replace } from '$types';

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
                minHr: number;
                maxHr: number;
                minGr: number;
                maxGr: number;
                base64: string;
            };
            return: Distribution;
        };
        information: {
            input: {
                title: string;
                url: string | null;
                type: InfoType;
            };
            return: Information;
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
        information: {
            input: {
                deleteInfoIds: number[];
            };
            return: string[];
        };
    };
    get: {
        paginatedUsers: {
            input: {
                filterParam: 'username' | 'character_name' | 'user_id' | 'character_id';
                filterValue: string;
                status: 'init' | 'back' | 'next';
                cursor?: number;
            };
            return: PaginatedUsersResult;
        };
        authUser: {
            input: {
                loginKey: string;
                isMobile: boolean;
            };
            return: string | null;
        };
    };
    transactions: {
        initAdmin: {
            input: undefined; // 第三引数不要
            return: {
                launcherSystem: LauncherSystem;
                information: Information[];
                banners: Banner[];
                distributions: Distribution[];
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
        information: {
            input: {
                infoId: number;
                column: InformationEditableItemType;
                value: string | null;
            };
            return: void;
        };
        distribution: {
            input: {
                distId: number;
                column: DistributionEditableItemType;
                value: string | null;
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
    min_hr: number;
    max_hr: number;
    min_sr: number;
    max_sr: number;
    min_gr: number;
    max_gr: number;
    data: string;
    type: 0 | 1;
};

/**
 * システムデータ
 */
export type LauncherSystem = {
    id: number;
    RainJP: boolean;
    RainUS: boolean;
    RainEU: boolean;
    update: boolean;
    debug: boolean;
    client_data: string[];
    rain_admins: string[];
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
 * ユーザーページネーション結果
 */
export type PaginatedUsersResult = {
    users: User[];
    meta: PaginationMeta;
};

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
 * ページネーションメタデータ
 */
export type PaginationMeta = {
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
    claim_distribution: Replace<Distribution, { deadline: string | null }>[];
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
      };
