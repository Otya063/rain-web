import { error } from '@sveltejs/kit';
import Encoding from 'encoding-japanese';
import type { Op } from 'quill';
import { get } from 'svelte/store';
import { courseJa } from '$i18n/ja/course';
import { courseEn } from '$i18n/en/course';
import { type CourseJaData, type CourseEnData, type DistributionContentsType, DistributionContentsTypeObj, DistributionCategoryObj, type DistributionCategory, type JsonData } from '$types';
import { armJson, chestJson, headJson, itemJson, legJson, meleeJson, poogieJson, rangedJson, waistJson } from '.';

/**
 * URLのロケールスラグを置き換える
 *
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
 *
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
 *
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
 *
 * @param {number | null} dec 武器タイプを表す10進数
 * @param {string} lang 言語コード
 * @returns {string} 武器タイプの文字列
 */
export const getWpnTypeByDec = (dec: number | null, lang: string): string => {
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
                    return `Unsupported weapon type: ${dec}.`;
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
                    return `Unsupported weapon type: ${dec}.`;
                }
            }
        }

        default: {
            return `Unsupported language: ${lang}.`;
        }
    }
};

/**
 * 武器ID（10進数）から武器の名前を取得する
 *
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
 *
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
 * SJISで文字列をエンコードする
 *
 * @param {string} value 変換対象の文字列
 * @returns {number[]} 変換後の数値配列データ（10進数）
 */
export const encodeToShiftJIS = (value: string): number[] => {
    const unicodeArray = Encoding.stringToCode(value);
    const encoded = Encoding.convert(unicodeArray, {
        to: 'SJIS',
        from: 'UNICODE',
    });

    return encoded;
};

/**
 * 10進数をリトルエンディアンの16進数に変換する
 *
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
 *
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
 *
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
 *
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
 *
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
 * 配布カテゴリ名をインデックスから取得する
 *
 * @param {DistributionType} type 取得したい配布カテゴリのインデックス
 * @returns {string} 配布カテゴリ名文字列
 */
export const getDistributionCategoryName = (type: DistributionCategory): string => {
    const entry = Object.entries(DistributionCategoryObj).find(([_, value]) => value === type);

    if (entry) {
        return entry[0];
    } else {
        error(400, { message: '', message1: undefined, message2: [`Unsupported distribution type: ${type}.`], message3: undefined });
    }
};

/**
 * 配布コンテンツの種類名を取得する
 *
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
 *
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
 * カラー付き文字列をtypeに応じて変換する
 *
 * @template T 文字列がどのように変換されるか（`colorNum`、`colorTag`、`html`、`delta`のいずれか）
 * @param {...T extends 'delta' ? [type: T, input: string] : [type: T, input: string, useFor: 'event_name' | 'description']} args 変換素材引数
 *    - `type` が 'delta' の場合、引数は`[type: 'delta', input: string]`となる
 *    - `type` が 'delta'でない場合、引数は`[type: 'colorNum' | 'colorTag' | 'html', input: string, useFor： 'event_name' | 'description']`となる
 * @returns {string} 変換後の文字列
 */
