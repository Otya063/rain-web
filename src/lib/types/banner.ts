import type { Banner } from "./postgres";

export type BannerEditableItemType = keyof Omit<Banner, 'id' | 'bnr_name'>;

/* コンポーネント Props
====================================================*/
export interface BannerProps {
    createdBanner: Banner;
    bnrAddMode: boolean;
    isMobile: boolean;
}

export interface BannerMainProps {
    bnrAddMode: boolean;
    isMobile: boolean;
}

export interface CreateBannerProps {
    createdBanner: Banner;
    bnrAddMode: boolean;
    isMobile: boolean;
}
