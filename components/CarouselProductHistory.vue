<script setup>
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

const products = ref([]);

onMounted(getProducts);

async function getProducts() {
    const latestProducts = JSON.parse(localStorage.getItem('recents')) || [];

    if(latestProducts.length){
        try {
            const response = await useNuxtApp().$apiFetch(`/productsGetter`, {
                params: { product_ids: JSON.stringify(latestProducts) }
            });
    
            products.value = response.data.products.map(product => ({
                ...product,
                title: product.headline,
                json_imgs: [product.img]
            })).reverse();
    
            nextTick(() => {
                initSlider();
            });
        } catch (err) {
            console.error('Ошибка загрузки продуктов:', err);
        }
    }

}

function initSlider() {
    const $slider = document.querySelector('.slider-history');

    if ($slider) {
        const swiper = new Swiper($slider, {
            modules: [Navigation, Pagination, Scrollbar],
            slidesPerView: 'auto',
            slidesPerGroup: 1,
            spaceBetween: 0,
            navigation: {
                nextEl: $slider.closest('section').querySelector('.slider-arrow__js.right'),
                prevEl: $slider.closest('section').querySelector('.slider-arrow__js.left'),
            },
            scrollbar: {
                el: $slider.closest('section').querySelector('.slider-scrollbar__js'),
                draggable: true,
            },
        });
    }
}
</script>
<template>
    <section v-if="products.length" class="slider-products block-products">
        <div class="slider-products__container container">
            <div class="slider-products__row j-content-between anim-item" v-anim-scroll>
                <h2 class="slider-products__title m-0">
                    Ранее просмотренные товары
                </h2>
                <div class="slider-products__arrows slider-arrows" :class="{ 'hidden': products.length <= 4 }">
                    <div class="slider-products__arrow slider-arrow slider-arrow__js default-anim left" v-anim-hover>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="slider-products__arrow slider-arrow slider-arrow__js default-anim right" v-anim-hover>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="slider-history _swiper anim-item" v-anim-scroll>
                <div class="slider-products__wrapper swiper-wrapper">
                    <CardProduct v-for="product in products" :key="'sliderProduct-' + product.id" :product="product"
                        class="swiper-slide slider-products-item"></CardProduct>
                </div>
                <div class="slider-products__scrollbar swiper-scrollbar slider-scrollbar slider-scrollbar__js"></div>
            </div>
        </div>
    </section>
</template>
