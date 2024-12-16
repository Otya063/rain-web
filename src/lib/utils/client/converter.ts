import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { courseJa } from '$i18n/ja/course';
import { courseEn } from '$i18n/en/course';
import { type WeaponType, type CourseJaData, type CourseEnData, type DistributionContentsType, DistributionContentsTypeObj, type DistributionType, DistributionTypeObj, type JsonData } from '$types';
import { armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson } from '.';

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
                case 0: {
                    return '大剣';
                }

                case 1: {
                    return 'ヘビィボウガン';
                }

                case 2: {
                    return 'ハンマー';
                }

                case 3: {
                    return 'ランス';
                }

                case 4: {
                    return '片手剣';
                }

                case 5: {
                    return 'ライトボウガン';
                }

                case 6: {
                    return '双剣';
                }

                case 7: {
                    return '太刀';
                }

                case 8: {
                    return '狩猟笛';
                }

                case 9: {
                    return 'ガンランス';
                }

                case 10: {
                    return '弓';
                }

                case 11: {
                    return '穿龍棍';
                }

                case 12: {
                    return 'スラッシュアックスF';
                }

                case 13: {
                    return 'マグネットスパイク';
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Unsupported weapon type: ${dec}.`], message3: undefined });
                }
            }
        }

        case 'en': {
            switch (dec) {
                case 0: {
                    return 'Great Sword';
                }

                case 1: {
                    return 'Heavy Bowgun';
                }

                case 2: {
                    return 'Hammer';
                }

                case 3: {
                    return 'Lance';
                }

                case 4: {
                    return 'Sword & Shield';
                }

                case 5: {
                    return 'Light Bowgun';
                }

                case 6: {
                    return 'Dual Blades';
                }

                case 7: {
                    return 'Long Sword';
                }

                case 8: {
                    return 'Hunting Horn';
                }

                case 9: {
                    return 'Gunlance';
                }

                case 10: {
                    return 'Bow';
                }

                case 11: {
                    return 'Tonfa';
                }

                case 12: {
                    return 'Switch Axe F';
                }

                case 13: {
                    return 'Magnet Spike';
                }

                default: {
                    error(400, { message: '', message1: undefined, message2: [`Unsupported weapon type: ${dec}.`], message3: undefined });
                }
            }
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Unsupported language: ${lang}.`], message3: undefined });
        }
    }
};

/**
 * 武器ID（10進数）から武器の名前を取得する
 * @param {number} dec 武器IDの10進数表現
 * @param {number | null} wpnType 武器タイプ
 * @returns {string} 武器の名前
 */
