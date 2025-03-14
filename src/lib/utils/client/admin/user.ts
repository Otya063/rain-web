import { get } from 'svelte/store';
import type { User, CharacterEditableItemType } from '$types';
import { isNumber, paginatedUsersData, userDisplayState } from '..';

/**
 * ユーザーステータスを初期化する
 *
 * @param {PaginatedUsers[]} paginatedUsers ページングされたユーザーリスト
 */
export const initUserDisplayState = (paginatedUsers: User[]): void => {
    userDisplayState.update(() => {
        const newState: Record<string, any> = {};

        paginatedUsers.forEach((user) => {
            newState[user.id] = {
                icon: 'description',
                selectedCharacterIndex: 0,
                enableMoreActions: false,
            };
        });

        return newState;
    });
};

/**
 * 検索結果ユーザー情報を更新する（表示されているデータが動的に更新される）
 *
 * @param {number} userId 更新対象のユーザーID
 * @param {CharacterEditableItemType} editType 更新する項目名
 * @param {any} value 設定する値
 */
export const updatePaginatedUsersData = (userId: number, editType: CharacterEditableItemType, value: any) => {
    let tempBountyCoin: number | null = null;

    paginatedUsersData.update((data) => {
        return data.map((user) => {
            let updatedCharacters = user.characters;

            if (editType === 'link' && value) {
                // ディスコード(A)が既にキャラクター(A)と連携されていて、そのディスコード(A)を新たに別キャラクター(B)へ再連携する時、既存の連携情報は削除する（連携移行）
                updatedCharacters = user.characters.map((character) => {
                    // キャラクター未保有ユーザーはcharacterがnullなので確認必要
                    if (character && character.linked_discord_id && character.linked_discord_id === String(value)) {
                        tempBountyCoin = character.bounty_coin; // 連携処理のデータ移行に使用するため一時保存

                        return {
                            ...character,
                            linked_discord_id: null,
                            bounty_coin: null,
                        };
                    }

                    return character;
                });
            }

            if (user.id !== userId) {
                // 対象ユーザー以外は変更しない
                return { ...user, characters: updatedCharacters }; // link時の変更を適用するため、userそのままでなくupdatedCharactersも返す
            }

            // selectedCharacterIndex取得
            const selectedCharacterIndex = get(userDisplayState)[userId].selectedCharacterIndex;
            if (selectedCharacterIndex === undefined || selectedCharacterIndex < 0 || selectedCharacterIndex >= user.characters.length) {
                // 範囲外ならそのまま返す
                return { ...user, characters: updatedCharacters }; // link時の変更を適用するため、userそのままでなくupdatedCharactersも返す
            }

            // キャラクター更新処理
            updatedCharacters = updatedCharacters.map((character, index) => {
                if (index !== selectedCharacterIndex) {
                    // 対象キャラクター以外は変更しない
                    return character;
                }

                // characterのコピーを作成
                const updatedCharacter = { ...character };

                switch (editType) {
                    case 'name': {
                        const currentBountyCoin = character.bounty_coin!; // サーバー側でコイン数および連携状況は確認済み

                        updatedCharacter.name = String(value);
                        updatedCharacter.bounty_coin = currentBountyCoin - 50000;

                        break;
                    }

                    case 'bounty': {
                        updatedCharacter.bounty_coin = Number(value);

                        break;
                    }

                    case 'clan': {
                        updatedCharacter.clan = {
                            id: 0,
                            name: null,
                            members: 0,
                        };

                        break;
                    }

                    case 'link': {
                        updatedCharacter.linked_discord_id = isNumber(value) ? String(value) : null;
                        updatedCharacter.bounty_coin = tempBountyCoin;

                        break;
                    }

                    default: {
                        return updatedCharacter;
                    }
                }

                return updatedCharacter;
            });

            return { ...user, characters: updatedCharacters };
        });
    });
};

/**
 * 管理コンソールのコンテンツを有効または無効にする
 *
 * @param {boolean} enable コンテンツを有効にするか無効にするかのフラグ
 */
export const consoleContDisable = (enable: boolean): void => {
    enable ? document.getElementsByClassName('console_contents')[0].classList.add('disabled_elm') : document.getElementsByClassName('console_contents')[0].classList.remove('disabled_elm');
};
