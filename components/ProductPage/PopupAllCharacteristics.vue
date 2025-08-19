<script setup>

const { characteristics } = defineProps(['characteristics'])

onMounted(() => {
    addEventListeners()
})

function addEventListeners() {
    const $openAllCharacteristics = selectElement('.open-all-characteristics__js');
    const $popupCharacteristics = selectElement('.popup-all-characteristics');
    if ($openAllCharacteristics) {
        $openAllCharacteristics.addEventListener('click', (e) => {
            useVars().$body.value.classList.add('_overflow');
            $popupCharacteristics.classList.add('_active');
        });
    }
}

const configs = inject('configs')
</script>
<template>
    <div class="popup-all-characteristics popup">
        <div class="popup-all-characteristics__container popup__container right w720 h100vh">
            <div class="popup-all-characteristics__head popup__head">
                <div class="popup-all-characteristics__title popup__title">Характеристики</div>
            </div>
            <div class="popup-all-characteristics__content popup__content scroll">
                <div class="popup-all-characteristics__list">
                    <div class="popup-all-characteristics-block">
                        <div class="popup-all-characteristics-block__name hidden">Дополнительная информация</div>
                        <div class="popup-all-characteristics-block__items" v-if="characteristics.length">
                            <ul class="list-style-none">
                                <template v-for="(characteristic, indx) in characteristics"
                                    :key="'blockCharacteristic-'+indx">
                                    <li class="popup-all-characteristics-block-item">
                                        <div class="popup-all-characteristics-block-item__label">{{ characteristic.name
                                        }}</div>
                                        <div class="popup-all-characteristics-block-item__value">{{ characteristic.value
                                        }}</div>
                                    </li>
                                </template>
                            </ul>
                        </div>
                    </div>
                    <div class="current-product-ques">
                        <div class="current-product-ques__container">
                            <div class="current-product-ques__title">Появились вопросы о товаре?</div>
                            <div class="current-product-ques__contacts">
                                <div class="current-product-ques__contact">
                                    <div class="current-product-ques__label">Телефон горячей линии:</div>
                                    <div class="current-product-ques__value">
                                        <a :href="'tel:' + configs['TEL_HOT_HREF']" class="text-anim">
                                            <span>{{ configs['TEL_HOT'] }}</span>
                                            <span>{{ configs['TEL_HOT'] }}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="popup-all-characteristics__close popup__close close-popup__js default-anim" v-anim-hover>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>
</template>