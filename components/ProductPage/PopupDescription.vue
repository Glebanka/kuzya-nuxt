<script setup>
onMounted(() => {
    addEventListeners()
})

function addEventListeners() {
    const $openAllCharacteristics = selectElement('.open-popup-description__js');
    const $popupCharacteristics = selectElement('.popup-description');
    if ($openAllCharacteristics) {
        $openAllCharacteristics.addEventListener('click', (e) => {
            useVars().$body.value.classList.add('_overflow');
            $popupCharacteristics.classList.add('_active');
        });
    }
}
</script>
<template>
    <div class="popup popup-description">
        <div class="popup__container popup-description__container right w720 h100vh">
            <div class="popup__head">
                <div class="popup__title">Описание</div>
            </div>
            <div class="popup__content scroll">
                <slot></slot>
            </div>
            <div class="popup__close close-popup__js default-anim" v-anim-hover>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>
</template>