export const getWpnNameByDec = (dec: number, wpnType: number | null): string => {
    const hex: string = decToLittleEndian(dec);

    switch (wpnType) {
        // 遠距離武器
        case 1:
        case 5:
        case 10: {
            const jsonData = get(rangedJson);
            return jsonData[hex] || 'Unknown Weapon';
        }

        // 近距離武器
        default: {
            const jsonData = get(meleeJson);
            return jsonData[hex] || 'Unknown Weapon';
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
 * ハンターランクポイントを対応するハンターランクに変換する
 * @param {number | null} hrp ハンターランクポイント
 * @returns {number} 対応するハンターランク
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
 * ハンターランクを対応するハンターランクポイントに変換する
 * @param {number | null} hr ハンターランク
 * @returns {number} 対応するハンターランクポイント
 */
export const convHrToHrp = (hr: number): number => {
    switch (hr) {
        case 7: {
            return 999;
        }

        case 6: {
            return 998;
        }

        case 5: {
            return 299;
        }

        case 4: {
            return 99;
        }

        case 3: {
            return 50;
        }

        case 2: {
            return 30;
        }

        case 1: {
            return 1;
        }

        default: {
            return 65535;
        }
    }
};

/**
 * 配布コンテンツの種類に基づいてデータを取得する
 * @param {DistributionContentsType} contentsType コンテンツの種類
 * @returns {JsonData} 取得したデータ
 */
export const getDistItemsData = (contentsType: DistributionContentsType): JsonData => {
    switch (contentsType) {
        case DistributionContentsTypeObj.Leg: {
            const legData = get(legJson);
            return legData;
        }

        case DistributionContentsTypeObj.Head: {
            const headData = get(headJson);
            return headData;
        }

        case DistributionContentsTypeObj.Chest: {
            const chestData = get(chestJson);
            return chestData;
        }

        case DistributionContentsTypeObj.Arm: {
            const armData = get(armJson);
            return armData;
        }

        case DistributionContentsTypeObj.Waist: {
            const waistData = get(waistJson);
            return waistData;
        }

        case DistributionContentsTypeObj.Melee: {
            const meleeData = get(meleeJson);
            return meleeData;
        }

        case DistributionContentsTypeObj.Ranged: {
            const rangedData = get(rangedJson);
            return rangedData;
        }

        case DistributionContentsTypeObj.Item: {
            const itemData = get(itemJson);
            return itemData;
        }

        case DistributionContentsTypeObj['Poogie Outfit']: {
            const poogieData = get(poogieJson);
            return poogieData;
        }

        default: {
            error(400, { message: '', message1: undefined, message2: [`Unsupported contents type: ${contentsType}.`], message3: undefined });
        }
    }
};

/**
 * 配布扱い方法の種類名を取得する
 * @param {DistributionType} type 配布扱い方法の種類
 * @returns {string} 配布扱い方法タイプの文字列
 */
export const getDistributionTypeName = (type: DistributionType): string => {
    const entry = Object.entries(DistributionTypeObj).find(([_, value]) => value === type);

    if (entry) {
        return entry[0];
    } else {
        error(400, { message: '', message1: undefined, message2: [`Unsupported distribution type: ${type}.`], message3: undefined });
    }
};

/**
 * 配布コンテンツの種類名を取得する
 * @param {DistributionContentsType} type 配布コンテンツの種類
 * @returns {string} 配布コンテンツタイプの文字列
 */
export const getDistributionContentsTypeName = (type: DistributionContentsType): string => {
    const entry = Object.entries(DistributionContentsTypeObj).find(([_, value]) => value === type);

    if (entry) {
        return entry[0];
    } else {
        error(400, { message: '', message1: undefined, message2: [`Unsupported distribution contents type: ${type}.`], message3: undefined });
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

/**
 * カラーコード付き文字列をtypeに応じて変換する
 * @param {'colorCode' | 'colorTag' | 'html'} type 文字列がどのように変換されるか
 * @param {string} input 変換対象の文字列
 * @returns {string} 変換後の文字列
 */
export const convertColorCodeString = (type: 'colorCode' | 'colorTag' | 'html', input: string): string => {
    if (type === 'html' && input.includes('<Color')) {
        // colorTag形式をhtml形式に変換
        const regex = /<Color(\d{2}) \/>/g;

        let result = '';
        let lastIndex = 0;
        let currentSpan = ''; // 現在の<span>タグを追跡

        let match: RegExpExecArray | null;
        while ((match = regex.exec(input)) !== null) {
            const [_, code] = match;
            const spanClass = getColorNameByColorCode(code);
            const textStart = regex.lastIndex; // タグの直後がテキストの開始位置

            // 前回のマッチ後のテキストを処理
            result += input.slice(lastIndex, match.index);

            // 既存の<span>を閉じる
            if (currentSpan) {
                result += '</span>';
            }

            // 新しい<span>を開く
            currentSpan = `<span class='${spanClass}'>`;
            result += currentSpan;

            // 次の処理用にインデックスを更新
            lastIndex = textStart;
        }

        // 最後のテキストを追加
        result += input.slice(lastIndex);

        // 開いた<span>を閉じる
        if (currentSpan) {
            result += '</span>';
        }

        return result;
    } else if ((type === 'html' && !input.includes('<Color')) || type === 'colorTag') {
        // colorCode形式をhtml形式もしくはcolorTag形式に変換
        // 正規表現を用いて ~C○○ を抽出する
        const regex = /~C(\d{2})([^\~]*)/g;

        let match: RegExpExecArray | null;
        let lastIndex = 0;
        let result = '';

        // 先頭に「~C○○」がない場合、自動的に「~C00」があるものとして扱う
        if (!input.startsWith('~C')) {
            input = `~C00${input}`;
        }

        // 「~C○○」パターンを処理
        while ((match = regex.exec(input)) !== null) {
            const [_, code, text] = match;
            const spanClass = getColorNameByColorCode(code);

            // テキストが存在する場合のみ処理
            if (text.trim()) {
                // 前回のマッチ後の文字を追加
                if (lastIndex < match.index) {
                    result += input.slice(lastIndex, match.index);
                }

                // 現在のマッチ部分を追加
                const validColorCodes = ['00', '01', '02', '03', '04', '05', '06', '07', '16'];
                result += type === 'html' ? `<span class='${spanClass}'>${text}</span>` : `<Color${validColorCodes.includes(code) ? code : '00'} />${text}`;
            }

            lastIndex = regex.lastIndex;
        }

        // 最後のマッチ後の文字を処理
        if (lastIndex < input.length) {
            result += input.slice(lastIndex);
        }

        return result;
    } else if (type === 'colorCode') {
        // colorTag形式をcolorCode形式に変換
        const regex = /<Color(\d{2}) \/>/g;

        let result = '';
        let colorCode: string | null = null; // カラーコード
        let lastIndex = 0; // 前回のマッチ位置

        let match: RegExpExecArray | null;
        while ((match = regex.exec(input)) !== null) {
            const [_, code] = match;
            const textStart = match.index; // タグ直前のテキスト終了位置

            // タグの直前のテキストを処理
            const text = input.slice(lastIndex, textStart);

            if (text.trim()) {
                // テキストが存在する場合、現在のカラーコードで追加
                if (colorCode !== null) {
                    result += `~C${colorCode}`;
                }

                result += text;
            }

            // カラーコード設定
            const validColorCodes = ['00', '01', '02', '03', '04', '05', '06', '07', '16'];
            colorCode = validColorCodes.includes(code) ? code : '00'; // 無効なカラーコードの場合、デフォルトの白に

            // 次の処理のためにインデックスを更新
            lastIndex = regex.lastIndex;
        }

        // 最後のテキストを処理
        const remainingText = input.slice(lastIndex);
        if (remainingText.trim()) {
            if (colorCode !== null) {
                result += `~C${colorCode}`;
            }

            result += remainingText;
        }

        // 必ず末尾に~C00を追加（この配布物より下のもののテキスト色に影響を及ぼすため白に）
        if (!result.endsWith('~C00')) {
            result += '~C00';
        }

        return result;
    } else {
        return '';
    }
};

/**
 * ゲーム内で使用されるカラーコードから各色のクラス名を取得する
 * @param {string} code カラーコード
 * @returns {string} 色を示すクラス名
 */
export const getColorNameByColorCode = (code: string): string => {
    switch (code) {
        case '00': {
            return 'white'; // ffffff
        }

        case '01': {
            return 'black'; // 323232
        }

        case '02': {
            return 'red'; // ff435d
        }

        case '03': {
            return 'green'; // 56ff56
        }

        case '04': {
            return 'cyan'; // 57ffff
        }

        case '05': {
            return 'yellow'; // ffff50
        }

        case '06': {
            return 'orange'; // fea461
        }

        case '07': {
            return 'pink'; // ff84ff
        }

        case '16': {
            return 'blue'; // 4c49ef
        }

        default: {
            return 'white'; // ffffff
        }
    }
};
