type CourseJapanese =
    | 'トライアルコース [未使用]'
    | 'ハンターライフコース'
    | 'エクストラコース'
    | 'エクストラBコース [未使用]'
    | 'モバイルコース'
    | 'プレミアムコース'
    | 'パローネコース（エクストラCコース） [未使用]'
    | 'アシストコース'
    | 'Nコース'
    | '秘伝コース'
    | '狩人応援コース'
    | 'Nブーストコース'
    | 'デバッグ [未使用]'
    | 'COG連携失効 [未使用]'
    | 'Xbox LIVE ゴールド メンバーシップ [未使用]'
    | 'PS3/Vita トロフィー獲得条件 [未使用]'
    | 'COG連携確認 [未使用]'
    | 'ネットカフェ [未使用]'
    | '公認ネットカフェ'
    | 'ハンターライフ継続コース'
    | 'エクストラ継続コース'
    | 'フリーコース';

type CourseEnglish =
    | 'Trial Course [Unused]'
    | 'Hunter Life Course'
    | 'Extra Course'
    | 'Extra B Course [Unused]'
    | 'Mobile Course'
    | 'Premium Course'
    | 'Pallone Course (Extra C Course) [Unused]'
    | 'Assist Course'
    | 'N Course'
    | 'Hiden Course'
    | 'Hunter Support Course'
    | 'N Boost Course'
    | 'Debug [Unused]'
    | 'COG Linkage Expired [Unused]'
    | 'Xbox Gold Membership [Unused]'
    | 'PS3/Vita Trophy Requirements [Unused]'
    | 'COG Linkage Check [Unused]'
    | 'NetCafe [Unused]'
    | 'Certified NetCafe'
    | 'Recurring Hunter Life Course'
    | 'Recurring Extra Course'
    | 'Free Course';

export type CourseJaData = {
    [courseName in CourseJapanese]: { id: number; enabled: boolean; code: string };
};

export type CourseEnData = {
    [courseName in CourseEnglish]: { id: number; enabled: boolean; code: string };
};
