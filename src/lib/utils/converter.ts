import { courseJa } from '$i18n/ja/course';
import { courseEn } from '$i18n/en/course';
import { type WeaponType, type CourseJaData, type CourseEnData, type DistributionContentsType, DistributionContentsTypeObj, type DistributionType, DistributionTypeObj } from '$lib/types';
import Encoding from 'encoding-japanese';

/* Get Course by Decimal
====================================================*/
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
            throw new Error('Invalid Language');
        }
    }
};

/* Get Course (decimal) from Object Data
====================================================*/
export const getCourseByObjData = (courseData: Record<string, any>): number => {
    // change the values to boolean
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

/* Get Weapon Type by Dec
====================================================*/
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

/* Get Weapon Name by Dec
====================================================*/
export const getWpnNameByDec = async (dec: number, wpnType: number | null, lang: string): Promise<string> => {
    const hex: string = decToLittleEndian(dec);

    switch (wpnType) {
        // ranged
        case 1:
        case 5:
        case 10: {
            // language select
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
                    throw new Error('Invalid Language');
                }
            }
        }

        // melee
        default: {
            // language select
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
                    throw new Error('Invalid Language');
                }
            }
        }
    }
};

/* Convert 2-Dimensional Array into Object
====================================================*/
export const conv2DArrayToObject = (arr: [string, FormDataEntryValue][]): Record<string, any> => {
    let obj: { [key: string]: any } = {};

    arr.forEach((v) => {
        let key = v[0];
        let value = v[1];

        obj[key] = value;
    });

    return obj;
};

/* Generate Underscore and Lowercase Strings
====================================================*/
export const underscoreAndLowercase = (string: string): string => {
    // convert uppercase to lowercase
    const lowercaseString = string.toLowerCase();

    // underscore
    const underscoreLowercaseString = lowercaseString.replace(/\s/g, '_');

    return underscoreLowercaseString;
};

/* Endian Conversion
====================================================*/
export const decToLittleEndian = (dec: number): string => {
    // convert decimal to hexadecimal as a big-endian string with a minimum width of 4 digits
    const bigEndianHex: string = dec.toString(16).padStart(4, '0');

    // split the big-endian hex string into pairs of two characters
    const pairs = bigEndianHex.match(/.{1,2}/g);

    if (pairs) {
        // reverse the order of the pairs to get little-endian representation
        const littleEndianHex: string = pairs.reverse().join('');

        // convert alphabetic characters to uppercase
        const uppercaseLittleEndianHex: string = littleEndianHex.replace(/[a-f]/g, (match) => match.toUpperCase());

        return uppercaseLittleEndianHex;
    } else {
        throw new Error('Invalid Input');
    }
};

/* Discord Link Conversion
====================================================*/
export const discordLinkConvertor = (url: string): string => {
    if (url.indexOf('discord.com')) {
        return url.replace('https://discord.com/', 'discord://discordapp.com/');
    } else {
        return url;
    }
};

/* Convert Hrp Into True HR
====================================================*/
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
 * @returns {Uint8Array} 変換後のUint8Array
 */
export const encodeToShiftJIS = (value: string): Uint8Array => {
    const unicodeArray = Encoding.stringToCode(value);
    const encoded = Encoding.convert(unicodeArray, {
        to: 'SJIS',
        from: 'UNICODE',
    });

    return new Uint8Array(encoded);
};

export const getDistItemsData = async (
    contentsType: DistributionContentsType
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
            throw new Error('Invalid contents type.');
        }
    }
};

export const getDistributionType = (type: DistributionType): string => {
    const entry = Object.entries(DistributionTypeObj).find(([_, value]) => value === type);
    if (entry) {
        return entry[0];
    } else {
        throw new Error('Invalid distribution type.');
    }
};
