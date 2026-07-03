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

/* コンポーネント Props
====================================================*/
export interface UserProps {
    searchedUsers: User[];
    isMobile: boolean;
}

export interface UserMainProps {
    stage: number;
    scrollY: number;
    scrollYBeforeClickClaimedDist: number;
    openUserEditField: number[];
    searchedUsers: User[];
    isMobile: boolean;
}

export interface ClaimedDistributionProps {
    stage: number;
    scrollYBeforeClickClaimedDist: number;
    openUserEditField: number[];
    isMobile: boolean;
}

export interface CharacterProps {
    user: User;
    stage: number;
    scrollY: number;
    scrollYBeforeClickClaimedDist: number;
    catTypes: Record<UserEditableItemType, boolean>;
    editingId: number;
    editModeSwitch: (userId: number, type: UserEditableItemType) => void;
    onCharacterUpdate: (userId: number, charIndex: number, column: CharacterEditableItemType, value: string) => void;
    onDeleteCharacter: (charId: number, type: 0 | 1, permanent: boolean) => void;
    onLinkDiscord: (charId: number, discordId: string | null) => void;
    isMobile: boolean;
}

export interface CharacterMainProps {
    user: User;
    stage: number;
    scrollY: number;
    scrollYBeforeClickClaimedDist: number;
    catTypes: Record<UserEditableItemType, boolean>;
    editingId: number;
    editModeSwitch: (userId: number, type: UserEditableItemType) => void;
    onCharacterUpdate: (userId: number, charIndex: number, column: CharacterEditableItemType, value: string) => void;
    isMobile: boolean;
}

export interface CharacterCardProps {
    user: User;
    isMobile: boolean;
    onDeleteCharacter: (charId: number, type: 0 | 1, permanent: boolean) => void;
    onLinkDiscord: (charId: number, discordId: string | null) => void;
}
