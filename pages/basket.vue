<script>
import { mapActions, mapState } from "pinia";

export default {
    async setup() {
        const { data } = await useGetData('/pages', {
            params: { url_page: '/basket' },
            key: 'basket-page-data'
        });
        const breadcrumbs = ref([]);
        breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
        const aboutPage = ref(data.value?.data || []);
        useSeoMeta(useMetaTags(data.value));

        return {
            breadcrumbs,
            aboutPage,
        };
    },
    methods: {
        ...mapActions(useCartStore, [
            'removeItemsFromCart',
            'updatePrices',
            'checkItems',
            'uncheckItems'
        ]),
        toggleCheckAllItems() {
            if (!this.allChecked) {
                this.checkItems()
            } else {
                this.uncheckItems()
            }
        },
        popUpCheckAll() {
            this.checkItems()
            if (document.querySelector('.error-basket-popup')) {
                document.querySelector('.error-basket-popup').classList.remove('_active');
                useVars().$body.value.classList.remove('_overflow');
            }
        },
        init() {
            function basketPage() {
                const $promocodes = selectElements('.toogle-promocode__js');
                if ($promocodes.length) {
                    $promocodes.forEach(($item, indx) => {
                        $item.addEventListener('click', () => {
                            $item.parentElement.classList.toggle('_active');
                        });
                    });
                }
            }
            basketPage();
            this.checkItems();
        },
        formSubmit() {
            if (this.checkedItems.length) {
                this.$router.push('/order/');
            } else {
                if (document.querySelector('.error-basket-popup')) {
                    document.querySelector('.error-basket-popup').classList.add('_active');
                    useVars().$body.value.classList.add('_overflow');
                }
            }
        },
        removeSelectedProducts() {
            if (this.checkedItems.length) {
                const confirmPopUp = useConfirmPopup()
                confirmPopUp("Удалить товары из корзины?").then((ques) => {
                    if (ques) {
                        this.removeItemsFromCart(this.checkedItems);
                    }
                });
            } else {
                if (document.querySelector('.error-basket-popup')) {
                    document.querySelector('.error-basket-popup').classList.add('_active');
                    useVars().$body.value.classList.add('_overflow');
                }
            }
        },
    },
    computed: {
        ...mapState(useCartStore, ['totalPrice', 'checkedTotalPrice', 'checkedItems', 'allChecked']),
        products() {
            const store = useCartStore();
            return store.items;
        },
    },
    mounted() {
        this.init();
        this.updatePrices();
    },
}
</script>

