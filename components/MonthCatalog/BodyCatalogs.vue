<script>

export default {
    props: {
        catalogs: Array,
    },
}
</script>
<template>
    <div class="month-catalog-tab__container grey-container">
        <div class="month-catalog-tab__body tab-body anim-item" v-anim-scroll>
            <template v-for="(catalog, index) in catalogs" :key="'monthCatalog'+index">
                <div class="tab-item-block" :class="{ '_active': index === 0, }">
                    <div class="tab-item-block__body">
                        <div class="month-catalog__slider _swiper">
                            <div class="month-catalog__slider-body">
                                <div class="month-catalog__wrapper swiper-wrapper lightgallery">
                                    <template v-for="(img, indx) in catalog.imgs">
                                        <div class="swiper-slide month-catalog-slide"
                                            data-file="/storage/katalog-1.jpg">
                                            <a :href="'/storage/' + img">
                                                <picture>
                                                    <source :srcset="'/storage/' + catalog.imgs_mob[indx]"
                                                        media="(orientation: portrait)">
                                                    <img :src="'/storage/' + img" alt="">
                                                </picture>
                                            </a>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <div class="month-catalog__arrows slider-arrows" v-if="catalog.imgs.length > 1">
                                <div class="month-catalog__arrow default-anim slider-arrow slider-arrow__js left"
                                    v-anim-hover>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2"
                                            stroke-linecap="square" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="month-catalog__arrow default-anim slider-arrow slider-arrow__js right"
                                    v-anim-hover>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2"
                                            stroke-linecap="square" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="month-catalog__row">
                            <div class="month-catalog__icons">
                                <div class="month-catalog__icon click-fullscreen-catalog__js fullscreen">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14.0004 9.99958L21 3.00003M21 3.00003L15.8572 3M21 3.00003L20.9999 8.14263M10.0004 14L3.00044 21M3.00044 21L8.14326 21M3.00044 21L3.00051 15.8574M14.0004 14L21 20.9996M21 20.9996L21 15.8569M21 20.9996L15.8573 20.9995M10.0004 10.0004L3.00003 3.00003M3.00003 3.00003L3 8.14272M3.00003 3.00003L8.14275 3.0001"
                                            stroke="#8C8C8C" stroke-width="2" stroke-linecap="square"
                                            stroke-linejoin="round" />
                                    </svg>

                                </div>
                                <div class="month-catalog__icon click-download-catalog__js download">
                                    <a :href="catalog.link_pdf" download>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M4 15.2044L4 18.8925C4 19.4514 4.21071 19.9875 4.58579 20.3827C4.96086 20.778 5.46957 21 6 21H18C18.5304 21 19.0391 20.778 19.4142 20.3827C19.7893 19.9875 20 19.4514 20 18.8925V15.2044M12.0011 3V14.9425M12.0011 14.9425L16.5725 10.3793M12.0011 14.9425L7.42969 10.3793"
                                                stroke="#8C8C8C" stroke-width="2" stroke-linecap="square"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div class="month-catalog-counter" v-if="catalog.imgs.length > 1">
                                <div class="month-catalog-counter__arrow left">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2"
                                            stroke-linecap="square" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="month-catalog-counter__num">
                                    <span class="current">1</span>/<span class="total">{{ catalogs.length }}</span>
                                </div>
                                <div class="month-catalog-counter__arrow right">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2"
                                            stroke-linecap="square" stroke-linejoin="round" />
                                    </svg>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>


        </div>
    </div>
</template>
<style></style>