<script lang="ts">
    import { isNumber } from '$utils/client';

    interface Props {
        value: number;
        min?: number;
        max?: number;
        step?: number;
        name: string;
        input: (value: number) => void;
    }
    let { value = $bindable(), min = 1, max = 100, step = 1, name, input }: Props = $props();
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    /**
     * 現在の値を1ステップ分増加させる\
     * 増加後、値が最大値（max）を超過しないように制限する
     */
    const increment = (): void => {
        if (value < max) {
            value += step;
            input(value);
        } else {
            // 長押し時にボタン無効となった場合、クリアして関数止める
            clearTimeout(timeoutId!);
            clearInterval(intervalId!);
            timeoutId = null;
            intervalId = null;
        }
    };

    /**
     * 現在の値を1ステップ分減少させる\
     * 減少後、値が最小値（min）を下回らないように制限する
     */
    const decrement = (): void => {
        if (value > min) {
            value -= step;
            input(value);
        } else {
            // 長押し時にボタン無効となった場合、クリアして関数止める
            clearTimeout(timeoutId!);
            clearInterval(intervalId!);
            timeoutId = null;
            intervalId = null;
        }
    };

    /**
     * 値の増加を開始する\
     * 連続動作の設定も含む
     */
    const startIncrement = (): void => {
        increment();
        startAutoRepeat(increment);
    };

    /**
     * 値の減少を開始する\
     * 連続動作の設定も含む
     */
    const startDecrement = (): void => {
        decrement();
        startAutoRepeat(decrement);
    };

    /**
     * ボタン長押し時の自動増加および減少の処理を行う\
     * 長押し後1.5秒間は通常変化、その後高速変化
     *
     * @param {() => void} action 実行する関数（incrementまたはdecrement）
     */
    const startAutoRepeat = (action: () => void): void => {
        // 長押し開始から1.5秒までは通常スピード
        timeoutId = setTimeout(() => {
            clearInterval(intervalId!);
            intervalId = setInterval(action, 50); // 高速時: 50ms間隔で値変更
        }, 1500);

        intervalId = setInterval(action, 200); // 通常時: 200ms間隔で値変更
    };

    /**
     * ボタンを離した時の自動増加および減少の動作を停止する
     */
    const stopAutoRepeat = (): void => {
        clearTimeout(timeoutId!);
        clearInterval(intervalId!);
        timeoutId = null;
        intervalId = null;
    };

    /**
     * 入力値が手動で変更されたときに値を検証し、更新する
     *
     * @param {Event} event 入力イベント
     */
    const onInput = (event: Event): void => {
        const inputValue = (event.target as HTMLInputElement).value;

        if (isNumber(inputValue) && Number(inputValue) >= min && Number(inputValue) <= max) {
            value = Number(inputValue);
            input(value);
        } else {
            input(min); // 無効な値である時は、最小値を設定
        }
    };
</script>

<div class="number_input_wrapper">
    <button class="decrement_btn" type="button" onpointerdown={startDecrement} onpointerup={stopAutoRepeat} disabled={value <= min}>−</button>
    <input class="number_input_text" type="text" {name} bind:value oninput={onInput} />
    <button class="increment_btn" type="button" onpointerdown={startIncrement} onpointerup={stopAutoRepeat} disabled={value >= max}>+</button>
</div>
