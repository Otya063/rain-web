import { error } from '@sveltejs/kit';
import Encoding from 'encoding-japanese';
import { courseJa } from '$i18n/ja/course';
import { courseEn } from '$i18n/en/course';
import { type WeaponType, type CourseJaData, type CourseEnData, type DistributionContentsType, DistributionContentsTypeObj, type DistributionType, DistributionTypeObj } from '$lib/types';

/**
 * URLのロケールスラグを置き換える
 * @param {URL} url 操作対象のURLオブジェクト
 * @param {string} locale 置き換えるロケールの文字列
 * @param {boolean} [full=false] `true`の場合、新しいURLからクエリパラメータを削除する
 * @returns {string} 更新されたURL文字列
 */
export const replaceLocaleInUrl = (url: URL, locale: string, full: boolean = false): string => {
    const [, , ...rest] = url.pathname.split('/');
    const new_pathname = `/${[locale, ...rest].join('/')}`;
    if (!full) {
        return `${new_pathname}${url.search}`;
    }
    const newUrl = new URL(url.toString());
    newUrl.pathname = new_pathname;
    newUrl.search = '';

    return newUrl.toString();
};

/**
 * 10進数の値に基づいてコース情報を取得する
 * @param {number} dec コース情報の10進数表現
 * @param {string} lang 言語コード
 * @returns {CourseJaData | CourseEnData} コースデータオブジェクト
 */
