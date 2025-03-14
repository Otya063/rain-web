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
