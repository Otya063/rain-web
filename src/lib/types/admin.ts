import type { LauncherSystem } from './postgres';

/* ClanAllianceTable モード
====================================================*/
export type ClanAllianceMode = 'none' | 'clan' | 'alliance';

/* アライアンス更新データ
====================================================*/
export type UpdatedAllianceData = Pick<PaginatedAlliances, 'id' | 'firstChildClan' | 'secondChildClan'>;

/* コンポーネント Props
====================================================*/
export interface AllianceAlliesProps {
    name: string;
    clanNames: string[];
    isMobile: boolean;
    initClanName: string | null;
}

export interface SideMenuProps {
    closeMobileMenu: (btnClicked: boolean) => void;
}

export interface LauncherSystemProps {
    systemData: LauncherSystem;
}

export interface ClansProps {
    isMobile: boolean;
}

export interface ClanAllianceTableProps {
    isMobile: boolean;
}

/* ページングされたクラン情報
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

/* ページングされたクラン情報
====================================================*/
export interface PaginatedAlliances {
    id: number;
    name: string;
    created_at: Date;
    parent_id: number;
    sub1_id: number | null;
    sub2_id: number | null;
    parentClan: string | null;
    firstChildClan: string | null;
    secondChildClan: string | null;
}
