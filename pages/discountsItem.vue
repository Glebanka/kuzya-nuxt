<script>
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
</script>

<script setup>
const route = useRoute();
const { data: discountData } = await useGetData(route.path, {
    key: `${route.path}-data`,
})
const discount = ref(discountData.value?.discount || null);
const otherDiscounts = ref(discountData.value?.otherDiscounts || null);
const breadcrumbs = ref([{ ['Акции и скидки']: '/discounts' }, { [discount.value.breadcrumbs]: `/discounts/${discount.value.url_page}` }]);

onMounted(() => {
    runNativeJs();
});

function runNativeJs() {
    const sliders = selectElements('.slider-actions__slider');

    if (sliders.length) {
        sliders.forEach(($slider, indx) => {
            const swiper = new Swiper($slider, {
                modules: [Navigation, Pagination, Scrollbar],
                slidesPerView: 'auto', 
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
        });
    }
}
</script>

<template>
    <main class="main">
        <template v-if="discount">
            <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
            <section class="current-action">
                <div class="current-action__container container">
                    <div class="current-action__block anim-item" v-anim-scroll>
                        <div class="current-action__block-body">
                            <div class="current-action__img">
                                <picture>
                                    <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/${discount.image}`" :alt="discount.image_alt">
                                </picture>
                            </div>
                        </div>
                    </div>
                    <div class="current-action__block anim-item" v-anim-scroll>
                        <div class="current-action__block-body">
                            <div class="current-action__text">
                                <h1>{{ discount.headline }}</h1>
                                <div v-html="discount.content"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="slider-actions slider-width-full">
                <div class="slider-actions__container grey-container">
                    <div class="slider-actions__block anim-item" v-anim-scroll>
                        <h2 class="slider-actions__title">Другие акции</h2>
                        <div class="slider-actions__slider _swiper">
                            <div class="slider-actions__wrapper swiper-wrapper">
                                <div v-for="disc in otherDiscounts" class="swiper-slide slider-actions-item">
                                    <a :href="'/discounts/'+disc.url_page" class="slider-actions-item__body">
                                        <picture>
                                            <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/${disc.image}`" :alt="disc.image_alt">
                                        </picture>
                                    </a>
                                </div>
                            </div>
                            <div
                                class="slider-actions__scrollbar swiper-scrollbar slider-scrollbar slider-scrollbar__js">
                            </div>
                        </div>
                    </div>
                    <div class="slider-actions__arrows slider-arrows">
                        <div class="slider-actions__arrow slider-arrow slider-arrow__js default-anim left" v-anim-hover>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                    stroke-linejoin="round"></path>
                            </svg>
                        </div>
                        <div class="slider-actions__arrow slider-arrow slider-arrow__js default-anim right"
                            v-anim-hover>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                    stroke-linejoin="round"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>
            <info-actions-form></info-actions-form>
        </template>
    </main>
</template>

<style scoped></style>
