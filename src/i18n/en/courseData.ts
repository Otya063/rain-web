type CourseData = Record<
    string,
    {
        id: number;
        enabled: boolean;
        code: string;
    }
>;

export const courseEn = (bin: string[]): CourseData => {
    return {
        /* 'Trial Course': {
            id: 1,
            enabled: bin[1] === '1',
            code: 'tlc',
        }, */ // automatically enabled (= 1) on the server side
        'Hunter Life Course': {
            id: 2,
            enabled: bin[2] === '1',
            code: 'hlc',
        },
        'Extra Course': {
            id: 3,
            enabled: bin[3] === '1',
            code: 'exc',
        },
        /* 'Extra B Course': {
            id: 4,
            enabled: bin[4] === '1',
            code: 'exbc',
        }, */ // leftover
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
        /* 'Pallone Course (Extra C Course)': {
            id: 7,
            enabled: bin[7] === '1',
            code: 'plc',
        }, */ // leftover
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
        /* 'Debug': {
            id: 20,
            enabled: bin[20] === '1',
            code: 'dbg',
        }, */
        /* 'COG Link Expired': {
            id: 21,
            enabled: bin[21] === '1',
            code: 'cle',
        }, */
        /* 'Xbox Gold Membership': {
            id: 22,
            enabled: bin[22] === '1',
            code: 'xgm',
        }, */
        /* 'PS3/Vita Trophy Reqs': {
            id: 23,
            enabled: bin[23] === '1',
            code: 'trq',
        }, */
        /* 'COG Link Check': {
            id: 24,
            enabled: bin[24] === '1',
            code: 'clc',
        }, */
        /* 'NetCafe': {
            id: 25,
            enabled: bin[25] === '1',
            code: 'nc',
        }, */
        'Certified NetCafe': {
            id: 26,
            enabled: bin[26] === '1',
            code: 'cnc',
        },
        'Hunter Life Continued Course': {
            id: 27,
            enabled: bin[27] === '1',
            code: 'hlcc',
        }, // override HL Course
        'Extra Continued Course': {
            id: 28,
            enabled: bin[28] === '1',
            code: 'excc',
        }, // override EX Course
        'Free Course': {
            id: 29,
            enabled: bin[29] === '1',
            code: 'frc',
        }, // override HL / HLC Course
    };
};
