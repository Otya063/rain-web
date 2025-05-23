import type { CourseEnData } from '$types';

export const courseEn = (bin: string[]): CourseEnData => {
    return {
        'Trial Course [Unused]': {
            id: 1,
            enabled: bin[1] === '1',
            code: 'tlc',
        }, // this course is automatically enabled (= 1) on the server side
        'Hunter Life Course': {
            id: 2,
            enabled: bin[29] === '1' || bin[27] === '1' ? false : bin[2] === '1',
            code: 'hlc',
        },
        'Extra Course': {
            id: 3,
            enabled: bin[28] !== '1' && bin[3] === '1',
            code: 'exc',
        },
        'Extra B Course [Unused]': {
            id: 4,
            enabled: bin[4] === '1',
            code: 'exbc',
        }, // leftover
        'Mobile Course': {
            id: 5,
            enabled: bin[5] === '1',
            code: 'mbc',
        },
        'Premium Course': {
            id: 6,
            enabled: bin[6] === '1',
            code: 'prc',
        },
        'Pallone Course (Extra C Course) [Unused]': {
            id: 7,
            enabled: bin[7] === '1',
            code: 'plc',
        }, // leftover
        'Assist Course': {
            id: 8,
            enabled: bin[8] === '1',
            code: 'asc',
        },
        'N Course': {
            id: 9,
            enabled: bin[9] === '1',
            code: 'nc',
        },
        'Hiden Course': {
            id: 10,
            enabled: bin[10] === '1',
            code: 'hdc',
        },
        'Hunter Support Course': {
            id: 11,
            enabled: bin[11] === '1',
            code: 'hsc',
        },
        'N Boost Course': {
            id: 12,
            enabled: bin[12] === '1',
            code: 'nbc',
        },
        // [13]-[19] nothing
        'Debug [Unused]': {
            id: 20,
            enabled: bin[20] === '1',
            code: 'dbg',
        },
        'COG Linkage Expired [Unused]': {
            id: 21,
            enabled: bin[21] === '1',
            code: 'cle',
        },
        'Xbox Gold Membership [Unused]': {
            id: 22,
            enabled: bin[22] === '1',
            code: 'xgm',
        },
        'PS3/Vita Trophy Requirements [Unused]': {
            id: 23,
            enabled: bin[23] === '1',
            code: 'trq',
        },
        'COG Linkage Check [Unused]': {
            id: 24,
            enabled: bin[24] === '1',
            code: 'clc',
        },
        'NetCafe [Unused]': {
            id: 25,
            enabled: bin[25] === '1',
            code: 'nc',
        },
        'Certified NetCafe': {
            id: 26,
            enabled: bin[26] === '1',
            code: 'cnc',
        },
        'Recurring Hunter Life Course': {
            id: 27,
            enabled: bin[27] === '1',
            code: 'rhlc',
        }, // override HL Course
        'Recurring Extra Course': {
            id: 28,
            enabled: bin[28] === '1',
            code: 'rexc',
        }, // override EX Course
        'Free Course': {
            id: 29,
            enabled: bin[29] === '1',
            code: 'frc',
        }, // override HL / RHL Course
    };
};
