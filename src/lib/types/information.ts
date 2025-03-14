import type { Information } from '.';

/**
 * 編集可能なインフォメーションデータの項目
 */
export type InformationEditableItemType = keyof Omit<Information, 'id'>;
