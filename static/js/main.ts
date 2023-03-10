import { browser } from '$app/environment';

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
/* Scroll to Top
====================================================*/
export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* Scroll to Target Element
====================================================*/
if (browser) {
    const contents = document.querySelectorAll('.scroll') as NodeListOf<HTMLAnchorElement>;
    contents.forEach((content: HTMLAnchorElement) => {
        content.addEventListener('click', (e: MouseEvent) => {
            const data_target: string = e.currentTarget.getAttribute('data-target');
            const target_element = document.getElementById(data_target) as HTMLElement;
            target_element.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
        });
    });
}

/* Load Article
====================================================*/
export const loadArticle = (lang_code: string = '', maindir: string = '', subdir: string = '') => {
    const href_path: string = `${lang_code}/${maindir}${subdir}`;
    location.pathname = href_path;
};

// bottom navigetion toggle
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
