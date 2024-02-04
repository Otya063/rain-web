import type { Tweened } from 'svelte/motion';
import { get, writable } from 'svelte/store';

export const errDetailMode = writable(false);
export const msgClosed = writable(true);
export const timeOut = writable<Timeout | undefined>();
export const timerPause = writable(false);

/* Pause and Resume on setTimeout Function
====================================================*/
export class Timeout {
    time: number;
    callback: () => void;
    startedTime!: number;
    timeout!: NodeJS.Timeout;

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

/* Toggle Message Details
====================================================*/
export const toggleMsgDetail = (e: Event, t: Timeout | undefined, width: Tweened<number>): void => {
    if (!t) {
        throw new Error('Timeout is undefined.');
    }

    // prevent repeatedly pressing btn
    const target = e.target as HTMLButtonElement;
    target.disabled = true;
    target.classList.add('disabled_elm');

    setTimeout(() => {
        // after 0.5s, enable btn
        target.disabled = false;
        target.classList.remove('disabled_elm');
    }, 500);

    if (get(timerPause)) {
        errDetailMode.set(false);
        timerPause.set(false);
        t.run();
        width.set(0, { duration: t.getRestTime() });
    } else {
        errDetailMode.set(true);
        timerPause.set(true);
        t.pause();
        width.set(get(width), { duration: 0 });
    }
};

/* Close the Message Display Manually
====================================================*/
export const closeMsgDisplay = (t: Timeout | undefined): void => {
    if (!t) {
        throw new Error('Timeout is undefined.');
    }

    errDetailMode.set(false);
    document.getElementById('error_view_btn')?.classList.add('disabled_elm');
    t.stop();
    setTimeout(() => {
        timerPause.set(false);
        msgClosed.set(true);
    }, 100);
};
