import type { Information } from '.';

/**
 * 編集可能なインフォメーションデータの項目
 */
export type InformationEditableItemType = keyof Omit<Information, 'id'>;

/* コンポーネント Props
====================================================*/
export interface InformationProps {
    createdInformation: Information;
    infoAddMode: boolean;
    isMobile: boolean;
}

export interface InformationMainProps {
    infoAddMode: boolean;
    isMobile: boolean;
}

export interface CreateInformationProps {
    createdInformation: Information;
    infoAddMode: boolean;
    isMobile: boolean;
}
