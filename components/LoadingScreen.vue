<script>
export default {
    data() {
        return {
            isActive: false,
            successMsg: '',
            errorMsg: '',
        }
    },
    methods: {
        show() {
            this.isActive = true;
        },
        closeAfter(timeout) {
            setTimeout(() => {
                this.isActive = false;
            }, timeout);
        },
        close() {
            this.isActive = false;
        },
        success(msg) {
            this.successMsg = msg;
            setTimeout(() => {
                this.isActive = false;
                this.successMsg = '';
            }, 1500);
        },
        error(msg) {
            this.errorMsg = msg;
            setTimeout(() => {
                this.isActive = false;
                this.errorMsg = '';
            }, 4000);
        }
    },
}
</script>
<template>
    <div class="loading-screen" v-if="isActive">
        <div class="icon">
            <div v-if="successMsg !== ''" class="loading-screen__icon-container">
                <svg class="loading-success" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <path fill="none" stroke="#0078BE" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M21.86 5.392c.428 1.104-.171 1.86-1.33 2.606c-.935.6-2.126 1.252-3.388 2.365c-1.238 1.091-2.445 2.406-3.518 3.7a55 55 0 0 0-2.62 3.437c-.414.591-.993 1.473-.993 1.473A2.25 2.25 0 0 1 8.082 20a2.24 2.24 0 0 1-1.9-1.075c-.999-1.677-1.769-2.34-2.123-2.577C3.112 15.71 2 15.618 2 14.134C2 12.955 2.995 12 4.222 12c.867.032 1.672.373 2.386.853c.456.306.939.712 1.441 1.245a58 58 0 0 1 2.098-2.693c1.157-1.395 2.523-2.892 3.988-4.184c1.44-1.27 3.105-2.459 4.87-3.087c1.15-.41 2.429.153 2.856 1.258"
                        color="currentColor" />
                </svg>
                <p class="loading-screen__icon-text">{{ successMsg }}</p>
            </div>
            <div v-if="errorMsg !== ''" class="loading-screen__icon-container">
                <svg class="loading-failed" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="#0078BE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                        <path stroke-dasharray="64" stroke-dashoffset="64"
                            d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" />
                        </path>
                        <path stroke-dasharray="8" stroke-dashoffset="8"
                            d="M12 12l4 4M12 12l-4 -4M12 12l-4 4M12 12l4 -4">
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s"
                                values="8;0" />
                        </path>
                    </g>
                </svg>
                <p class="loading-screen__icon-text">{{ errorMsg }}</p>
            </div>
            <svg v-if="successMsg == '' && errorMsg == ''" class="loading-spinner" width="24" height="24"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".1" />
                <path fill="#0078BE"
                    d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                    <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12"
                        repeatCount="indefinite" />
                </path>
            </svg>
        </div>
    </div>
</template>
<style scoped lang="scss">
.loading-screen {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: #00000017;
    z-index: 100;
}

.loading-screen__icon-container {
    display: flex;
    flex-flow: column;
    gap: 1rem;
    align-items: center;
}

.loading-screen__icon-text {
    font-size: 3rem;
    color: #0078BE;
    text-align: center;
}

.icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    svg {
        width: 10rem;
        height: 10rem;
    }
}
</style>