export const convertColorString = <T extends 'colorNum' | 'colorTag' | 'html' | 'delta'>(
    ...args: T extends 'delta' ? [type: T, input: string] : [type: T, input: string, useFor: 'event_name' | 'description']
): string => {
    let [type, input, useFor] = args as ['colorNum' | 'colorTag' | 'html' | 'delta', string, 'event_name' | 'description'];

    if (type === 'html' && input.includes('<Color')) {
        // colorTag形式をhtml形式に変換
        const regex = /<Color(\d{2}) \/>/g;

        let result = '';
        let lastIndex = 0;
        let currentSpan = ''; // 現在の<span>タグを追跡

        let match: RegExpExecArray | null;
        while ((match = regex.exec(input)) !== null) {
            const [_, code] = match;
            const colorCode = getColorCodeByColorNum(code);
            const textStart = regex.lastIndex; // タグの直後がテキストの開始位置

            // 前回のマッチ後のテキストを処理
            result += input.slice(lastIndex, match.index);

            // 既存の<span>を閉じる
            if (currentSpan) {
                result += '</span>';
            }

            // 新しい<span>を開く
            currentSpan = `<span style='color: #${colorCode};'>`;
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
        // colorNum形式をhtml形式もしくはcolorTag形式に変換
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
            const colorCode = getColorCodeByColorNum(code);

            // テキストが存在する場合のみ処理
            if (text.trim()) {
                // 前回のマッチ後の文字を追加
                if (lastIndex < match.index) {
                    result += input.slice(lastIndex, match.index);
                }

                // 現在のマッチ部分を追加
                const validColorNum =
                    useFor === 'event_name'
                        ? ['00', '01', '02', '03', '04', '05', '06', '07', '16']
                        : ['00', '32', '01', '33', '02', '34', '03', '35', '04', '36', '05', '37', '06', '38', '07', '39', '16', '48'];
                result += type === 'html' ? `<span style='color: #${colorCode};'>${text}</span>` : `<Color${validColorNum.includes(code) ? code : '00'} />${text}`;
            }

            lastIndex = regex.lastIndex;
        }

        // 最後のマッチ後の文字を処理
        if (lastIndex < input.length) {
            result += input.slice(lastIndex);
        }

        // 改行コードは<br>に変換
        result = result.replace(/(\r\n|\r|\n)/g, '<br>');

        // HTML文字列内のテキスト部分のみ半角スペースを「&nbsp;」に置換（エディター内部での半角スペース非表示問題対応のため）
        type === 'html' && (result = replaceSpacesInTextNodes(result));

        return result;
    } else if (type === 'colorNum') {
        let jsonParsed;

        try {
            jsonParsed = JSON.parse(input);
        } catch {
            jsonParsed = null; // If parsing fails, treat it as a regular string
        }

        if (Array.isArray(jsonParsed)) {
            // delta形式をcolorNum形式に変換
            let result = convertDeltaToColorNum(jsonParsed);

            // 必ず末尾に~C00を追加（この配布物より下のもののテキスト色に影響を及ぼすため白に）
            if (!result.endsWith('~C00')) {
                result += '~C00';
            }

            return result;
        } else if (input.includes('<Color')) {
            // colorTag形式をcolorNum形式に変換
            const regex = /<Color(\d{2}) \/>/g;

            let result = '';
            let colorNum: string | null = null; // カラーコード
            let lastIndex = 0; // 前回のマッチ位置

            // 先頭に「<Color○○ />」がない場合（エディターがないモバイル端末からの操作で想定される）、自動的に「<Color00 />」があるものとして扱う
            if (!input.startsWith('<Color')) {
                input = `<Color00 />${input}`;
            }

            let match: RegExpExecArray | null;
            while ((match = regex.exec(input)) !== null) {
                const [_, code] = match;
                const textStart = match.index; // タグ直前のテキスト終了位置

                // タグの直前のテキストを処理
                const text = input.slice(lastIndex, textStart);

                if (text.trim()) {
                    // テキストが存在する場合、現在のカラーコードで追加
                    if (colorNum !== null) {
                        result += `~C${colorNum}`;
                    }

                    result += text;
                }

                // カラーコード設定
                const validColorNum =
                    useFor === 'event_name'
                        ? ['00', '01', '02', '03', '04', '05', '06', '07', '16']
                        : ['00', '32', '01', '33', '02', '34', '03', '35', '04', '36', '05', '37', '06', '38', '07', '39', '16', '48'];
                colorNum = validColorNum.includes(code) ? code : '00'; // 無効なカラーコードの場合、デフォルトの白に

                // 次の処理のためにインデックスを更新
                lastIndex = regex.lastIndex;
            }

            // 最後のテキストを処理
            const remainingText = input.slice(lastIndex);
            if (remainingText.trim()) {
                if (colorNum !== null) {
                    result += `~C${colorNum}`;
                }

                result += remainingText;
            }

            // 必ず末尾に~C00を追加（この配布物より下のもののテキスト色に影響を及ぼすため白に）
            if (!result.endsWith('~C00')) {
                result += '~C00';
            }

            return result;
        } else if (!input.includes('<Color')) {
            // html形式をcolorNum形式に変換

            // 先頭に「~C○○」がない場合（エディターがないモバイル端末からの操作で想定される）、自動的に「~C00」があるものとして扱う
            if (!input.startsWith('~C') && !input.includes('<span')) {
                input = `~C00${input}`;
            }

            // <span>タグを「~C**」に置換
            let result = input
                .replace(/<span\s+[^>]*style=["'][^>]*color:\s*([^;]+);?["'][^>]*>/g, (_, colorCode) => {
                    const colorNum = getColorNumByColorCode(colorCode);
                    return `~C${colorNum}`;
                })
                .replace(/<\/span>/g, '');

            // <br>タグを改行文字「\n」に変換
            result = result.replace(/<br\s*\/?>/g, '\n');

            // 改行文字の後にテキストがない場合、改行文字を削除
            result = result.replace(/\n+$/, '');

            // テキストが「~C00」で終わっていることを確認
            if (!result.endsWith('~C00')) {
                result += '~C00';
            }

            return result;
        } else {
            return '';
        }
    } else if (type === 'delta') {
        // colorNum形式をdelta形式に変換
        return JSON.stringify(convertColorNumToDelta(input), null, 2);
    } else {
        return '';
    }
};

