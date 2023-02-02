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
  const content = document.querySelector(
    '.language_selectArea'
  ) as HTMLUListElement;
  if (target instanceof HTMLElement) {
    target.classList.toggle('langArrow_open');
    lj.classList.toggle('open');
    if (lj.classList.contains('open')) {
      slideDown(content);
    } else {
      slideUp(content);
    }
  }
};

// toggle side menu
export const toggleMenuSel = (e: Event) => {
  const target = e.currentTarget;
  if (target instanceof HTMLElement) {
    target.classList.toggle('open');
    const content = target.nextElementSibling as HTMLUListElement;
    if (target.classList.contains('open')) {
      slideDown(content);
    } else {
      slideUp(content);
    }
  }
};

// load article
export const loadArticle = (
  lang_code: string = '',
  maindir: string = '',
  subdir: string = ''
) => {
  event.stopPropagation();
  let href_path = `${lang_code}/${maindir}${subdir}`;
  location.pathname = href_path;
};
