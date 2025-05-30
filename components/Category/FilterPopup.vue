<script>

export default {
    data() {
        return {
            price: null,
            priceMin: null,
            priceMax: null,
            priceValueMin: null,
            priceValueMax: null,
            filters: {},
            selectedFilters: [],
        }
    },
    inject: [
        'setUpdateFilter',
        'inStock',
        'setInstock',
    ],
    props: {
        categoryId: String,
        filterPopupUpdate: String,
    },
    methods: {
        submitForm() {
            this.selectedFilters = {};
            for (let key in this.filters) {
                let filter = this.filters[key];
                for (let value in filter.value) {
                    if (filter.value[value].isChecking) {
                        if (!this.selectedFilters[filter.name]) {
                            this.selectedFilters[filter.name] = [];
                        }
                        this.selectedFilters[filter.name].push(value);
                    }
                }
            }

            this.selectedFilters['price_max'] = this.$refs.priceToInput.value === '' ? Number(this.price.max) : Number(this.$refs.priceToInput.value.replace(/\s+/g, ''));
            this.selectedFilters['price_min'] = this.$refs.priceFromInput.value === '' ? Number(this.price.min) : Number(this.$refs.priceFromInput.value.replace(/\s+/g, ''));
            this.selectedFilters['in_stock'] = this.inStock;

            this.setUpdateFilter(this.selectedFilters);
            this.updateURL();
        },
        getCategoriesAttributes() {
            const { data } = useAPI('/catalog/categories-attributes/', {
                params: { categoryId: this.categoryId }
            })
            this.filters = data.value?.filters || null;
            this.price = data.value?.price || null;
            this.$nextTick(() => {
                this.dualRange();
            });

            const params = new URLSearchParams(window.location.search);
            let filtersURL = {};

            params.forEach((value, key) => {
                if (!filtersURL[key]) {
                    filtersURL[key] = [];
                }
                if (key === 'price_max' || key === 'price_min' || key === 'in_stock') {
                    filtersURL[key] = value;
                } else {
                    filtersURL[key].push(value);
                }
            });

            this.filtersFromUrl(this.filters, filtersURL);

            this.priceMin = filtersURL['price_min'] ? filtersURL['price_min'] : this.price['min'];
            this.priceMax = filtersURL['price_max'] ? filtersURL['price_max'] : this.price['max'];

        },
        updateURL() {
            const params = new URLSearchParams();

            for (let key in this.selectedFilters) {
                if (Array.isArray(this.selectedFilters[key])) {
                    this.selectedFilters[key].forEach(value => params.append(key, value));
                } else {
                    params.append(key, this.selectedFilters[key]);
                }
            }
            const newURL = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({}, '', newURL);
        },
        dualRange() {
            const $dualRange = document.querySelectorAll('.dual-range');
            if ($dualRange.length) {
                $dualRange.forEach(($item, indx) => {
                    const $range = noUiSlider.create($item, {
                        start: [Number($item.getAttribute('data-min')), Number($item.getAttribute('data-max'))],
                        connect: true,
                        range: {
                            'min': Number($item.getAttribute('data-min')),
                            'max': Number($item.getAttribute('data-max'))
                        },
                        step: Number($item.getAttribute('data-step')),
                    });


                    $range.on('slide', (values, handle) => {
                        let num = values[handle];
                        if (handle) {
                            this.priceValueMax = +num;
                        } else {
                            this.priceValueMin = +num;
                        }
                    });

                    $item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].addEventListener('change', (e) => {
                        e.target.value = e.target.value.replace(/[^\d]/g, '');
                        let str = e.target.value;
                        this.priceValueMin = numberWithSpaces(e.target.value);
                        $range.set([Number(str), null]);

                    });
                    $item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].addEventListener('change', (e) => {
                        e.target.value = e.target.value.replace(/[^\d]/g, '');
                        let str = e.target.value;
                        this.priceValueMax = numberWithSpaces(e.target.value);

                        $range.set([null, Number(str)]);
                    });

                    if ($item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].value === '0') {
                        $item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].value = '';
                    } else {
                        let str = $item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].value;
                        if (str) {
                            $item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].value = numberWithSpaces(Number($item.closest('.block-range').querySelectorAll('.input-range-val__js')[0].value));
                        }
                        $range.set([Number(str), null]);
                    }

                    if ($item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value === '0') {
                        $item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value = '';
                    } else if ($item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value === '') {
                        $range.set([null, Number($item.getAttribute('data-max'))]);
                    } else {
                        let str = $item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value;
                        $item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value = numberWithSpaces(Number($item.closest('.block-range').querySelectorAll('.input-range-val__js')[1].value));
                        $range.set([null, Number(str)]);
                    }
                });
            }
        },
        filtersFromUrl(filters, urlsAttrs) {
            for (let key in filters) {
                for (let attr in urlsAttrs) {
                    if (filters[key].name == attr) {
                        for (let value in urlsAttrs[attr]) {
                            filters[key].value[urlsAttrs[attr][value]]['isChecking'] = true;
                        }
                    }
                }
            }
        },
        reset() {
            const urlWithoutParams = window.location.origin + window.location.pathname;
            window.history.replaceState(null, '', urlWithoutParams);

            window.location.reload();
        },
    },
    mounted() {
        // не работает api запрос
        // this.getCategoriesAttributes();
    },
    watch: {
        filterPopupUpdate: {
            handler(val, oldVal) {
                if (val.startsWith('Цена товара от')) {
                    this.priceValueMin = this.price.min;
                    this.priceMin = this.price.min;
                    this.priceValueMax = this.price.max;
                    this.priceMax = this.price.max;
                    this.submitForm();
                } else if (val === 'all') {
                    Object.keys(this.filters).forEach(key => {
                        const filter = this.filters[key];
                        Object.keys(filter.value).forEach(valueKey => {
                            filter.value[valueKey].isChecking = false;
                        });
                    });
                } else {
                    Object.keys(this.filters).forEach(key => {
                        const filter = this.filters[key];
                        if (filter.name === val) {
                            Object.keys(filter.value).forEach(valueKey => {
                                filter.value[valueKey].isChecking = false;
                            });
                        }
                    });
                }
            },
            deep: true,
        },
    }

}
</script>

