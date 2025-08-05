<script>
export default {
    data() {
        return {
            isVisible: false,
            message: "",
            resolve: null,
        };
    },
    methods: {
        show(message) {
            this.message = message;
            this.isVisible = true;
            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
        confirm() {
            this.isVisible = false;
            this.resolve(true);
        },
        cancel() {
            this.isVisible = false;
            this.resolve(false);
        },
    },
};
</script>
<template>
    <Transition>
        <div v-if="isVisible" class="confirm-popup popup-overlay" @click="cancel">
            <div class="popup-container" @click.stop>
                <p class="popup-title">{{ message }}</p>
                <div class="popup-btns">
                    <button class="popup-btn popup-btn_active" @click="confirm">Да</button>
                    <button class="popup-btn" @click="cancel">Нет</button>
                </div>
            </div>
        </div>
    </Transition>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 123;
}

.popup-container {
    background: var(--white);
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-flow: column;
    width: 40rem;
    gap: 2.8rem;
}

.popup-btn {
    padding: 1rem 2rem;
    border-radius: .5rem;
}

.popup-btn_active {
    background-color: var(--blue);
    color: var(--white);
}

.popup-title {
    align-self: start;
    margin: 0;
}

.popup-btns {
    display: flex;
    align-self: flex-end;
}


.modal-enter-from {
    opacity: 0;
}

.modal-leave-to {
    opacity: 0;
}
</style>