/**
 * ゲーム内で使用されるカラーナンバ－から各色のカラーコードを取得する\
 * 配布セクションでは、タイトル用は上caseのみ、説明文用は上下case使用可能
 *
 * @param {string} code カラーナンバ－
 * @returns {string} カラーコード
 */
const getColorCodeByColorNum = (code: string): string => {
    switch (code) {
        case '00':
        case '32': {
            return 'ffffff'; // white
        }

        case '01':
        case '33': {
            return '323232'; // black
        }

        case '02':
        case '34': {
            return 'ff435d'; // red
        }

        case '03':
        case '35': {
            return '56ff56'; // green
        }

        case '04':
        case '36': {
            return '57ffff'; // cyan
        }

        case '05':
        case '37': {
            return 'ffff50'; // yellow
        }

        case '06':
        case '38': {
            return 'fea461'; // orange
        }

        case '07':
        case '39': {
            return 'ff84ff'; // pink
        }

        case '16':
        case '48': {
            return '4c49ef'; // blue
        }

        default: {
            return 'ffffff'; // white
        }
    }
};

/**
 * 各色のカラーコードからゲーム内で使用されるカラーナンバ－を取得する
 *
 * @param {string} colorCode カラーコード
 * @returns {string} カラーナンバ－
 */
const getColorNumByColorCode = (colorCode: string): string => {
    const colorMapping: Record<string, string> = {
        '#ffffff': '00',
        '#323232': '01',
        '#ff435d': '02',
        '#56ff56': '03',
        '#57ffff': '04',
        '#ffff50': '05',
        '#fea461': '06',
        '#ff84ff': '07',
        '#4c49ef': '16',
    };

    return colorMapping[colorCode.toLowerCase()] || '00'; // デフォルト値は白色「00」
};

/**
 * HTML文字列のテキストノード内の半角スペースを全て`&nbsp;`に置換する
 *
 * @param {string} htmlString 変換元HTML文字列
 * @returns {string} 変換後HTML文字列
 */
const replaceSpacesInTextNodes = (htmlString: string): string => {
    // HTML文字列をDOM構造解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const body = doc.body;

    /**
     * テキストノードのスペースを置換するため、ノードを再帰処理
     *
     * @param {Node} node 現在処理中のDOMノード
     */
    const replaceSpaces = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
            // 半角スペースを改行なしのスペース「&nbsp;」に置換
            node.nodeValue = node.nodeValue?.replace(/ /g, '\u00A0') || null;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 子ノードを再帰処理
            Array.from(node.childNodes).forEach(replaceSpaces);
        }
    };

    // bodyから処理を開始
    replaceSpaces(body);

    return body.innerHTML;
};

/**
 * カラーナンバー付き文字列をデルタデータ（Quillエディターのデータ形式）へ変換する
 *
 * @param {string} input 変換元の文字列
 * @returns {{ insert: string; attributes?: { color: string } }[]} 変換後のデルタデータ
 */
