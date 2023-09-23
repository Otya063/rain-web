import { browser } from '$app/environment';
import { writable } from 'svelte/store';

/*=========================================================
　　　　　Slide Functions
=======================================================*/
/* Slide Open
====================================================*/
export const slideOpen = (target: HTMLElement) => {
    // error handling
    if (!target && console.log('Target was not found.')) return;

    target.style.height = 'auto';
    const h: number = target.offsetHeight;
    const tabHeight: number = h;
    target.animate(
        {
            height: ['0', tabHeight + 'px'],
        },
        {
            duration: 400,
            easing: 'ease',
        }
    );
};

/* Slide Close
====================================================*/
const slideClose = (target: HTMLElement) => {
    // error handling
    if (!target && console.log('Target was not found.')) return;

    const h: number = target.offsetHeight;
    const tabHeight: number = h;
    target.animate(
        {
            height: [tabHeight + 'px', '0'],
        },
        {
            duration: 400,
            easing: 'ease',
        }
    );
    target.style.height = '0';
};

/* Toggle Languages Selection Field
====================================================*/
export const toggleLangSel = (e: Event) => {
    const target = e.currentTarget as EventTarget;
    const judge = document.querySelector('.lang_sel_judge') as HTMLLIElement;
    const content = document.querySelector('.language_selectArea') as HTMLUListElement;
    target.classList.toggle('langArrow_open'); // rotate arrow
    judge.classList.toggle('open'); // first time
    judge.classList.contains('open') ? slideOpen(content) : slideClose(content); // after the second time
};

/* Toggle Side Menu
====================================================*/
export const toggleMenuSel = (e: Event) => {
    const target = e.currentTarget as EventTarget;
    const content = target.nextElementSibling as HTMLUListElement;
    target.classList.toggle('open'); // first time
    target.classList.contains('open') ? slideOpen(content) : slideClose(content); // after the second time
};

/*=========================================================
　　　　　Article Functions
=======================================================*/
/* Pinch Zoom Restriction
====================================================*/
if (browser) {
    document.documentElement.addEventListener(
        'touchstart',
        (e: TouchEvent) => {
            e.touches.length > 1 && e.preventDefault();
        },
        { passive: false }
    );
}

/* Scroll to Top
====================================================*/
export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* Scroll to Target Element
====================================================*/
export const scrollToElm = (e: MouseEvent) => {
    const data_target: string = e.currentTarget.getAttribute('data-target');
    const target_element = document.getElementById(data_target) as HTMLElement;
    target_element.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
    });
};

/* Load Article
====================================================*/
export const loadArticle = (lang_code: string = '', maindir: string = '', subdir: string = '') => {
    const href_path: string = `${lang_code}/manual/${maindir}${subdir}`;
    const url = new URL(href_path, location.origin);
    // remove unnecessary things
    url.search = '';
    location.href = url.toString();
};

/* Bottom Navigation Toggle
====================================================*/
if (browser) {
    // remember which menu is now selected by index
    let menuNow: number | null = null;
    const btm_navs = document.querySelectorAll('.btm_nav_item') as NodeListOf<HTMLLIElement>;
    btm_navs.forEach((btm_nav: HTMLLIElement, index: number) => {
        btm_nav.addEventListener('click', (e: MouseEvent) => {
            const target = e.currentTarget as EventTarget;
            const { id }: { id: string } = e.currentTarget;
            const menu = document.querySelector(`.${id}`) as HTMLElement;
            const selected_nav = document.querySelector('.btm_nav_selected') as HTMLElement | null;
            const selected_text = document.querySelector('.btm_nav_text_selected') as HTMLLIElement | null;

            // automatically close the menu opened already
            menuNow !== null && menuNow !== index && selected_nav?.classList.remove('btm_nav_selected');

            // main toggle function
            menu.classList.toggle('btm_nav_selected');
            menuNow = index;

            // add class "fixed" to html tag to prevent users from moving the background while the menu is open
            const contains_class: boolean = menu.classList.contains('btm_nav_selected');
            document.documentElement.classList.toggle('fixed', contains_class);

            // decorations for the text selected now
            target.classList.add('btm_nav_text_selected');
            selected_text?.classList.remove('btm_nav_text_selected');
        });
    });
}

/*=========================================================
　　　　　Admin Console
=======================================================*/
export const tab_param = writable('');
export const editMode = writable(false);
export const success = writable(false);
export const error = writable(false);
export const err_details = writable('');
export const notice = writable(false);
export const clicked_submit = writable(false);
export const ban_modal_title = writable('');
export const ban_modal_formAction = writable('');
export const user_ban = writable(false);
export const user_ban_uid = writable(0);
export const user_ban_name = writable('');
export const user_ban_cid = writable(0);

export const prepareUserBan = (title: string, action: string = '', user_id: number, username: string, character_id: number | null) => {
    user_ban.set(true);
    ban_modal_title.set(title);
    ban_modal_formAction.set(action);
    user_ban_uid.set(user_id);
    user_ban_name.set(username);
    user_ban_cid.set(character_id);
};

export const cancelUserBan = () => {
    user_ban.set(false);
    ban_modal_title.set('');
    ban_modal_formAction.set('');
    user_ban_uid.set(0);
    user_ban_name.set('');
    user_ban_cid.set(0);
};

