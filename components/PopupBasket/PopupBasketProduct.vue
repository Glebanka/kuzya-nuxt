<script>
import { mapActions, mapState } from 'pinia';

export default {
    props: {
        item: Object,
        index: Number,
    },
    data() {
        return {
            checkedInput: false,
            isRemovedFromBasket: false,
            productCount: null,
            productsFromBasket: null,
        }
    },
    computed: {
        ...mapState(useCartStore, {
            findInCart: 'getItemById'
        }),
        itemQuantity() {
            const item = this.findInCart(this.item.id);
            if (item) {
                return item.quantity
            } else {
                return null
            }
        },
        isAvailable() {
			return this.findInCart(this.item.id).status;
		},
    },
    methods: {
        ...mapActions(useCartStore, [
            'addToCart',
            'decreaseQuantity',
            'removeFromCart',
        ]),
        minusOneProduct() {
            const isLastItem = this.itemQuantity <= 1;
            if (!isLastItem) {
                this.decreaseQuantity(this.item)
            } else {
                this.removeFromCart(this.item)
            }
        },
        plusOneProduct() {
            this.addToCart(this.item)
        },
        init() {
            this.parsedImg = this.item.json_imgs;
        },
        addEventListenerToImg() {
            if (this.$refs.imgBlock) {
                this.$refs.imgBlock.addEventListener('error', () => {
                    this.item.json_imgs = null;
                });
            }
        },
    },
    mounted() {
        this.init();
    },
    watch: {
        parsedImg() {
            this.$nextTick(() => {
                this.addEventListenerToImg();
            });
        },
    },
}
</script>
<template>
    <div class="popup-basket-product" :class="{_unavailable: !isAvailable}">
        <div class="popup-basket-product__body card-product__body">
            <router-link :to="'/products/' + item.url_page + '/'"></router-link>
            <div class="popup-basket-product__block card-product__block">
                <div class="popup-basket-product__img card-product__img">
                    <template v-if="item.json_imgs">
                        <picture>
                            <img ref="imgBlock" :src="item.json_imgs" alt="">
                        </picture>
                    </template>
                    <template v-else>
                        <picture>
                            <img src="~/assets/img/empty-img.png" alt="empty-img">
                        </picture>
                    </template>
                </div>
            </div>
            <div class="popup-basket-product__block card-product__block">
                <div class="popup-basket-product__info card-product__info">
                    <div class="popup-basket-product__name card-product__name">{{ item.title }}</div>
                    <div class="popup-basket-product__acticle card-product__article" v-if="item.code">Арт.: {{ item.code
                    }}</div>
                    <div class="popup-basket-product-price card-product-price">
                        <div class="popup-basket-product-price__row card-product-price__row">
                            <div class="popup-basket-product-price__value card-product-price__value new">{{
                                numberWithSpaces(item.price) }} ₽<template v-if="item.unit">/{{ item.unit }}</template>
                            </div>
                            <!-- <div class="popup-basket-product-price__value card-product-price__value old">{{ item.price.old }} ₽/шт</div> -->
                        </div>
                        <div class="popup-basket-product-price__info card-product-price__info hidden">Экономия по карте
                            лояльности
                        </div>
                    </div>
                </div>
                <div class="popup-basket-product__last-row card-product__last-row">
                    <div class="popup-basket-product__btns card-product__btns">
                        <div class="popup-basket-product__quantity card-product__quantity quantity quantity__js">
                            <div class="quantity__btn minus" @click="minusOneProduct">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.5 10.8V9H14.78V10.8H4.5Z" fill="#1D1D1D" />
                                </svg>
                            </div>
                            <div class="quantity__label">
                                <span>{{ itemQuantity }}</span> шт.
                            </div>
                            <div class="quantity__btn plus" @click="plusOneProduct">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.1 18.56V2H10.9V18.56H9.1ZM1.5 11.16V9.44H18.5V11.16H1.5Z"
                                        fill="#1D1D1D" />
                                </svg>
                            </div>
                        </div>
                        <div
                            class="popup-basket-product__btn restore restore-basket-product__js btn-border default-anim">
                            <span>Востановить</span>
                        </div>
                    </div>
                    <!-- <div class="card-product__icons">
						<div class="card-product__icon product-add-favorite__js">
							<svg class="favorite" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381Z" fill="transparent"/>
								<path d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381ZM21.9645 7.19831C20.2145 5.44598 17.3912 5.37481 15.5595 7.01981L14.002 8.41748L12.4433 7.02098C10.6058 5.37364 7.78835 5.44598 6.03368 7.20064C4.29535 8.93898 4.20785 11.7215 5.80968 13.5601L13.9997 21.763L22.1897 13.5613C23.7927 11.7215 23.7052 8.94248 21.9645 7.19831Z" fill="#1d1d1d"/>
							</svg>
						</div>
						<div class="card-product__icon product-compare__js">
							<svg class="comparisons" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10.4997 25.6663C15.01 25.6663 18.6663 22.01 18.6663 17.4997C18.6663 12.9893 15.01 9.33301 10.4997 9.33301C5.98935 9.33301 2.33301 12.9893 2.33301 17.4997C2.33301 22.01 5.98935 25.6663 10.4997 25.6663Z" fill="transparent"/>
								<circle class="circle-1" cx="18.0833" cy="9.91634" r="7.58333" fill="transparent"/>
								<circle cx="10.5" cy="17.5" r="7.5" fill="transparent"/>
								<path class="border" d="M18.5937 18.5937C22.5867 18.0591 25.6663 14.639 25.6663 10.4997C25.6663 5.98935 22.01 2.33301 17.4997 2.33301C13.3603 2.33301 9.94025 5.41262 9.40565 9.40566M18.6663 17.4997C18.6663 22.01 15.01 25.6663 10.4997 25.6663C5.98935 25.6663 2.33301 22.01 2.33301 17.4997C2.33301 12.9893 5.98935 9.33301 10.4997 9.33301C15.01 9.33301 18.6663 12.9893 18.6663 17.4997Z" stroke="#1D1D1D" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div> -->
                </div>
            </div>
            <div class="popup-basket-product__remove" @click="removeFromCart(this.item)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"
                        stroke="#8C8C8C" stroke-width="2" stroke-linecap="square" stroke-linejoin="round" />
                </svg>
            </div>
        </div>
    </div>
</template>

<style></style>