<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <template v-if="products.length">
            <section class="block-auth hidden">
                <div class="block-auth__container container">
                    <div class="block-auth__title">Войдите или зарегестрируйтесь чтобы получить скидку</div>
                    <div class="block-auth__form">
                        <form action="" class="block-auth-form get-info-actions-form form">
                            <div class="block-auth-form__item get-info-actions-form__item form-item input _required">
                                <!-- <label for="" class="form-label">email</label> -->
                                <div class="block-auth-form__body get-info-actions-form__body form-item__body">
                                    <input type="email" name="email" autocapitalize="off" autocorrect="off"
                                        autocomplete="email" class="get-info-actions-form__input form-input email "
                                        inputmode="email" placeholder="Введите E-mail">
                                </div>
                            </div>
                            <button
                                class="block-auth-form__btn get-info-actions-form__btn form-btn btn default-anim bg-yellow"
                                v-anim-hover>
                                Войти
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <section class="block-basket">
                <div class="block-basket__container container">
                    <h1 class="block-basket__title anim-item anim-item-active">{{
                        aboutPage.headline }}</h1>
                    <div class="block-basket__count-product">{{ products.length }}
                        {{ sklonenie(products.length, ['товар', 'товара', 'товаров']) }}
                    </div>
                    <div class="block-basket__content">
                        <div class="block-basket-form">
                            <div class="block-basket-form__block">
                                <div class="block-basket-form__block-body">
                                    <div class="block-basket-products">
                                        <div class="block-basket-products__head">
                                            <div
                                                class="block-basket-products__check-all form-checkboxes form-checkboxes__js">
                                                <div class="form-item" :class="{ '_checked': allChecked }">
                                                    <label @click="toggleCheckAllItems" for="basket-check-all"
                                                        class="form-check-label">
                                                        Выбрать все
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="block-basket-products__remove-select remove-selected-products__js"
                                                @click="removeSelectedProducts">
                                                Удалить выбранные
                                            </div>
                                        </div>
                                        <div class="block-basket-products__list form-checkboxes form-checkboxes__js">
                                            <product-basket v-for="(product, index) in products" :item="product"
                                                :index="index"></product-basket>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="block-basket-form__block">
                                <div class="block-basket-form__block-body">
                                    <div class="basket-form-info">
                                        <div class="basket-form-info__container">
                                            <div class="basket-form-info__share share-btn open-share-popup__js hidden"
                                                data-title="Поделиться корзиной" data-link="http://kuzya.loc/basket">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z"
                                                        stroke="#1D1D1D" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                                Поделиться корзиной
                                            </div>
                                            <div v-if="products.length"
                                                class="basket-form-info__count-product block-basket__count-product">
                                                {{ checkedItems.length + ' ' + sklonenie(checkedItems.length,
                                                    ['товар', 'товара', 'товаров']) }}
                                            </div>

                                            <div class="basket-form-info__promocodes hidden">
                                                <div class="basket-form-info-promocode">
                                                    <div class="basket-form-info-promocode__label toogle-promocode__js">
                                                        У меня есть промокод
                                                    </div>
                                                    <div class="basket-form-info-promocode__input form-item">
                                                        <input type="text" class="form-input">
                                                        <div class="basket-form-info-promocode__btn apply default-anim"
                                                            v-anim-hover>
                                                            <svg width="26" height="20" viewBox="0 0 26 20" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M25 10H1M25 10L17 2M25 10L17 18"
                                                                    stroke="#1D1D1D" stroke-width="2"
                                                                    stroke-linecap="square" stroke-linejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="basket-form-info-promocode">
                                                    <div class="basket-form-info-promocode__label toogle-promocode__js">
                                                        У меня есть подарочная карта
                                                    </div>
                                                    <div class="basket-form-info-promocode__input form-item">
                                                        <input type="text" class="form-input">
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- <div class="basket-form-info-discount">
												<div class="basket-form-info-discount__label">Скидка по карте:</div>
												<div class="basket-form-info-discount__price">658 ₽</div>
											</div> -->
                                            <div class="basket-form-info-price">
                                                <div class="basket-form-info-price__label">Итого:</div>
                                                <div class="basket-form-info-price__value">
                                                    <span v-if="checkedTotalPrice">{{
                                                        numberWithSpaces(checkedTotalPrice) }}</span>
                                                    <span v-else>0</span>
                                                    ₽
                                                </div>
                                            </div>
                                            <div class="basket-form-info__btns">
                                                <div class="basket-form-info__btn btn form-btn default-anim bg-yellow"
                                                    v-anim-hover @click="formSubmit">
                                                    Перейти к оформлению
                                                </div>
                                                <!-- <div class="basket-form-info__btn default-anim btn-border">
													<input type="submit" class="" value="Оформить как юридическое лицо">
												</div> -->
                                            </div>
                                            <div class="basket-form-info__text">
                                                Окончательная стоимость, дата и возможность доставки подтверждается
                                                после
                                                обработки заказа.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </template>
        <section v-else class="">
            <div class="container">
                <h1>Корзина пуста</h1>
            </div>
        </section>
        <info-actions-form></info-actions-form>
        <div class="error-basket-popup popup">
            <div class="error-basket-popup__container popup__container">
                <div class="error-basket-popup__head popup__head">
                    <div class="error-basket-popup__title popup__title">Товары не&nbsp;выбраны</div>
                </div>
                <div class="error-basket-popup__content popup__content">
                    <div class="error-basket-popup__btns">
                        <div class="error-basket-popup__btn btn default-anim bg-yellow" @click="popUpCheckAll">
                            <span>Выбрать все
                                товары</span>
                        </div>
                        <div class="error-basket-popup__btn default-anim btn-border close-popup__js"><span>Выбрать
                                самостоятельно товары</span></div>
                    </div>
                </div>
                <div class="error-basket-popup__close popup__close close-popup__js default-anim">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped></style>