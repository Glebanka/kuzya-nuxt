<script>
export default {
    data() {
        return {
            attributes: [],
            price: [],
            selectedFilters: [],
            dataProducts: {},
        }
    },
    props: {
        productsCount: Number,
    },
    inject: [
        'inStock',
        'setInstock',
        'updateFilter',
        'setUpdateFilter',
        'setEnableInstock',
        'setDesableInstock',
    ],
    methods: {
        init() {
            function catalogPage() {
                function allFilters() {
                    const $gridIcons = selectElements('.toggle-grid__js');
                    if ($gridIcons.length) {
                        const list = selectElement('.list-products__js');
                        $gridIcons.forEach(($icon, indx) => {
                            $icon.addEventListener('click', (e) => {
                                $icon.classList.add('_active');
                                siblingsClass($icon, { remove: '_active' });
                                if (+$icon.getAttribute('data-grid-col') === 2) {
                                    list.classList.remove('g-4');
                                    list.classList.add('g-2');
                                } else {
                                    list.classList.remove('g-2');
                                    list.classList.add('g-4');
                                }

                            });

                        });
                    }

                    const $openAllFilters = selectElement('.open-all-filters__js');
                    const { $body } = useVars();                    
                    if ($openAllFilters) {
                        $openAllFilters.addEventListener('click', (e) => {
                            $body.value.classList.add('_overflow');
                            if (selectElement('.popup-filters')) {
                                selectElement('.popup-filters').classList.add('_active')
                            }
                        });
                    }

                    const $characteristicSlider = selectElement('.categories-characteristics__slider-body');
                    if ($characteristicSlider) {
                        const swiper = new Swiper($characteristicSlider, {
                            modules: [Navigation, Pagination, Scrollbar],
                            // Optional parameters
                            /*direction: 'vertical',*/
                            loop: false,
                            centeredSlides: false,
                            // allowTouchMove: false,
                            slidesPerView: 'auto', //кол-во слайдов для показа, может быть значение 'auto'
                            spaceBetween: 0,
                            // Navigation arrows
                            navigation: {
                                nextEl: $characteristicSlider.closest('section').querySelector('.slider-arrow__js.right'),
                                prevEl: $characteristicSlider.closest('section').querySelector('.slider-arrow__js.left'),
                            },
                            scrollbar: {
                                el: $characteristicSlider.closest('section').querySelector('.slider-scrollbar__js'),
                                draggable: true,
                            },
                        });
                    }


                    const $instockProducts = selectElements('.instokFooter-products__js');
                    if ($instockProducts.length) {
                        $instockProducts.forEach(($item, indx) => {
                            $item.addEventListener('change', () => {
                                if ($item.checked) {
                                    changeInstock(true);
                                } else {
                                    changeInstock(false);
                                }
                            });
                        });

                        function changeInstock(isCheck) {
                            $instockProducts.forEach(($item, indx) => {
                                if (isCheck) {
                                    $item.parentElement.classList.add('_checked');
                                } else {
                                    $item.parentElement.classList.remove('_checked');
                                }
                            });
                        }
                    }

                    const $instockProductsFooter = selectElements('.instokFooter-products__js');
                    if ($instockProductsFooter.length) {
                        $instockProductsFooter.forEach(($item, indx) => {
                            $item.addEventListener('change', () => {
                                if ($item.checked) {
                                    changeInstockFooter(true);
                                } else {
                                    changeInstockFooter(false);
                                }
                            });
                        });
                        function changeInstockFooter(isCheck) {
                            $instockProductsFooter.forEach(($item, indx) => {
                                if (isCheck) {
                                    $item.parentElement.classList.add('_checked');
                                } else {
                                    $item.parentElement.classList.remove('_checked');
                                }
                            });
                        }
                    }
                }

                allFilters();
            }

            catalogPage();
        },
        getCorrectProductEnding(count) {
            const lastDigit = count % 10;
            const lastTwoDigits = count % 100;
            if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
                return 'товаров';
            }
            if (lastDigit === 1) {
                return 'товар';
            } else if (lastDigit >= 2 && lastDigit <= 4) {
                return 'товара';
            } else {
                return 'товаров';
            }
        },
        getAttr() {
            const params = new URLSearchParams(window.location.search);
            this.dataProducts = {};
            this.attributes = [];
            this.price = [];

            params.forEach((value, key) => {
                if (!this.attributes.includes(key)) {
                    if (key === 'price_max' || key === 'price_min') {
                        this.price[key] = value;
                    } else {
                        this.attributes.push(key);
                    }
                }
                //create dataProducts
                if (!this.dataProducts[key]) {
                    this.dataProducts[key] = [];
                }
                if (key === 'price_max' || key === 'price_min' || key === 'in_stock') {
                    this.dataProducts[key] = value;
                } else {
                    this.dataProducts[key].push(value);
                }
            });

            if (this.price['price_min'] && this.price['price_max']) {

                let attributePrice = `Цена товара от ${this.price['price_min']} - ${this.price['price_max']} ₽`;
                let index = this.attributes.findIndex(attr => attr.startsWith('Цена товара от'));

                if (index !== -1) {
                    this.attributes[index] = attributePrice;
                } else {
                    this.attributes.push(attributePrice);
                }
            }
        },
        removeFilter(e, attribute) {
            if (attribute.startsWith('Цена товара от')) {
                delete this.dataProducts['price_min'];
                delete this.dataProducts['price_max'];
                e.target.closest('.block-filters-item').remove();
            }
            delete this.dataProducts[attribute];
            this.setUpdateFilter(this.dataProducts);
            this.updateURL();
            this.init();
            this.$emit('changeFilterPopup', attribute);
        },
        removeFilterAll(e) {
            this.dataProducts = {};
            this.setUpdateFilter(this.dataProducts);
            this.updateURL();
            this.$emit('changeFilterPopup', 'all');
            if (e.target.closest('.block-filters__list').querySelectorAll('.block-filters-item').length) {
                e.target.closest('.block-filters__list').querySelectorAll('.block-filters-item').forEach(($item, indx) => {

                    $item.remove();
                })
            }
        },
        removeInStock() {
            this.setInstock();
            this.dataProducts['in_stock'] = this.inStock;
            this.setUpdateFilter(this.dataProducts);
            this.updateURL();
        },
        clickInStock() {
            this.dataProducts['in_stock'] = !this.inStock;
            this.setUpdateFilter(this.dataProducts);
            this.updateURL();
            // this.setInstock();
            if (this.dataProducts['in_stock'] === 'false') {
                this.setDesableInstock();
            }
            if (this.dataProducts['in_stock'] === 'true') {
                this.setEnableInstock();
            }
        },
        updateURL() {
            const params = new URLSearchParams();

            for (let key in this.dataProducts) {
                if (Array.isArray(this.dataProducts[key])) {
                    this.dataProducts[key].forEach(value => params.append(key, value));
                } else {
                    params.append(key, this.dataProducts[key]);
                }
            }
            const newURL = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', newURL);
        },
    },
    mounted() {
        this.init();
        this.getAttr();
    },
    watch: {
        updateFilter: {
            handler(val, oldVal) {
                this.getAttr();
            },
            deep: true,
        },
        'dataProducts.in_stock'(val) {
            if (this.dataProducts['in_stock'] === 'true') {
                this.setEnableInstock();
            }
            if (this.dataProducts['in_stock'] === 'false') {
                this.setDesableInstock();
            }

        },
        attributes: {
            handler(val, oldVal) {
                this.filteredAttributes = this.attributes;
            },
            deep: true,
        }
    },
    computed: {
        filteredAttributes() {
            return this.attributes.filter(attribute => attribute !== 'in_stock');
        }
    },
}
</script>

