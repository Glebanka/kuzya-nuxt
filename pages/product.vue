<script>
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { mapActions, mapState } from 'pinia';

export default {
    data() {
        return {
            inCart: false,
            isFavorite: false,
            isCompare: false,
            parseProduct: null,
            countHistoryProducts: 10,
            lightbox: {},
            gallery: {},
            swiper: {},
        }
    },
    async setup() {
        const configs = inject('configs')

        const route = useRoute()

        const { data } = await useGetData(`${route.path}`, {
            key: `product-${route.path}-data`
        });


        const breadcrumbs = ref(data.value?.breadcrumbs || []);
        const product = ref(data.value?.data || []);
        const imgs = ref(data.value?.data.json_imgs || []);
        const characteristics = ref(data.value?.data.properties || []);
        const description = ref(data.value?.data.content || null);


        const serverData = reactive({
            data: data.value.data,
            meta: configs.value,
        });

        useSeoMeta(useMetaTags(serverData));

        let GLightbox;
        if (import.meta.client) {
            GLightbox = (await import('glightbox')).default;
        }

        return {
            characteristics,
            description,
            product,
            breadcrumbs,
            imgs,
            data,
            configs,
            GLightbox
        }
    },
    methods: {
        payWithInstallment() {
            this.uncheckAllItems()

            const existingItem = this.findInCart(this.product.id);
            if (!existingItem) {
                this.addToCart(this.parseProduct)
            }

            const product = this.findInCart(this.product.id)
            this.checkItem(product)

            this.$router.push('/order/?installment=true')
        },
        async galleryInit() {
            if (this.imgs) {
                this.lightbox = this.GLightbox({
                    touchNavigation: true,
                });

                let galleryElements = this.imgs.map((img) => ({ 'href': img }))

                this.gallery = this.GLightbox({
                    elements: galleryElements,
                });

                this.gallery.on('close', () => {
                    this.closeGallery()
                })

                if (Object.keys(this.$route.query).length == 1) {
                    this.gallery.open()
                }
            }
        },
        closeGallery() {
            this.$router.push({ path: this.$route.href, query: {} })
        },
        openGallery() {
            this.$router.push({ path: this.$route.href, query: { gallery: 'open' } })
        },
        handleCartBtn() {
            if (!this.inCart) {
                this.addToCart(this.parseProduct)

                this.inCart = true;
            } else {
                this.removeFromCart(this.parseProduct)
            }
        },
        getParsePrice(price) {
            if (price) return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return price;
        },
        minusOneProduct() {
            const isLastItem = this.itemQuantity <= 1;
            if (!isLastItem) {
                this.decreaseQuantity(this.parseProduct)
            } else {
                this.removeFromCart(this.parseProduct)
            }
        },
        plusOneProduct() {
            this.addToCart(this.parseProduct)
        },
        init() {
            this.initCarouselProducts()
            this.galleryInit()
            this.$nextTick(() => {
                this.imgCheck()
            });

            this.parseProduct = {
                id: this.product.id,
                title: this.product.title,
                price: this.product.price,
                url_page: this.product.url_page,
                json_imgs: this.product.json_imgs && this.product.json_imgs.length ? this.product.json_imgs[0] : '',
                unit: this.product.unit ? this.product.unit : null,
                status: true,
            };
            let productInCart = this.findInCart(this.parseProduct.id)
            if (productInCart) {
                this.inCart = true;
                this.product.quantity = productInCart.quantity;
            } else {
                this.inCart = false;
            }

            setTimeout(() => {
                this.pageProduct();
            }, 50);
        },
        initCarouselProducts() {
            let parseProduct = {
                id: this.product.id,
                title: this.product.title,
                price: this.product.price,
                code: this.product.code,
                json_imgs: this.product.json_imgs && this.product.json_imgs.length ? this.product.json_imgs : null,
                url_page: this.product.url_page,
                unit: this.product.unit,
                status: true,
            }

            let latestProducts = JSON.parse(localStorage.getItem('recents')) || [];
            let latestArray = [...latestProducts];

            if (latestProducts !== null) {

                let findItem = latestProducts.find(item => {
                    return parseProduct.id === item;
                })
                if (findItem === undefined) {
                    if (latestArray.length >= this.countHistoryProducts) {
                        latestArray.splice(0, 1);
                    }
                    latestArray.push(parseProduct.id);
                    localStorage.setItem('recents', JSON.stringify(latestArray));
                }
            } else {
                latestArray.push(parseProduct);
                localStorage.setItem('recents', JSON.stringify(latestArray));
            }
        },
        pageProduct() {
            const { $body, isDesktop } = useVars();
            const slider = selectElement('.current-product__slider-body');
            if (slider) {
                this.swiper = new Swiper('.current-product__slider-body', {
                    modules: [Pagination],
                    // Optional parameters
                    /*direction: 'vertical',*/
                    // effect: 'fade',

                    // centeredSlides: true,
                    // allowTouchMove: true,
                    slidesPerView: 'auto', //кол-во слайдов для показа, может быть значение 'auto'
                    spaceBetween: 0,
                    pagination: { //обычные буллеты
                        el: slider.querySelector('.slider-pagination__js'),
                        clickable: true,
                    },
                    // // Navigation arrows
                    // navigation: {
                    // 	nextEl: '.swiper-button-next',
                    // 	prevEl: '.swiper-button-prev',
                    // },
                });

                let slides = slider.querySelectorAll('.current-product-slide');
                this.swiper.on('slideChange', function (e) {
                    if (slides[e.realIndex].querySelector('video')) {
                        slides[e.realIndex].querySelector('video').play();
                    } else {
                        if (getSiblings(slides[e.realIndex]).all.length) {
                            getSiblings(slides[e.realIndex]).all.forEach(($item, indx) => {
                                if ($item.querySelector('video')) {
                                    $item.querySelector('video').pause();
                                }
                            });
                        }
                    }
                });
                const $previewSlider = selectElement('.current-product-previews__slider');
                if ($previewSlider && isDesktop.value) {
                    const swiperPrev = new Swiper('.current-product-previews__slider', {
                        modules: [Navigation],
                        // Optional parameters
                        direction: 'vertical',
                        loop: false,
                        // centeredSlides: true,
                        // allowTouchMove: false,

                        slidesPerView: 'auto',
                        navigation: {
                            nextEl: $previewSlider.parentElement.querySelector('.slider-arrow__js.bottom'),
                            prevEl: $previewSlider.parentElement.querySelector('.slider-arrow__js.top'),
                        },
                    });

                    $previewSlider.addEventListener('click', (e) => {
                        let $preview = e.target.closest('.click-product-preview__js');
                        if ($preview) {
                            let indx = getIndex($preview, $preview.parentElement.querySelectorAll('.click-product-preview__js'));
                            this.swiper.slideTo(indx);

                        }
                    });

                }
            }

            const $openAllCharacteristics = selectElement('.open-all-characteristics__js');
            const $popupCharacteristics = selectElement('.popup-all-characteristics');
            if ($openAllCharacteristics) {
                $openAllCharacteristics.addEventListener('click', (e) => {
                    $body.value.classList.add('_overflow');
                    $popupCharacteristics.classList.add('_active');
                });
            }
            const $openInstallmentPopup = selectElement('.open-installment-popup__js');
            const $popupInstallment = selectElement('.popup-installment');
            if ($openInstallmentPopup) {
                $openInstallmentPopup.addEventListener('click', () => {
                    $popupInstallment.classList.add('_active');
                    $body.value.classList.add('_overflow');
                });
            }

            const $nameProduct = selectElement('.current-product__name');
            const $fixedProduct = selectElement('.fixed-product');

            let scrollPos = 0;
            document.addEventListener('scroll', () => {
                let st = window.scrollY;

                if ($nameProduct) {
                    if (st > getCoords($nameProduct).top + $nameProduct.offsetHeight - 80) {
                        $fixedProduct.classList.add('_active');
                    } else {
                        $fixedProduct.classList.remove('_active');
                    }
                }
                // if ((st + (document.documentElement.clientHeight)) > getCoords($footer).top + document.documentElement.clientHeight - 200) {
                // 	$header.classList.remove('scroll');

                // }
                scrollPos = st;
            });
        },
        ...mapActions(useCartStore, [
            'addToCart',
            'removeFromCart',
            'decreaseQuantity',
            'updateCartProducts',
            'checkAllItems',
            'uncheckAllItems',
        ]),
        imgCheck() {
            let imgs = selectElements('.current-product-slide img');

            imgs.forEach((img, index) => {
                img.addEventListener('error', (e) => {
                    this.imgs[index] = null
                });
            });
        },

    },
    watch: {
        $route: {
            handler: function (newValue, oldValue) {
                if (newValue.query.gallery != oldValue.query.gallery) {
                    if (Object.keys(newValue.query).length == 1) {
                        this.gallery.openAt(this.swiper.activeIndex)
                    } else {
                        this.gallery.close()
                    }
                }
            },
            deep: true
        },
        isItemInCart(newValue, oldValue) {
            if ((newValue !== oldValue) && newValue == undefined) {
                this.inCart = false;
            }
        },
    },
    computed: {
        ...mapState(useCartStore, {
            findInCart: 'getItemById',
            cartTotalPrice: 'totalPrice'
        }),
        isItemInCart() {
            return this.findInCart(this.product.id);
        },
        itemQuantity() {
            const item = this.findInCart(this.product.id);
            if (item) {
                return item.quantity
            } else {
                return null
            }
        },
        isStocksLessThanCartQuantity() {
            return this.product.stock <= this.itemQuantity;
        }
    },
    mounted() {
        this.updateCartProducts();
        this.init()
    },
}
</script>
<template>
    <main class="main">
        <Breadcrumbs :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="current-product block-products">
            <div class="current-product__container container card-product__js" :class="{ '_basket': inCart }">
                <div class="current-product__block anim-item" v-anim-scroll>
                    <div class="current-product__block-body">
                        <div class="current-product__slider _swiper">
                            <div class="current-product-previews">
                                <template v-if="imgs && imgs.length > 1">
                                    <div class="current-product-previews__slider current-product-previews__list">
                                        <div class="current-product-previews__wrapper swiper-wrapper">
                                            <template v-for="(preview, indx) in imgs"
                                                :key="'preview-'+product.id+'-'+indx">
                                                <div
                                                    class="swiper-slide current-product-previews__item click-product-preview__js">
                                                    <picture v-if="preview === null">
                                                        <img src="~/assets/img/empty-img.png" alt="">
                                                    </picture>
                                                    <picture v-else>
                                                        <img :src="preview" alt="">
                                                    </picture>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    <div class="current-product-previews__arrows">
                                        <div
                                            class="current-product-previews__arrow previews-arrow__js slider-arrow slider-arrow__js top">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2"
                                                    stroke-linecap="square" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                        <div
                                            class="current-product-previews__arrow previews-arrow__js slider-arrow slider-arrow__js bottom">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2"
                                                    stroke-linecap="square" stroke-linejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <div class="current-product__slider-body gallery">
                                <div class="current-product__wrapper swiper-wrapper">
                                    <template v-if="imgs && imgs.length">
                                        <template v-for="(img, indx) in imgs" :key="'imgProduct-'+product.id+'-'+indx">
                                            <div class="swiper-slide current-product-slide">
                                                <a v-if="img" @click="openGallery">
                                                    <picture>
                                                        <img :src="img" alt="">
                                                    </picture>
                                                </a>
                                                <a v-else href="~/assets/img/empty-img.png">
                                                    <picture>
                                                        <img src="~/assets/img/empty-img.png">
                                                    </picture>
                                                </a>
                                            </div>
                                        </template>
                                    </template>
                                    <template v-else>
                                        <div class="swiper-slide current-product-slide">
                                            <picture>
                                                <img src="~/assets/img/empty-img.png">
                                            </picture>
                                        </div>
                                    </template>
                                </div>
                                <div class="current-product__slider-pagination swiper-pagination slider-pagination slider-pagination__js"
                                    :class="{ 'hidden': imgs && imgs.length <= 1 }"></div>
                            </div>
                            <div v-if="imgs && imgs.length" class="current-product__fullscreen" @click="openGallery">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.0004 9.99958L21 3.00003M21 3.00003L15.8572 3M21 3.00003L20.9999 8.14263M10.0004 14L3.00044 21M3.00044 21L8.14326 21M3.00044 21L3.00051 15.8574M14.0004 14L21 20.9996M21 20.9996L21 15.8569M21 20.9996L15.8573 20.9995M10.0004 10.0004L3.00003 3.00003M3.00003 3.00003L3 8.14272M3.00003 3.00003L8.14275 3.0001"
                                        stroke="#8C8C8C" stroke-width="2" stroke-linecap="square"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <div class="current-product-text-info text-info">
                            <div class="current-product-text-info__icon text-info__icon">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="8.5" cy="8.5" r="8" stroke="#8C8C8C" />
                                    <path
                                        d="M8.93069 7.63636V12H8.06931V7.63636H8.93069ZM8.50495 6C8.63696 6 8.75248 6.03799 8.85149 6.11398C8.9505 6.18453 9 6.29851 9 6.4559C9 6.60787 8.9505 6.72185 8.85149 6.79783C8.75248 6.87381 8.63696 6.9118 8.50495 6.9118C8.36634 6.9118 8.24752 6.87381 8.14851 6.79783C8.0495 6.72185 8 6.60787 8 6.4559C8 6.29851 8.0495 6.18453 8.14851 6.11398C8.24752 6.03799 8.36634 6 8.50495 6Z"
                                        fill="#8C8C8C" />
                                </svg>
                            </div>
                            <div class="current-product-text-info__value text-info__value">
                                <p>Цены и наличие товаров на сайте и в магазинах могут различаться. Пожалуйста,
                                    уточняйте стоимость и наличие
                                    товаров в конкретном магазине. Информация о товарах на сайте обновляется и может
                                    быть неактуальна для таких
                                    же товаров, проданных ранее.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="current-product__block anim-item" v-anim-scroll>
                    <h1 class="current-product__name m-t-0" v-html="product.title"></h1>
                    <div class="current-product__row row-1 hidden">
                        <div class="current-product-raiting">
                            <div class="current-product-raiting__stars" style="--raiting: 4.5;"></div>
                            <div class="current-product-raiting__count">4.8</div>
                        </div>
                        <div class="current-product__reviews">
                            <a href="#">5 отзывов</a>
                        </div>
                        <div class="current-product__labels card-product__labels">
                            <div class="card-product__label" style="background-color: #ED1E24; color: #fff;">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.1957 9.72809C10.0831 10.4598 9.45348 11 8.71312 11H2C1.44772 11 1 10.5523 1 10V6.5C1 5.94772 1.44772 5.5 2 5.5H3.17506C3.37266 5.5 3.55172 5.38363 3.63197 5.20307L5.39153 1.24406C5.45749 1.09565 5.60467 1 5.76708 1C6.448 1 7 1.552 7 2.23292V4C7 4.27614 7.22386 4.5 7.5 4.5H9.25158C10.1709 4.5 10.8739 5.31945 10.7341 6.22809L10.1957 9.72809Z"
                                        fill="white" />
                                    <path
                                        d="M3.5 11V5.5M1 6.5V10C1 10.5523 1.44772 11 2 11H8.71312C9.45348 11 10.0831 10.4598 10.1957 9.72809L10.7341 6.22809C10.8739 5.31945 10.1709 4.5 9.25158 4.5H7.5C7.22386 4.5 7 4.27614 7 4V2.23292C7 1.552 6.448 1 5.76708 1C5.60467 1 5.45749 1.09565 5.39153 1.24406L3.63197 5.20307C3.55172 5.38363 3.37266 5.5 3.17506 5.5H2C1.44772 5.5 1 5.94772 1 6.5Z"
                                        stroke="white" stroke-width="0.7" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span>Хит продаж</span>
                            </div>
                        </div>
                        <div class="current-product-share">
                            <div class="current-product-share__btn share-btn open-share-popup__js "
                                data-title="Поделиться" data-link="http://kuzya.loc/">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z"
                                        stroke="#1D1D1D" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                Поделиться
                            </div>
                        </div>
                    </div>
                    <div class="current-product__row row-2">
                        <div class="current-product-price card-product-price">
                            <div class="current-product-price__row card-product-price__row">
                                <div class="current-product-price__value card-product-price__value new">{{
                                    getParsePrice(product.price)
                                }} ₽/{{ product.unit }}</div>
                                <div class="current-product-price__value card-product-price__value old hidden">609 ₽/шт
                                </div>
                            </div>
                            <div class="current-product-price__info card-product-price__info hidden">Цена по карте
                                лояльности</div>
                        </div>
                        <template v-if="product.stock != undefined">
                            <div v-if="product.stock > 0"
                                class="current-product__instock current-product__instock--green">В наличии</div>
                            <div v-else class="current-product__instock current-product__instock--red">Не в наличии
                            </div>
                        </template>
                    </div>
                    <div class="current-product__row row-3">
                        <div class="current-product__characteristics">
                            <ul class="list-style-none">
                                <li class="current-product__characteristic">
                                    Артикул: <span>{{ product.code }}</span>
                                </li>
                                <li class="current-product__characteristic hidden">
                                    Гарантия: <span>12 месяцев</span>
                                </li>
                                <li class="current-product__characteristic" v-if="product.brand">
                                    Бренд: <span>{{ product.brand }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="current-product__last-row card-product__last-row">
                        <div v-if="product.stock > 0" class="current-product__btns card-product__btns">
                            <div class="current-product__quantity card-product__quantity quantity quantity__js">
                                <div class="quantity__btn minus" @click="minusOneProduct">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.5 10.8V9H14.78V10.8H4.5Z" fill="#1D1D1D" />
                                    </svg>
                                </div>
                                <div class="quantity__label">
                                    <span>{{ itemQuantity }}</span> шт.
                                </div>
                                <div class="quantity__btn plus"
                                @click="plusOneProduct"
                                :class="{ disabled: isStocksLessThanCartQuantity }">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.1 18.56V2H10.9V18.56H9.1ZM1.5 11.16V9.44H18.5V11.16H1.5Z"
                                            fill="#1D1D1D" />
                                    </svg>
                                </div>
                            </div>
                            <div class="current-product__btn card-product__btn btn btn-basket default-anim bg-yellow add-product-basket__js"
                                v-anim-hover @click="handleCartBtn">
                                <div class="default">В корзину</div>
                                <div class="ques ques-add">Добавить?</div>
                                <div class="ques ques-remove">Удалить?</div>
                                <div class="added">
                                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9.83301 15.8375C11.0883 16.7504 13.5988 19.2609 14.6258 20.9726C15.8811 18.2339 19.0763 12.0717 22.4997 9.33301"
                                            stroke="white" stroke-width="2" stroke-linecap="square"
                                            stroke-linejoin="round" />
                                    </svg>
                                    <span>В корзине</span>
                                </div>
                            </div>

                        </div>
                        <div class="current-product__icons card-product__icons hidden">
                            <div class="current-product__icon card-product__icon product-add-favorite__js">
                                <svg class="favorite" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381Z"
                                        fill="transparent" />
                                    <path
                                        d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381ZM21.9645 7.19831C20.2145 5.44598 17.3912 5.37481 15.5595 7.01981L14.002 8.41748L12.4433 7.02098C10.6058 5.37364 7.78835 5.44598 6.03368 7.20064C4.29535 8.93898 4.20785 11.7215 5.80968 13.5601L13.9997 21.763L22.1897 13.5613C23.7927 11.7215 23.7052 8.94248 21.9645 7.19831Z"
                                        fill="#1d1d1d" />
                                </svg>
                            </div>
                            <div class="current-product__icon card-product__icon product-compare__js">
                                <svg class="comparisons" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M10.4997 25.6663C15.01 25.6663 18.6663 22.01 18.6663 17.4997C18.6663 12.9893 15.01 9.33301 10.4997 9.33301C5.98935 9.33301 2.33301 12.9893 2.33301 17.4997C2.33301 22.01 5.98935 25.6663 10.4997 25.6663Z"
                                        fill="transparent" />
                                    <circle class="circle-1" cx="18.0833" cy="9.91634" r="7.58333" fill="transparent" />
                                    <circle cx="10.5" cy="17.5" r="7.5" fill="transparent" />
                                    <path class="border"
                                        d="M18.5937 18.5937C22.5867 18.0591 25.6663 14.639 25.6663 10.4997C25.6663 5.98935 22.01 2.33301 17.4997 2.33301C13.3603 2.33301 9.94025 5.41262 9.40565 9.40566M18.6663 17.4997C18.6663 22.01 15.01 25.6663 10.4997 25.6663C5.98935 25.6663 2.33301 22.01 2.33301 17.4997C2.33301 12.9893 5.98935 9.33301 10.4997 9.33301C15.01 9.33301 18.6663 12.9893 18.6663 17.4997Z"
                                        stroke="#1D1D1D" stroke-width="2.3" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <template v-if="product.price && product.price > 3000 && product.price < 50000">
                        <BnplWidget :key="product.id" :price="product.price"></BnplWidget>

                        <button class="bnpl-link-btn btn btn-small default-anim bg-yellow" v-anim-hover
                            @click="payWithInstallment()">Разбить на части</button>
                    </template>

                    <ProductPageInfoHidden></ProductPageInfoHidden>

                    <div class="current-product__all-characteristics"
                        :class="{ 'hidden': characteristics.length === 0 }">
                        <span class="open-all-characteristics__js">Характеристики</span>
                    </div>
                    <div class="current-product__description" :class="{ 'hidden': !description }">
                        <span class="open-popup-description__js">Описание</span>
                    </div>
                </div>
                <div class="fixed-product">
                    <div class="fixed-product__container container">
                        <div class="fixed-product__block block-1">
                            <div class="fixed-product__name" v-html="product.title"></div>
                        </div>
                        <div class="fixed-product__block block-2">
                            <div class="fixed-product-price card-product-price">
                                <div class="fixed-product-price__row card-product-price__row">
                                    <div class="fixed-product-price__value card-product-price__value new">{{
                                        getParsePrice(product.price) }} ₽/шт</div>
                                    <div class="fixed-product-price__value card-product-price__value old hidden">609
                                        ₽/шт</div>
                                </div>
                                <div class="fixed-product-price__info card-product-price__info hidden">Цена по карте
                                    лояльности:</div>
                            </div>
                            <div v-if="product.stock > 0" class="fixed-product__btn card-product__btn btn btn-basket default-anim bg-yellow"
                                v-anim-hover @click="handleCartBtn">
                                <div class="default">В корзину</div>
                                <div class="ques ques-add">Добавить?</div>
                                <div class="ques ques-remove">Удалить?</div>
                                <div class="added">
                                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9.83301 15.8375C11.0883 16.7504 13.5988 19.2609 14.6258 20.9726C15.8811 18.2339 19.0763 12.0717 22.4997 9.33301"
                                            stroke="white" stroke-width="2" stroke-linecap="square"
                                            stroke-linejoin="round" />
                                    </svg>
                                    <span>В корзине</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="current-about-product">
            <div class="current-about-product__container grey-container">
                <div class="current-about-product__tabs tabs" v-tabs>
                    <div class="current-about-product__tab-head tab-head">
                        <div class="">
                            <div
                                class="current-about-product__tab-item tab-item default-tab-item click-tab-item__js _active">
                                Доставка
                            </div>
                        </div>
                        <div class="">
                            <div class="current-about-product__tab-item tab-item default-tab-item click-tab-item__js">
                                Оплата
                            </div>
                        </div>
                    </div>
                    <div class="">
                        <div class="tab-body anim-item" v-anim-scroll>
                            <div class="tab-item-block _active">
                                <div class="tab-item-block__body">
                                    <div class="current-about-product__content"
                                        v-html="configs['PRODUCT_INFO_DELIVERY']"></div>
                                </div>
                            </div>
                            <div class="tab-item-block">
                                <div class="tab-item-block__body">
                                    <div class="current-about-product__content" v-html="configs['PRODUCT_INFO_PAY']">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- привязываем key к route чтобы при изменении url компонент заново монтировался -->
        <CarouselProductHistory :key="$route.path"></CarouselProductHistory>
        <info-actions-form></info-actions-form>
    </main>

    <PopupAllCharacteristics :characteristics="characteristics"></PopupAllCharacteristics>

    <PopupDescription>
        <div v-html="description"></div>
    </PopupDescription>

    <PopupInstallment></PopupInstallment>
</template>
<style scoped>
.bnpl-link-btn {
    margin: 2rem 0 6rem;
}
</style>