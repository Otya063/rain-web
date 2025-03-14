import { DateTime } from 'luxon';
import type { InformationEditableItemType } from '$types';
import { allInformationData, discordLinkConvertor } from '..';

/**
 * インフォメーションデータ編集フィールドの開閉処理を制御する
 *
 * @param {number} informationId 処理対象のインフォメーションデータID
 */
export const handleInformationEditField = (fields: number[], informationId: number): number[] => {
    if (fields.includes(informationId)) {
        return fields.filter((id) => id !== informationId); // 削除
    } else {
        return [...fields, informationId];
    }
};

/**
 * ストア変数allInformationData内のデータを更新する
 *
 * @param {number} infoId 更新する配布物ID
 * @param {InformationEditableItemType} column 更新するカラム名
 * @param {string | null} value カラム名に代入する値
 */
export const updateAllInformationData = (infoId: number, column: InformationEditableItemType, value: string | null): void => {
    allInformationData.update((data) =>
        data.map((information) => {
            if (information.id === infoId) {
                const updatedValue = getInformationUpdatedValue(column, value);

                return {
                    ...information,
                    [column]: column === 'created_at' ? DateTime.fromISO(updatedValue as string).toJSDate() : updatedValue, // created_atカラムはstringなのでDateに変換
                };
            }

            return information;
        }),
    );
};

/**
 * インフォメーションデータにおけるカラムごとの更新値を取得
 *
 * @param {InformationEditableItemType} column カラム名
 * @param {string | null} value 値
 * @returns {string | null} 更新後の値
 */
export const getInformationUpdatedValue = (column: InformationEditableItemType, value: string | null): string | number | null => {
    if (!value) {
        // url: ハイパーリンク無し
        return column === 'url' ? '' : value;
    }

    switch (column) {
        case 'type': {
            return Number(value);
        }

        case 'url': {
            if (value.indexOf('discord.com')) {
                return discordLinkConvertor(value);
            } else {
                return value;
            }
        }

        case 'created_at': {
            // postgres処理において、クエリを変数に格納して実行するためDateはstringである必要がある
            return DateTime.fromISO(value).setZone('utc').toString();
        } // valueは現地時間なので、UTCに変換して保存

        default: {
            return value;
        }
    }
};