<template>
    <section v-if="dataProducts" class="block-filters">
        <div class="block-filters__container container">
            <div class="block-filters__row">
                <div class="block-filters__block block-1">
                    <div class="block-filters__box">
                        <div class="block-filters__all btn-border default-anim open-all-filters__js" v-anim-hover>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 18H21M3 18H5M5 18C5 19.3807 6.11929 20.5 7.5 20.5C8.88071 20.5 10 19.3807
                                10 18C10 16.6193 8.88071 15.5 7.5 15.5C6.11929 15.5 5 16.6193 5 18ZM20 12H21M3 12H10M13
                                6H21M13 6C13 4.61929 11.8807 3.5 10.5 3.5C9.11929 3.5 8 4.61929 8 6C8 7.38071 9.11929
                                8.5 10.5 8.5C11.8807 8.5 13 7.38071 13 6ZM3 6H4M16.5 14.5C15.1193 14.5 14 13.3807 14
                                12C14 10.6193 15.1193 9.5 16.5 9.5C17.8807 9.5 19 10.6193 19 12C19 13.3807 17.8807 14.5
                                16.5 14.5Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                      stroke-linejoin="round" />
                            </svg>
                            Все фильтры
                        </div>

                        <div :class="['block-filters__instock', 'swith-btn', 'form-checkboxes__js',
                            { '_checked': inStock }]">
                            <input @click="clickInStock()" type="checkbox" name="" id="instock" v-model="inStock"
                                   :checked="dataProducts['in_stock']" class="form-checkbox ">
                            <label for="instock">В наличии</label>
                        </div>
                    </div>
                </div>
                <div class="block-filters__block block-2">
                    <div v-if="productsCount >= 0" class="block-filters__count-products">
                        {{ productsCount }} {{ getCorrectProductEnding(productsCount) }}
                    </div>
                    <div class="block-filters-grids">
                        <div class="block-filters-grids__item toggle-grid__js _active" data-grid-col="4">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 1C18.1046 1 19 1.88316 19 2.9726L19 6.33992C19 7.42936 18.1046 8.31252 17 8.31252H14C12.8954 8.31252 12 7.42936 12 6.33992L12 2.9726C12 1.88316 12.8954 1 14 1L17 1Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M3 1C1.89543 1 0.999999 1.88316 0.999999 2.9726L1.00001 6.33992C1.00001 7.42936 1.89544 8.31252 3.00001 8.31252H6.00001C7.10458 8.31252 8.00001 7.42936 8.00001 6.33992L8 2.9726C8 1.88316 7.10457 1 6 1L3 1Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M17 11.6875C18.1046 11.6875 19 12.5707 19 13.6601V17.0274C19 18.1168 18.1046 19 17 19H14C12.8954 19 12 18.1168 12 17.0274L12 13.6601C12 12.5707 12.8954 11.6875 14 11.6875H17Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M3.00001 11.6875C1.89544 11.6875 1.00001 12.5707 1.00001 13.6601L1.00001 17.0274C1.00001 18.1168 1.89544 19 3.00001 19H6.00001C7.10458 19 8.00001 18.1168 8.00001 17.0274L8.00001 13.6601C8.00001 12.5707 7.10458 11.6875 6.00001 11.6875H3.00001Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="block-filters-grids__item toggle-grid__js" data-grid-col="2">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 17C19 18.1046 18.1168 19 17.0274 19L2.9726 19C1.88316 19 1 18.1046 1 17L1 14C1 12.8954 1.88316 12 2.9726 12L17.0274 12C18.1168 12 19 12.8954 19 14V17Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19 3C19 1.89543 18.1168 1 17.0274 1L2.9726 1C1.88316 1 1 1.89543 1 3L1 6C1 7.10457 1.88316 8 2.9726 8H17.0274C18.1168 8 19 7.10457 19 6V3Z" stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="attributes" class="block-filters__list">
                <div v-if="inStock" class="block-filters-item">
                    <span>В наличии</span>
                    <div class="block-filters-item__remove" @click="removeInStock">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.99998 9.99998L6.00001 6.00001M6.00001 6.00001L2 2M6.00001 6.00001L10 2M6.00001 6.00001L2 10" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                <div v-for="(attribute, indx) in filteredAttributes" class="block-filters-item" :key="indx">
                    <span>{{ attribute }}</span>
                    <div class="block-filters-item__remove" @click="removeFilter($event, attribute)">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.99998 9.99998L6.00001 6.00001M6.00001 6.00001L2 2M6.00001 6.00001L10 2M6.00001 6.00001L2 10" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                <div v-if="filteredAttributes.length > 0" @click="removeFilterAll($event)" class="block-filters-item all">
                    <span>Очистить все</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>
