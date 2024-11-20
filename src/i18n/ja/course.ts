import type { CourseJaData } from '$types';

export const courseJa = (bin: string[]): CourseJaData => {
    return {
        'トライアルコース [未使用]': {
            id: 1,
            enabled: bin[1] === '1',
            code: 'tlc',
        }, // this course is automatically enabled (= 1) on the server side
        ハンターライフコース: {
            id: 2,
            enabled: bin[29] === '1' || bin[27] === '1' ? false : bin[2] === '1',
            code: 'hlc',
        },
        エクストラコース: {
            id: 3,
            enabled: bin[28] !== '1' && bin[3] === '1',
            code: 'exc',
        },
        'エクストラBコース [未使用]': {
            id: 4,
            enabled: bin[4] === '1',
            code: 'exbc',
        }, // leftover
        モバイルコース: {
            id: 5,
            enabled: bin[5] === '1',
            code: 'mbc',
        },
        プレミアムコース: {
            id: 6,
            enabled: bin[6] === '1',
            code: 'prc',
        },
        'パローネコース（エクストラCコース） [未使用]': {
            id: 7,
            enabled: bin[7] === '1',
            code: 'plc',
        }, // leftover
        アシストコース: {
            id: 8,
            enabled: bin[8] === '1',
            code: 'asc',
        },
        Nコース: {
            id: 9,
            enabled: bin[9] === '1',
            code: 'nc',
        },
        秘伝コース: {
            id: 10,
            enabled: bin[10] === '1',
            code: 'hdc',
        },
        狩人応援コース: {
            id: 11,
            enabled: bin[11] === '1',
            code: 'hsc',
        },
        Nブーストコース: {
            id: 12,
            enabled: bin[12] === '1',
            code: 'nbc',
        },
        // [13]-[19] nothing
        'デバッグ [未使用]': {
            id: 20,
            enabled: bin[20] === '1',
            code: 'dbg',
        },
        'COG連携失効 [未使用]': {
            id: 21,
            enabled: bin[21] === '1',
            code: 'cle',
        },
        'Xbox LIVE ゴールド メンバーシップ [未使用]': {
            id: 22,
            enabled: bin[22] === '1',
            code: 'xgm',
        },
        'PS3/Vita トロフィー獲得条件 [未使用]': {
            id: 23,
            enabled: bin[23] === '1',
            code: 'trq',
        },
        'COG連携確認 [未使用]': {
            id: 24,
            enabled: bin[24] === '1',
            code: 'clc',
        },
        'ネットカフェ [未使用]': {
            id: 25,
            enabled: bin[25] === '1',
            code: 'nc',
        },
        公認ネットカフェ: {
            id: 26,
            enabled: bin[26] === '1',
            code: 'cnc',
        },
        ハンターライフ継続コース: {
            id: 27,
            enabled: bin[27] === '1',
            code: 'rhlc',
        }, // override HL Course
        エクストラ継続コース: {
            id: 28,
            enabled: bin[28] === '1',
            code: 'rexc',
        }, // override EX Course
        フリーコース: {
            id: 29,
            enabled: bin[29] === '1',
            code: 'frc',
        }, // override HL / RHL Course
    };
};
