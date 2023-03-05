import { browser } from '$app/environment';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

// slide open
export const slideDown = (target: Element) => {
    if (target instanceof HTMLElement) {
        target.style.height = 'auto';
        const h = target.offsetHeight;
        const tabHeight: string = h + 'px';
        target.style.height = tabHeight;
        target.animate(
            {
                height: ['0', tabHeight],
            },
            {
                duration: 400,
                easing: 'ease',
            }
        );
    }
};

// slide close
const slideUp = (target: Element) => {
    if (target instanceof HTMLElement) {
        const h = target.offsetHeight;
        const tabHeight: string = h + 'px';
        target.style.height = tabHeight;
        target.animate(
            {
                height: [tabHeight, '0'],
            },
            {
                duration: 400,
                easing: 'ease',
            }
        );
        target.style.height = '0';
    }
};

// toggle language selection field
export const toggleLangSel = (e: Event) => {
    const target = e.currentTarget;
    const lj = document.querySelector('.lang_sel_judge') as HTMLLIElement;
    const content = document.querySelector('.language_selectArea') as HTMLUListElement;
    if (target instanceof HTMLElement) {
        target.classList.toggle('langArrow_open');
        lj.classList.toggle('open');
        lj.classList.contains('open') ? slideDown(content) : slideUp(content);
    }
};

// toggle side menu
export const toggleMenuSel = (e: Event) => {
    const target = e.currentTarget;
    if (target instanceof HTMLElement) {
        target.classList.toggle('open');
        const content = target.nextElementSibling as HTMLUListElement;
        target.classList.contains('open') ? slideDown(content) : slideUp(content);
    }
};

// load article
export const loadArticle = (lang_code: string = '', maindir: string = '', subdir: string = '') => {
    event.stopPropagation();
    let href_path = `${lang_code}/${maindir}${subdir}`;
    location.pathname = href_path;
};

// bottom navigetion toggle
if (browser) {
    // remember which menu is now selected by index
    let menuNow: string = null;
    const btm_navs = document.querySelectorAll('.btm_nav_item');
    btm_navs.forEach((btm_nav, index) => {
        btm_nav.addEventListener('click', (e) => {
            const target = e.currentTarget;
            if (target instanceof HTMLElement) {
                const html = document.documentElement as HTMLElement;
                const target_id: string = target.id;
                const menu = document.querySelector(`.${target_id}`) as HTMLElement;
                const selected_nav = document.querySelector('.btm_nav_selected') as HTMLElement;
                const selected_text = document.querySelector('.btm_nav_text_selected') as HTMLLIElement;

                // automatically close the menu opened already
                menuNow !== null && menuNow !== index && selected_nav?.classList.remove('btm_nav_selected');

                // main toggle function
                menu.classList.toggle('btm_nav_selected');
                menuNow = index;

                // add class "fixed" to html tag to prevent users from moving the background while the menu is open
                const contains_class: boolean = menu.classList.contains('btm_nav_selected');
                html.classList.toggle('fixed', contains_class);

                // decorations for the text selected now
                target.classList.add('btm_nav_text_selected');
                selected_text && selected_text.classList.remove('btm_nav_text_selected');
            }
        });
    });
}

// bottom navigation scroll event
if (browser) {
    const bottom_navigation = document.querySelector('.bottom_navigations') as HTMLElement;
    window.addEventListener('scroll', () => {
        const pos_y: number = window.pageYOffset;
        pos_y < 150
            ? setTimeout(() => {
                  bottom_navigation.style.opacity = 1;
                  bottom_navigation.style.visibility = 'visible';
              }, 1)
            : setTimeout(() => {
                  bottom_navigation.style.opacity = 0;
                  bottom_navigation.style.visibility = 'hidden';
              }, 1);
    });
}

// scroll to top function
if (browser) {
    const back_top_btn = document.getElementById('scroll_to_top') as HTMLParagraphElement;
    back_top_btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// scroll to target element
if (browser) {
    const contents = document.querySelectorAll('.scroll');
    contents.forEach((content) => {
        content.addEventListener('click', (e) => {
            const target = e.currentTarget;
            if (target instanceof HTMLElement) {
                const data_target = target.getAttribute('data-target');
                const target_element = document.getElementById(data_target);
                target_element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        });
    });
}

// background fixed when detcting landscape
if (browser) {
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        const overlay = document.querySelector('.landscape_mode');
        innerWidth > innerHeight ? disableBodyScroll(overlay) : enableBodyScroll(overlay);
        window.addEventListener('orientationchange', () => {
            if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
                innerWidth < innerHeight ? disableBodyScroll(overlay) : enableBodyScroll(overlay);
            }
        });
    }
}
