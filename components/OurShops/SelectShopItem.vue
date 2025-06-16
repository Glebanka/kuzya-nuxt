<script>
export default {
    data() {
        return {
            isShopSelected: false,
        }
    },
    props: {
        shop: Object,
        modelValue: Object,
    },
    computed: {
        selectedShop: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    inject: ['configs'],
    methods: {
        async changeUserAddress(shop) {
            const authStore = useAuthStore();
            const { token, isAuthenticated } = storeToRefs(authStore);
            if (isAuthenticated.value) {
                try {
                    await useNuxtApp().$apiFetch('/user-update-address/', {
                        method: 'POST',
                        body: {
                            'address': shop.address
                        },
                        headers: {
                            'Authorization': `Bearer ${token.value}`,
                        },
                    });
                } catch (error) {
                    console.error('Ошибка запроса:', error);
                }
            }
        }
    },
}
</script>
<template>
    <div class="select-shop-region-item__body our-shops-item__body">
        <div class="select-shop-region-item__block our-shops-item__block">
            <div class="our-shops-item__arrow hide-shops-item__js">
                <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 10H25M1 10L9 2M1 10L9 18" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <div class="select-shop-region-item__city our-shops-item__city" v-html="shop.address">
            </div>
            <div class="select-shop-region-item-contact our-shops-item-contact">
                <div class="select-shop-region-item-contact__label our-shops-item-contact__label">
                    Работает
                </div>
                <div class="select-shop-region-item-contact__value">{{ shop.from }}</div>
            </div>
        </div>
        <div class="select-shop-region-item__block our-shops-item__block">
            <div class="select-shop-region-item__contacts our-shops-item__contacts">

                <div key="shop-phone0" class="select-shop-region-item-contact our-shops-item-contact" v-if="shop.phone">
                    <div class="select-shop-region-item-contact__label our-shops-item-contact__label">
                        Телефон
                    </div>
                    <div class="select-shop-region-item-contact__value our-shops-item-contact__value">
                        <a :href="'tel:' + shop.phone">+{{ shop.phone }}</a>
                    </div>
                </div>
                <div key="shop-phone1" class="select-shop-region-item-contact our-shops-item-contact"
                    v-if="configs['TEL_HOT']">
                    <div class="select-shop-region-item-contact__label our-shops-item-contact__label">
                        Телефон горячей линии
                    </div>
                    <div class="select-shop-region-item-contact__value our-shops-item-contact__value">
                        <a :href="'tel:' + configs['TEL_HOT_HREF']">{{ configs['TEL_HOT']
                        }}</a>
                    </div>
                </div>
                <div class="select-shop-region-item-contact our-shops-item-contact"
                    v-if="shop.whatsapp || shop.telegram">
                    <div class="select-shop-region-item-contact__label our-shops-item-contact__label">
                        Чат в мессенджере
                    </div>
                    <div class="select-shop-region-item-contact__value our-shops-item-contact__value">
                        <div class="select-shop-region-item-contact__socials our-shops-item-contact__socials">
                            <div key="shop-socials0"
                                class="select-shop-region-item-contact__social our-shops-item-contact__social">
                                <a v-if="shop.whatsapp" :href="shop.whatsapp" target="_blank">
                                    <div>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M0 16L1.12466 11.8913C0.430666 10.6886 0.0659999 9.32531 0.0666665 7.92732C0.0686665 3.55666 3.62533 0 7.99532 0C10.116 0.000666665 12.1066 0.826665 13.604 2.32533C15.1006 3.82399 15.9246 5.81599 15.924 7.93465C15.922 12.306 12.3653 15.8626 7.99532 15.8626C6.66865 15.862 5.36132 15.5293 4.20332 14.8973L0 16ZM4.39799 13.462C5.51532 14.1253 6.58198 14.5226 7.99265 14.5233C11.6246 14.5233 14.5833 11.5673 14.5853 7.93332C14.5866 4.29199 11.642 1.34 7.99798 1.33866C4.36332 1.33866 1.40666 4.29466 1.40533 7.92798C1.40466 9.41131 1.83933 10.522 2.56933 11.684L1.90333 14.116L4.39799 13.462ZM11.9893 9.81931C11.94 9.73665 11.808 9.68731 11.6093 9.58798C11.4113 9.48865 10.4373 9.00931 10.2553 8.94331C10.074 8.87731 9.94198 8.84398 9.80931 9.04265C9.67731 9.24065 9.29731 9.68731 9.18198 9.81931C9.06665 9.95131 8.95065 9.96798 8.75265 9.86865C8.55465 9.76931 7.91598 9.56065 7.15932 8.88531C6.57065 8.35998 6.17265 7.71132 6.05732 7.51265C5.94199 7.31465 6.04532 7.20732 6.14399 7.10865C6.23332 7.01998 6.34199 6.87732 6.44132 6.76132C6.54199 6.64665 6.57465 6.56399 6.64132 6.43132C6.70732 6.29932 6.67465 6.18332 6.62465 6.08399C6.57465 5.98532 6.17865 5.00999 6.01399 4.61332C5.85265 4.22732 5.68932 4.27932 5.56799 4.27332L5.18799 4.26666C5.05599 4.26666 4.84132 4.31599 4.65999 4.51466C4.47866 4.71332 3.96666 5.19199 3.96666 6.16732C3.96666 7.14265 4.67666 8.08465 4.77532 8.21665C4.87466 8.34865 6.17199 10.35 8.15932 11.208C8.63198 11.412 9.00131 11.534 9.28865 11.6253C9.76331 11.776 10.1953 11.7546 10.5366 11.704C10.9173 11.6473 11.7086 11.2246 11.874 10.762C12.0393 10.2986 12.0393 9.90198 11.9893 9.81931Z"
                                                fill="#1D1D1D" />
                                        </svg>
                                    </div>
                                    whatsapp
                                </a>
                            </div>
                            <div key="shop-socials1"
                                class="select-shop-region-item-contact__social our-shops-item-contact__social">
                                <a v-if="shop.telegram" :href="shop.telegram" target="_blank">
                                    <div>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.7754 1.04294C14.485 0.974882 14.1549 0.985597 13.7504 1.09036C11.407 1.69753 2.09165 4.59114 1.32507 4.91538C0.48961 5.26867 0.00751958 5.89113 7.94162e-05 6.70783C-0.00984081 7.79982 0.91098 8.65705 2.00012 8.62035C2.03517 8.61958 3.3828 8.63718 4.15017 8.64483C4.15017 8.64483 4.83515 11.9185 4.85171 11.9575C5.05163 12.427 5.5206 12.567 5.92517 12.398L8.20026 11.4413C8.45779 11.6837 10.1893 13.2827 10.3753 13.4257C10.9294 13.8509 11.4082 13.9847 12.0003 13.9992C12.9537 14.023 13.7866 13.4869 14.2254 12.6129C14.5008 12.0646 15.7846 4.38621 15.9004 3.62457C16.0844 2.41558 16.0428 1.9407 15.5254 1.449C15.3175 1.25171 15.0659 1.11023 14.7754 1.04294ZM14.4003 2.52569C14.4003 2.52569 14.4392 2.66104 14.3254 3.40892C13.9181 6.0869 12.9529 11.566 12.7504 12.0148C12.612 12.3223 12.3348 12.4775 12.0253 12.4691C11.7529 12.4622 11.6173 12.4163 11.3753 12.2305C11.2508 12.1349 10.6907 11.6264 9.9003 10.8915C9.89038 10.8823 8.32379 9.42099 8.32379 9.42099C8.17106 9.27569 8.02754 9.18928 7.72681 9.18622C7.55193 9.18622 7.32112 9.31317 7.32112 9.31317L6.11806 10.2866L5.70021 8.33359L10.7253 6.27808C11.1312 6.11138 11.3249 5.66172 11.1503 5.27402C10.9758 4.88555 10.5062 4.70051 10.1003 4.86721L4.65018 7.11466C4.33986 7.11313 2.02741 7.08789 1.95012 7.09095C1.77212 7.0963 1.59812 6.92959 1.60012 6.70783C1.60172 6.53042 1.68356 6.42491 1.97508 6.30179C2.65078 6.01579 11.8536 3.16268 14.125 2.57463C14.3393 2.5188 14.4003 2.52569 14.4003 2.52569Z"
                                                fill="#1D1D1D" />
                                        </svg>
                                    </div>
                                    telegram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="select-shop-region-item__btns our-shops-item__btns">
                <div v-if="selectedShop == undefined"
                    class="select-shop-region-item__btn btn-border default-anim our-shops-item__btn"
                    @click="clickScrollTo('ask-question')" v-anim-hover>
                    Написать
                </div>
                <div v-if="selectedShop !== undefined" @click="() => { selectedShop = shop; changeUserAddress(shop) }"
                    class="select-shop-region-item__btn btn-border default-anim our-shops-item__btn selectShopBtn__js"
                    v-anim-hover>
                    <div
                        v-if="selectedShop.address == shop.address && selectedShop.coords == shop.coords && selectedShop.phone == shop.phone">
                        Выбрано</div>
                    <div v-else>Выбрать</div>
                </div>
            </div>
            <div class="select-shop-region-item__img">
                <picture>
                    <source :srcset="`${useRuntimeConfig().public.imgBaseURL}/storage/${shop.img}`" media="(orientation: portrait)">
                    <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/${shop.img}`">
                </picture>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
