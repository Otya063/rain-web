import type { BinaryTypes } from '$lib/types';
import { db } from '.';

/**
 * `utils/binary.ts/ManageBinary`のデータベースを扱うバージョン
 */
export class ManageBinaryDB {
    /**
     * バイナリデータをデータベースに上書き保存する
     * @param {number} characterId 対象のキャラクターID
     * @param {{ [key in BinaryTypes]: string }} binaryData 保存したいバイナリデータを持つオブジェクト
     * @returns {Promise<{ success: boolean; message: string; }>} 成功時には`{ success: true; message: '' }`、失敗時には`{ success: false; message: 'error message' }`を返す`
     */
    static async setBinary(
        characterId: number,
        binaryData: { [key in BinaryTypes]: string },
    ): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            const isNull = {
                savedata: !binaryData.savedata ? 'NULL' : 'NOT_NULL',
                decomyset: !binaryData.decomyset ? 'NULL' : 'NOT_NULL',
                hunternavi: !binaryData.hunternavi ? 'NULL' : 'NOT_NULL',
                otomoairou: !binaryData.otomoairou ? 'NULL' : 'NOT_NULL',
                partner: !binaryData.partner ? 'NULL' : 'NOT_NULL',
                platebox: !binaryData.platebox ? 'NULL' : 'NOT_NULL',
                platedata: !binaryData.platedata ? 'NULL' : 'NOT_NULL',
                platemyset: !binaryData.platemyset ? 'NULL' : 'NOT_NULL',
                rengokudata: !binaryData.rengokudata ? 'NULL' : 'NOT_NULL',
                savemercenary: !binaryData.savemercenary ? 'NULL' : 'NOT_NULL',
                skin_hist: !binaryData.skin_hist ? 'NULL' : 'NOT_NULL',
                minidata: !binaryData.minidata ? 'NULL' : 'NOT_NULL',
                scenariodata: !binaryData.scenariodata ? 'NULL' : 'NOT_NULL',
                savefavoritequest: !binaryData.savefavoritequest ? 'NULL' : 'NOT_NULL',
            };

            await db.$executeRaw`UPDATE characters SET savedata = CASE ${isNull.savedata} WHEN 'NULL' THEN decode((SELECT encode(savedata, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savedata}, 'base64') END, decomyset = CASE ${isNull.decomyset} WHEN 'NULL' THEN decode((SELECT encode(decomyset, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.decomyset}, 'base64') END, hunternavi = CASE ${isNull.hunternavi} WHEN 'NULL' THEN decode((SELECT encode(hunternavi, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.hunternavi}, 'base64') END, otomoairou = CASE ${isNull.otomoairou} WHEN 'NULL' THEN decode((SELECT encode(otomoairou, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.otomoairou}, 'base64') END, partner = CASE ${isNull.partner} WHEN 'NULL' THEN decode((SELECT encode(partner, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.partner}, 'base64') END, platebox = CASE ${isNull.platebox} WHEN 'NULL' THEN decode((SELECT encode(platebox, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platebox}, 'base64') END, platedata = CASE ${isNull.platedata} WHEN 'NULL' THEN decode((SELECT encode(platedata, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platedata}, 'base64') END, platemyset = CASE ${isNull.platemyset} WHEN 'NULL' THEN decode((SELECT encode(platemyset, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.platemyset}, 'base64') END, rengokudata = CASE ${isNull.rengokudata} WHEN 'NULL' THEN decode((SELECT encode(rengokudata, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.rengokudata}, 'base64') END, savemercenary = CASE ${isNull.savemercenary} WHEN 'NULL' THEN decode((SELECT encode(savemercenary, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savemercenary}, 'base64') END, skin_hist = CASE ${isNull.skin_hist} WHEN 'NULL' THEN decode((SELECT encode(skin_hist, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.skin_hist}, 'base64') END, minidata = CASE ${isNull.minidata} WHEN 'NULL' THEN decode((SELECT encode(minidata, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.minidata}, 'base64') END, scenariodata = CASE ${isNull.scenariodata} WHEN 'NULL' THEN decode((SELECT encode(scenariodata, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.scenariodata}, 'base64') END, savefavoritequest = CASE ${isNull.savefavoritequest} WHEN 'NULL' THEN decode((SELECT encode(savefavoritequest, 'base64') FROM characters WHERE id = ${characterId}), 'base64') WHEN 'NOT_NULL' THEN decode(${binaryData.savefavoritequest}, 'base64') END WHERE id = ${characterId}`;

            return { success: true, message: '' };
        } catch (err) {
            if (err instanceof Error) {
                return { success: false, message: err.message };
            } else if (typeof err === 'string') {
                return { success: false, message: err };
            } else {
                return { success: false, message: 'Unexpected Error' };
            }
        }
    }
}