<template>
    <div class="popup-filters popup">
        <div class="popup-filters__container popup__container w426 left h100vh">
            <div class="popup-filters__body popup__body">
                <div class="popup-filters__head popup__head">
                    <div class="popup-filters__title popup__title">Фильтры</div>
                </div>
                <div class="popup-filters__content popup__content scroll border-top">
                    <form class="popup-filters-form">
                        <div :class="['popup-filters-form__instock', 'swith-btn', 'form-item', 'form-checkboxes__js',
                            { '_checked': inStock }]">
                            <input type="checkbox" name="" v-model="inStock" @change="setInstock" id="instock1"
                                class="form-checkbox" ref="priceFromInStock">
                            <label for="instock1">В наличии</label>
                        </div>

                        <div v-if="price" class="popup-filters-form-block price">
                            <div class="popup-filters-form-block__name">Цена, в рублях</div>
                            <div class="popup-filters-form-block__value block-range">
                                <div class="popup-filters-form-block__value block-range">
                                    <div class="popup-filters-form-block__row">
                                        <div class="popup-filters-form-block__from">
                                            <div class="popup-filters-form-block__input">
                                                <input type="text" maxlength="7" inputmode="numeric"
                                                    class="form-input filters-input input-range-val__js price-from"
                                                    ref="priceFromInput" :value="priceValueMin"
                                                    :placeholder="priceMin" />
                                            </div>
                                        </div>
                                        <div class="skin">-</div>
                                        <div class="popup-filters-form-block__to">
                                            <div class="popup-filters-form-block__input">
                                                <input type="text" maxlength="7" inputmode="numeric"
                                                    class="form-input filters-input input-range-val__js price-to"
                                                    ref="priceToInput" :value="priceValueMax" :placeholder="priceMax" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="dual-range" :data-min="price.min" :data-max="price.max" data-step="1">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-for="(filter, key) in filters" :key="key" class="popup-filters-form-block">
                            <div class="popup-filters-form-block__name">{{ filter.name }}</div>
                            <div class="popup-filters-form-block__value">
                                <div class="popup-filters-form__checkboxes form-checkboxes form-checkboxes__js">
                                    <div v-for="(attributeCount, value) in filter.value" :key="value" class="form-item"
                                        :class="{ '_checked': attributeCount.isChecking }">
                                        <input type="checkbox" :name="filter.slug" :id="`${filter.slug}-${value}`"
                                            class="form-checkbox instock__js" v-model="attributeCount.isChecking"
                                            :value="value">
                                        <label :for="`${filter.slug}-${value}`" class="form-check-label">{{ value
                                        }}</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="popup-filters-form__last-row">
                            <div class="popup-filters-form__btns close-popup__js">
                                <button @click.prevent="submitForm" type="submit"
                                    class="popup-filters-form__btn form-btn btn default-anim bg-yellow" v-anim-hover>
                                    Применить
                                </button>
                                <a @click="reset" class="popup-filters-form__btn btn-border default-anim" v-anim-hover>
                                    Сбросить
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
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

<style scoped></style>
