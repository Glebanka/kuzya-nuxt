export function usePhoneMask() {
    const phoneInput = ref(null);

    const getInputNumbersValue = (input) => input.value.replace(/\D/g, '');


    const onPhonePaste = (e) => {
        const input = e.target;
        const inputNumbersValue = getInputNumbersValue(input);
        const pasted = e.clipboardData || window.clipboardData;
        if (pasted) {
            const pastedText = pasted.getData('Text');
            if (/\D/g.test(pastedText)) {
                input.value = inputNumbersValue;
                return;
            }
        }
    };

    const onPhoneInput = (e) => {
        const input = e.target;

        let inputNumbersValue = getInputNumbersValue(input);
        const selectionStart = input.selectionStart;
        let formattedInputValue = "";

        if (!inputNumbersValue) {
            input.value = "";
            return;
        }

        if (input.value.length !== selectionStart) {
            if (e.data && /\D/g.test(e.data)) {
                input.value = inputNumbersValue;
            }
            return;
        }

        if (inputNumbersValue[0] !== "7") {
            inputNumbersValue = "7" + inputNumbersValue;
        }

        formattedInputValue = "+7(";
        if (inputNumbersValue.length > 1) {
            formattedInputValue += inputNumbersValue.substring(1, 4) + ')';
        }
        if (inputNumbersValue.length >= 5) {
            formattedInputValue += inputNumbersValue.substring(4, 7);
        }
        if (inputNumbersValue.length >= 8) {
            formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
        }
        if (inputNumbersValue.length >= 10) {
            formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
        }
        nextTick(() => {
            input.value = formattedInputValue;
        })
    };

    const onPhoneKeyDown = (e) => {
        const input = e.target;
        const inputValue = input.value.replace(/\D/g, '');

        if (e.keyCode === 8 && input.selectionStart > 0) {
            const lastChar = input.value[input.selectionStart - 1];
            if ([')', '(', '-', ' '].includes(lastChar)) {
                input.value = input.value.substring(0, input.selectionStart - 1) + input.value.substring(input.selectionStart);
                e.preventDefault();
            }
        }

        if (
            (e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105) &&
            e.keyCode !== 8 && e.keyCode !== 46 &&
            !e.ctrlKey && !e.metaKey && !e.altKey
        ) {
            e.preventDefault();
        }

        if (e.keyCode === 8 && inputValue.length === 1) {
            e.target.value = "";
        }
    };

    onMounted(() => {
        if (phoneInput.value) {
            phoneInput.value.addEventListener('keydown', onPhoneKeyDown);
            phoneInput.value.addEventListener('input', onPhoneInput, false);
            phoneInput.value.addEventListener('paste', onPhonePaste, false);
        }
    });

    onBeforeUnmount(() => {
        if (phoneInput.value) {
            phoneInput.value.removeEventListener('keydown', onPhoneKeyDown);
            phoneInput.value.removeEventListener('input', onPhoneInput, false);
            phoneInput.value.removeEventListener('paste', onPhonePaste, false);
        }
    });

    return { phoneInput };
}