const convertColorNumToDelta = (input: string): { insert: string; attributes?: { color: string } }[] => {
    const lines = input.split('\n');
    const tempDelta: Array<{ insert: string; attributes?: { color: string } }> = [];
    const delta: Array<{ insert: string; attributes?: { color: string } }> = [];

    let currentColor = getColorCodeByColorNum('00'); // デフォルト色
    let accumulatedNewlines = '';

    lines.forEach((line) => {
        const matches = line.match(/~C(\d{2})([^~]*)/g);

        if (matches) {
            // 改行直前テキストを処理
            matches.forEach((match) => {
                const [, colorNum, text] = match.match(/~C(\d{2})([^~]*)/) || [];
                if (colorNum) {
                    currentColor = getColorCodeByColorNum(colorNum);
                }

                if (text) {
                    // 蓄積された改行をプッシュ（連続して分かれている改行コードは後で統合処理）
                    if (accumulatedNewlines) {
                        tempDelta.push({ insert: accumulatedNewlines });
                        accumulatedNewlines = '';
                    }

                    tempDelta.push({
                        insert: text.replace(/ /g, '\u00A0'), // 半角スペースを「&nbsp;」に置換（エディター内部での半角スペース非表示問題対応のため）
                        attributes: { color: `#${currentColor}` },
                    });
                }
            });

            // 処理された各テキストの後に改行を追加
            tempDelta.push({ insert: '\n' });
        } else if (line.trim().length === 0) {
            // 複数行の改行を蓄積
            accumulatedNewlines += '\n';
        }
    });

    // 残りの改行を追加
    if (accumulatedNewlines) {
        tempDelta.push({ insert: accumulatedNewlines });
    }

    // 改行コード統合
    tempDelta.forEach((current) => {
        const last = delta[delta.length - 1];

        if (last && !last.attributes && !current.attributes && last.insert.includes('\n') && current.insert.includes('\n')) {
            // 連続する改行を一つにまとめる
            last.insert += current.insert;
        } else {
            // 改行以外はそのまま
            delta.push(current);
        }
    });

    // 最後の改行コードを削除したものを返す
    return delta.slice(0, -1);
};

/**
 * デルタデータ（Quillエディターのデータ形式）をカラーナンバー付き文字列に変換する
 *
 * @param {{ insert: string; attributes?: { color: string } }[]} delta 変換元のデルタデータ
 * @returns {string} 変換後の文字列
 */
const convertDeltaToColorNum = (delta: { insert: string; attributes?: { color: string } }[]): string => {
    let result = '';

    delta.forEach((element) => {
        const { insert, attributes } = element;
        let colorCode = '#ffffff'; // デフォルト色

        if (attributes && attributes.color) {
            colorCode = attributes.color;
        }

        const colorNum = getColorNumByColorCode(colorCode);
        if (insert.includes('\n')) {
            // 改行コードはそのまま
            result += insert;
        } else {
            // カラーナンバーとテキストを追加
            result += `~C${colorNum}${insert}`;
        }
    });

    return result;
};

/**
 * デルタデータ（Quillエディターのデータ形式）内の改行コードを、統一フォーマットに整える
 * @param {Op[]} delta デルタデータ
 * @returns {{ insert: string; attributes?: { color: string } }[]} 調整後のデルタデータ
 */
export const adjustLineBreakOps = (delta: Op[]): { insert: string; attributes?: { color: string } }[] => {
    const result: Array<{ insert: string; attributes?: { color: string } }> = [];

    delta.forEach((element) => {
        const { insert, attributes } = element as { insert: string; attributes?: { color: string } };
        const color = attributes?.color || '#ffffff'; // デフォルト色

        // 改行文字で囲まれたテキストにマッチする正規表現
        const parts = insert.split(/(\n)/);

        parts.forEach((part) => {
            if (part === '\n') {
                result.push({ insert: part }); // 改行箇所
            } else if (part !== '') {
                result.push({ insert: part, attributes: { color } }); // テキスト箇所
            }
        });
    });

    return result;
};