export const getCourseByDecimal = (dec: number, lang: string): CourseJaData | CourseEnData => {
    const bin: string[] = dec.toString(2).padStart(30, '0').split('').reverse();

    switch (lang) {
        case 'ja': {
            return courseJa(bin);
        }

        case 'en': {
            return courseEn(bin);
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Unsupported language: ${lang}.`], message3: undefined });
        }
    }
};

/**
 * コースデータオブジェクトから10進数のコース情報を取得する
 * @param {Record<string, any>} courseData コースデータのオブジェクト
 * @returns {number} 10進数のコース情報
 */
export const getCourseByObjData = (courseData: Record<string, any>): number => {
    // 文字列をブール値に変換
    Object.keys(courseData).forEach((name) => {
        courseData[name] === 'on' && (courseData[name] = true);
    });

    const bin = `
    ${courseData['hl'] === 'frc' ? 1 : 0}
    ${courseData['ex'] === 'rexc' ? 1 : 0}
    ${courseData['hl'] === 'rhlc' ? 1 : 0}
    ${courseData['cnc'] ? 1 : 0}
    ${courseData['nc'] ? 0 : 0}
    ${courseData['clc'] ? 0 : 0}
    ${courseData['trq'] ? 0 : 0}
    ${courseData['xgm'] ? 0 : 0}
    ${courseData['cle'] ? 0 : 0}
    ${courseData['dbg'] ? 0 : 0}
    0000000
    ${courseData['nbc'] ? 1 : 0}
    ${courseData['hsc'] ? 1 : 0}
    ${courseData['hdc'] ? 1 : 0}
    ${courseData['nc'] ? 1 : 0}
    ${courseData['asc'] ? 1 : 0}
    ${courseData['plc'] ? 0 : 0}
    ${courseData['prc'] ? 1 : 0}
    ${courseData['mbc'] ? 1 : 0}
    ${courseData['exbc'] ? 0 : 0}
    ${courseData['ex'] === 'exc' || courseData['ex'] === 'rexc' ? 1 : 0}
    ${courseData['hl'] === 'hlc' || courseData['hl'] === 'rhlc' || courseData['hl'] === 'frc' ? 1 : 0}
    ${courseData['tlc'] ? 0 : 0}
    0`
        .replace(/\n/g, '')
        .replace(/\s+/g, '');
    const dec = parseInt(bin, 2);

    return dec;
};

/**
 * 10進数の値に基づいて武器タイプを取得する
 * @param {number | null} dec 武器タイプを表す10進数
 * @param {string} lang 言語コード
 * @returns {WeaponType} 武器タイプの文字列
 */
export const getWpnTypeByDec = (dec: number | null, lang: string): WeaponType => {
    switch (lang) {
        case 'ja': {
            switch (dec) {
                case 0:
                    return '大剣';

                case 1:
                    return 'ヘビィボウガン';

                case 2:
                    return 'ハンマー';

                case 3:
                    return 'ランス';

                case 4:
                    return '片手剣';

                case 5:
                    return 'ライトボウガン';

                case 6:
                    return '双剣';

                case 7:
                    return '太刀';

                case 8:
                    return '狩猟笛';

                case 9:
                    return 'ガンランス';

                case 10:
                    return '弓';

                case 11:
                    return '穿龍棍';

                case 12:
                    return 'スラッシュアックスF';

                case 13:
                    return 'マグネットスパイク';
            }
        }

        case 'en': {
            switch (dec) {
                case 0:
                    return 'Great Sword';

                case 1:
                    return 'Heavy Bowgun';

                case 2:
                    return 'Hammer';

                case 3:
                    return 'Lance';

                case 4:
                    return 'Sword & Shield';

                case 5:
                    return 'Light Bowgun';

                case 6:
                    return 'Dual Blades';

                case 7:
                    return 'Long Sword';

                case 8:
                    return 'Hunting Horn';

                case 9:
                    return 'Gunlance';

                case 10:
                    return 'Bow';

                case 11:
                    return 'Tonfa';

                case 12:
                    return 'Switch Axe F';

                case 13:
                    return 'Magnet Spike';
            }
        }

        default: {
            return 'Invalid Input';
        }
    }
};

/**
 * 武器ID（10進数）から武器の名前を取得する
 * @param {number} dec 武器IDの10進数表現
 * @param {number | null} wpnType - 武器タイプ
 * @param {string} lang 言語コード
 * @returns {Promise<string>} 武器の名前
 */
export const getWpnNameByDec = async (dec: number, wpnType: number | null, lang: string): Promise<string> => {
    const hex: string = decToLittleEndian(dec);

    switch (wpnType) {
        // 遠距離武器
        case 1:
        case 5:
        case 10: {
            switch (lang) {
                case 'ja': {
                    const { rangedJa } = await import('$i18n/ja/ranged');
                    return rangedJa[hex];
                }

                case 'en': {
                    const { rangedEn } = await import('$i18n/en/ranged');
                    return rangedEn[hex];
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Unsupported language: ${lang}.`], message3: undefined });
                }
            }
        }

        // 近距離武器
        default: {
            switch (lang) {
                case 'ja': {
                    const { meleeJa } = await import('$i18n/ja/melee');
                    return meleeJa[hex];
                }

                case 'en': {
                    const { meleeEn } = await import('$i18n/en/melee');
                    return meleeEn[hex];
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Unsupported language: ${lang}.`], message3: undefined });
                }
            }
        }
    }
};

/**
 * 2次元配列をオブジェクトに変換する
 * @param {[string, FormDataEntryValue][]} arr 変換する2次元配列
 * @returns {Record<string, any>} キーと値のペアからなるオブジェクト
 */
export const conv2DArrayToObject = (arr: [string, FormDataEntryValue][]): Record<string, any> => {
    let obj: { [key: string]: any } = {};

    arr.forEach((v) => {
        let key = v[0];
        let value = v[1];

        obj[key] = value;
    });

    return obj;
};

/**
 * 文字列をアンダースコア付き小文字の文字列に変換する
 * @param {string} string 変換対象の文字列
 * @returns {string} アンダースコア付き小文字の文字列
 */
export const underscoreAndLowercase = (string: string): string => {
    // 大文字を小文字に変換
    const lowercaseString = string.toLowerCase();

    // アンダースコアつける
    const underscoreLowercaseString = lowercaseString.replace(/\s/g, '_');

    return underscoreLowercaseString;
};

/**
 * 10進数をリトルエンディアンの16進数に変換する
 * @param {number} dec 10進数
 * @returns {string} リトルエンディアン形式の16進数
 */
export const decToLittleEndian = (dec: number): string => {
    // 最小幅4桁のビッグエンディアン文字列として10進数から16進数に変換
    const bigEndianHex: string = dec.toString(16).padStart(4, '0');

    // ビッグエンディアンの16進文字列を2文字のペアに分割
    const pairs = bigEndianHex.match(/.{1,2}/g);

    if (pairs) {
        // ペアの順序を逆にしてリトルエンディアン表現へ
        const littleEndianHex: string = pairs.reverse().join('');

        // アルファベットを大文字に変換する
        const uppercaseLittleEndianHex: string = littleEndianHex.replace(/[a-f]/g, (match) => match.toUpperCase());

        return uppercaseLittleEndianHex;
    } else {
        error(400, { message: '', message1: undefined, message2: [`Invalid input: ${dec}.`], message3: undefined });
    }
};

/**
 * DiscordのURLをアプリ用のURLに変換する
 * @param {string} url 変換するURL
 * @returns {string} Discordアプリ用のURL
 */
export const discordLinkConvertor = (url: string): string => {
    if (url.indexOf('discord.com')) {
        return url.replace('https://discord.com/', 'discord://discordapp.com/');
    } else {
        return url;
    }
};

/**
 * HRポイントを対応するHRランクに変換する
 * @param {number | null} hrp HRポイント
 * @returns {number} 対応するHRランク
 */
export const convHrpToHr = (hrp: number | null): number => {
    switch (hrp) {
        case 999: {
            return 7;
        }

        case 998: {
            return 6;
        }
        case 299: {
            return 5;
        }
        case 99: {
            return 4;
        }

        case 50: {
            return 3;
        }

        case 30: {
            return 2;
        }
        case 1: {
            return 1;
        }

        default: {
            return 0;
        }
    }
};

/**
 * SJISで文字列をエンコードする
 * @param {string} value 変換対象の文字列
 * @returns {Buffer} 変換後のBufferデータ
 */
export const encodeToShiftJIS = (value: string): Buffer => {
    const unicodeArray = Encoding.stringToCode(value);
    const encoded = Encoding.convert(unicodeArray, {
        to: 'SJIS',
        from: 'UNICODE',
    });

    return Buffer.from(new Uint8Array(encoded));
};

/**
 * 配布コンテンツの種類に基づいてデータを取得する
 * @param {DistributionContentsType} contentsType コンテンツの種類
 * @returns {Promise<{[key: string]: string}>} 取得したデータ
 */
export const getDistItemsData = async (
    contentsType: DistributionContentsType,
): Promise<{
    [key: string]: string;
}> => {
    switch (contentsType) {
        case DistributionContentsTypeObj.Leg: {
            const { legEn } = await import('$i18n/en/leg');
            return legEn;
        }

        case DistributionContentsTypeObj.Head: {
            const { headEn } = await import('$i18n/en/head');
            return headEn;
        }

        case DistributionContentsTypeObj.Chest: {
            const { chestEn } = await import('$i18n/en/chest');
            return chestEn;
        }

        case DistributionContentsTypeObj.Arm: {
            const { armEn } = await import('$i18n/en/arm');
            return armEn;
        }

        case DistributionContentsTypeObj.Waist: {
            const { waistEn } = await import('$i18n/en/waist');
            return waistEn;
        }

        case DistributionContentsTypeObj.Melee: {
            const { meleeEn } = await import('$i18n/en/melee');
            return meleeEn;
        }

        case DistributionContentsTypeObj.Ranged: {
            const { rangedEn } = await import('$i18n/en/ranged');
            return rangedEn;
        }

        case DistributionContentsTypeObj.Item: {
            const { itemEn } = await import('$i18n/en/item');
            return itemEn;
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Unsupported contents type: ${contentsType}.`], message3: undefined });
        }
    }
};

/**
 * 配布タイプを取得する
 * @param {DistributionType} type 配布タイプ
 * @returns {string} 配布タイプの文字列
 */
export const getDistributionType = (type: DistributionType): string => {
    const entry = Object.entries(DistributionTypeObj).find(([_, value]) => value === type);

    if (entry) {
        return entry[0];
    } else {
        error(400, { message: '', message1: undefined, message2: [`Unsupported distribution type: ${type}.`], message3: undefined });
    }
};

/**
 * 秒数を時分秒に変換する
 * @param {number} seconds 変換元の秒数
 * @returns {string} 変換後の時分秒（`00h 00m 00s`の形式）
 */
export const secToTime = (seconds: number): string => {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    // 時間が3桁以上の場合にカンマを挿入
    const hourStr = hour >= 1000 ? hour.toLocaleString() : hour.toString();

    let time = '';
    if (hour !== 0) {
        time = `${hourStr}h ${min}m ${sec}s`;
    } else if (min !== 0) {
        time = `${min}m ${sec}s`;
    } else {
        time = `${sec}s`;
    }

    return time;
};
