/* Scroll to Top
====================================================*/
export const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* Scroll to Target Element
====================================================*/
export const scrollToElm = (e: MouseEvent): void => {
    const { currentTarget } = e;
    if (!(currentTarget instanceof HTMLElement)) {
        throw new TypeError();
    }

    const dataTarget = currentTarget.getAttribute('data-target')!;
    const targetElm = document.getElementById(dataTarget) as HTMLElement;

    targetElm.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
    });
};
