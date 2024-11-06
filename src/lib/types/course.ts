type CourseJapanese =
    | 'トライアルコース [非推奨]'
    | 'ハンターライフコース'
    | 'エクストラコース'
    | 'エクストラBコース [非推奨]'
    | 'モバイルコース'
    | 'プレミアムコース'
    | 'パローネコース（エクストラCコース） [非推奨]'
    | 'アシストコース'
    | 'Nコース'
    | '秘伝コース'
    | '狩人応援コース'
    | 'Nブーストコース'
    | 'デバッグ [非推奨]'
    | 'COG連携失効 [非推奨]'
    | 'Xbox LIVE ゴールド メンバーシップ [非推奨]'
    | 'PS3/Vita トロフィー獲得条件 [非推奨]'
    | 'COG連携確認 [非推奨]'
    | 'ネットカフェ [非推奨]'
    | '公認ネットカフェ'
    | 'ハンターライフ継続コース'
    | 'エクストラ継続コース'
    | 'フリーコース';

type CourseEnglish =
    | 'Trial Course [Deprecated]'
    | 'Hunter Life Course'
    | 'Extra Course'
    | 'Extra B Course [Deprecated]'
    | 'Mobile Course'
    | 'Premium Course'
    | 'Pallone Course (Extra C Course) [Deprecated]'
    | 'Assist Course'
    | 'N Course'
    | 'Hiden Course'
    | 'Hunter Support Course'
    | 'N Boost Course'
    | 'Debug [Deprecated]'
    | 'COG Linkage Expired [Deprecated]'
    | 'Xbox Gold Membership [Deprecated]'
    | 'PS3/Vita Trophy Requirements [Deprecated]'
    | 'COG Linkage Check [Deprecated]'
    | 'NetCafe [Deprecated]'
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