/* Pause and Resume on setTimeout Function
====================================================*/
export class Timeout {
    time: number;
    callback: () => void;
    startedTime: number;
    timeout: NodeJS.Timeout;

    constructor(callbackFunction: () => void, time: number) {
        this.time = time;
        this.callback = callbackFunction;
        this.run();
    }

    run() {
        this.startedTime = new Date().getTime();
        if (this.time > 0) {
            this.timeout = setTimeout(this.callback, this.time);
        }
    }

    pause() {
        let currentTime = new Date().getTime();
        this.time = this.time - (currentTime - this.startedTime);
        clearTimeout(this.timeout);
    }

    stop() {
        clearTimeout(this.timeout);
        this.time = 0;
    }

    getRestTime() {
        return this.time;
    }
}

/*=========================================================
　　　　　Conversion Functions
=======================================================*/
/* Convert Normal Date to Unixtimestamp
====================================================*/
export const convDateToUnix = (date_value: string) => {
    const split_date = date_value.split('-');
    const year = parseInt(split_date[0]);
    const month = parseInt(split_date[1]) - 1;
    const day = parseInt(split_date[2]);

    const date = new Date(Date.UTC(year, month, day));

    const timestamp = Math.floor(date.getTime() / 1000);

    return timestamp;
};

/* Convert Unixtimestamp to Date
====================================================*/
export const convUnixToDate = (timestamp: number | null, ISO8601: boolean) => {
    const date = new Date(timestamp * 1000);

    // for nomal expression
    const formattedDate1 = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // for ISO 8601 expression
    const formattedDate2 = date
        .toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        .replace(/\//g, '-');

    return ISO8601 ? formattedDate2 : formattedDate1;
};

/* Convert RFC 2822 Time to ISO 8601 with Time
====================================================*/
export const convRFCToISOWithTime = (rfc: Date | null) => {
    // parse the RFC2822 string into a Date object
    const date = new Date(rfc);

    // set seconds and milliseconds to zero
    date.setSeconds(0);
    date.setMilliseconds(0);

    // format the Date object as an ISO 8601 string with seconds and milliseconds removed
    const iso8601 = date.toISOString().replace(/:00\.000Z$/, '');

    return iso8601;
};

/* Convert FormData Into Objects
====================================================*/
export const convFormDataToObj = (data: FormData) => {
    const obj: Record<string, string | number | boolean> = {};

    for (const [key, value] of data.entries()) {
        if (value === 'true') {
            obj[key] = true;
        } else if (value === 'false') {
            obj[key] = false;
        } else {
            obj[key] = value;
        }
    }

    return obj;
};

/* Generate Underscore and Lowercase Strings
====================================================*/
export const underscoreAndLowercase = (string: string) => {
    // convert uppercase to lowercase
    const lowercaseString = string.toLowerCase();

    // underscore
    const underscoreLowercaseString = lowercaseString.replace(/\s/g, '_');

    return underscoreLowercaseString;
};

/* Get Course by Decimal
====================================================*/
export const getCourseByDecimal = (dec: number) => {
    let bin: string[] = dec.toString(2).padStart(30, '0').split('');
    bin = bin.reverse();

    type CourseData = Record<
        string,
        {
            id: number;
            enabled: boolean;
            code: string;
        }
    >;
    const courseData: CourseData = {
        /* 'Trial Course': {
            id: 1,
            enabled: bin[1] === '1',
            code: 'trc',
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
        /* 'Pallone Course (ExtraC)': {
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
        // [13]-[25] are nothing
        'Official NetCafe': {
            id: 26,
            enabled: bin[26] === '1',
            code: 'onc',
        },
        'Hunter Life Continuation Course': {
            id: 27,
            enabled: bin[27] === '1',
            code: 'hlcc',
        }, // override HL Course
        'Extra Continuation Course': {
            id: 28,
            enabled: bin[28] === '1',
            code: 'excc',
        }, // override EX Course
        'Free Course': {
            id: 29,
            enabled: bin[29] === '1',
            code: 'frc',
        }, // override HL Course
    };

    return courseData;
};

/* Get Course (decimal) by FormData
====================================================*/
export const getCourseByFormData = (data: Record<string, string | number | boolean>) => {
    delete data.user_id;

    // change the values to boolean
    Object.keys(data).forEach((key) => {
        data[key] === 'on' && (data[key] = true);
    });

    const bin = `${data['hl'] === 'frc' ? 1 : 0}${data['ex'] === 'excc' ? 1 : 0}${data['hl'] === 'hlcc' ? 1 : 0}${data['onc'] ? 1 : 0}0000000000000${data['nbc'] ? 1 : 0}${data['hsc'] ? 1 : 0}${
        data['hdc'] ? 1 : 0
    }${data['nc'] ? 1 : 0}${data['asc'] ? 1 : 0}${data['plc'] ? 1 : 0}${data['prc'] ? 1 : 0}${data['mbc'] ? 1 : 0}${data['exbc'] ? 1 : 0}${data['ex'] === 'exc' ? 1 : 0}${
        data['hl'] === 'hlc' ? 1 : 0
    }${data['trc'] ? 1 : 0}0`;
    const dec = parseInt(bin, 2);

    return dec;
};
