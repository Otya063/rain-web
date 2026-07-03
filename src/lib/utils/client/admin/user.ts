import type { User} from '$types';
import { userDisplayState } from '..';

/**
 * アカウント停止理由番号と表示ラベルの対応表（SuspendUsers.svelteの選択肢と対応）
 */
export const suspendReasonLabels: Record<number, string> = {
    0: 'Other Reason',
    1: 'Cheating',
    2: 'Gameplay Exploit',
    3: 'Toxic and Abusive Behavior',
    4: 'Violation of Server Terms of Service',
};

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
            };
        });

        return newState;
    });
};
