<script>
import { mapState } from 'pinia';

export default {
    methods: {
        init() {
            const { $body } = useVars();
            const $popupBasket = selectElement('.popup-basket');
            function popupBasket() {
                document.addEventListener('click', (e) => {
                    let $openPopupBasket = e.target.closest('.open-popup-basket__js');
                    if ($openPopupBasket) {
                        $popupBasket.classList.add('_active');
                        $body.value.classList.add('_overflow');
                    } else {
                        return false;
                    }
                });

                document.addEventListener('click', (e) => {
                    if (e.target.closest('.close-popup__js')) {
                        e.target.closest('.popup').classList.remove('_active');
                        $body.value.classList.remove('_overflow');
                    } else {
                        return false;
                    }
                });
            }
            popupBasket();
        },

    },
    mounted() {
        this.init();
    },
    computed: {
        ...mapState(useCartStore, ['validTotal', 'productsUnavailable', 'productsAvailable']),
        products() {
            const store = useCartStore();
            return store.items;
        },
    },
}
</script>
<template>
    <div class="popup-basket popup">
        <div class="popup-basket__container popup__container right w720 h100vh">
            <div class="popup-basket__head popup__head">
                <template v-if="products.length">
                    <div class="popup-basket__title popup__title">В корзине {{ productsAvailable.length }}
                        {{ sklonenie(productsAvailable.length, ['товар', 'товара', 'товаров']) }}
                    </div>
                </template>
                <template v-else>
                    <div class="popup-basket__title popup__title">Корзина пуста</div>
                </template>
                <div class="popup-basket__close popup__close close-popup__js default-anim" v-anim-hover>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            <div class="popup-basket__content popup__content scroll">
                <div v-if="productsAvailable.length" class="popup-basket__products popup-basket-products__js">
                    <PopupBasketProduct v-for="(product, index) in productsAvailable" :item="product"
                        :index="index"></PopupBasketProduct>
                </div>
                <div v-if="productsUnavailable.length" class="popup-basket__products">
                    <h3>Товары будут позже</h3>
                    <popup-basket-product v-for="(product, index) in productsUnavailable" :item="product"
                        :index="index"></popup-basket-product>
                </div>
            </div>

            <div v-if="products.length" class="popup-basket-info">
                <div class="popup-basket-info__price popup-total-price__js">
                    {{ productsAvailable.length }} {{ sklonenie(productsAvailable.length, ['товар', 'товара', 'товаров']) }} на
                    <span>{{ numberWithSpaces(validTotal) }}</span> ₽
                </div>
                <div class="popup-basket-info__btns">
                    <div class="popup-basket-info__btn btn-border default-anim close-popup__js" v-anim-hover>Продолжить
                        покупки
                    </div>
                    <router-link to="/basket/" class="popup-basket-info__btn btn default-anim bg-yellow close-popup__js"
                        v-anim-hover>Перейти в корзину
                    </router-link>
                </div>
            </div>

        </div>
    </div>
</template>
<style lang="scss" scoped>
.popup-basket__products h3{
    margin-top: 4rem;
    margin-bottom: 4.8rem;
    @media screen and (orientation: portrait) {
        margin-bottom: 4rem;
    }
}
</style>