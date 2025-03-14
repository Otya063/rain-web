import type { User } from '$types';

/**
 * 編集可能なユーザーデータの項目
 */
export type UserEditableItemType = keyof Omit<User, 'id' | 'last_character' | 'last_login' | 'web_login_key' | 'web_login_key_mobile' | 'characters' | 'suspended_status'> | CharacterEditableItemType;

/**
 * キャラクター全バイナリデータ名
 */
export const BinaryTypesArray = [
    'savedata',
    'decomyset',
    'hunternavi',
    'otomoairou',
    'partner',
    'platebox',
    'platedata',
    'platemyset',
    'rengokudata',
    'savemercenary',
    'skin_hist',
    'minidata',
    'scenariodata',
    'savefavoritequest',
] as const;
export type BinaryTypes = (typeof BinaryTypesArray)[number];

/**
 * キャラクターページで編集可能な項目
 */
export type CharacterEditableItemType = 'name' | 'bounty' | 'clan' | 'reupload_binary' | 'link';
