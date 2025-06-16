<script setup>
const { data: discountsData } = await useGetData('/discounts', {
    key: 'discounts-data',
})
const discounts = ref(discountsData.value?.discounts || null);
</script>

<template>
    <section class="slider-actions" v-if="discounts.length">
        <div class="slider-actions__container grey-container">
            <div class="slider-actions__block anim-item " v-anim-scroll>
                <h2 class="slider-actions__title m-0">Сезонные предложения</h2>
                <div class="slider-actions__text">
                    <p>
                        Экономьте на покупках, покупайте со&nbsp;скидкой! Будь в курсе всех акций
                        и&nbsp;скидок&nbsp;в&nbsp;твоём городе.
                    </p>
                </div>
                <div class="slider-actions__btns">
                    <router-link to="/discounts/" class="slider-actions__btn btn default-anim bg-yellow" v-anim-hover>Подробнее
                    </router-link>
                </div>
                <div class="slider-actions__arrows slider-arrows">
                    <div class="slider-actions__arrow slider-arrow slider-arrow__js default-anim left" v-anim-hover>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                  stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="slider-actions__arrow slider-arrow slider-arrow__js default-anim right" v-anim-hover>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                                  stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="slider-actions__block anim-item" v-anim-scroll>
                <div class="slider-actions__slider _swiper">
                    <div class="slider-actions__wrapper swiper-wrapper">
                        <div v-for="discount in discounts" class="swiper-slide slider-actions-item">
                            <router-link :to="'/discounts/'+discount.url_page + '/'" class="slider-actions-item__body">
                                <picture>
                                    <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/${discount.image}`">
                                </picture>
                            </router-link>
                        </div>
                        <div class="swiper-slide slider-actions-item">
                            <router-link to="/" class="slider-actions-item__body">
                                <picture>
                                    <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/actions-2-min.jpg`">
                                </picture>
                            </router-link>
                        </div>
                        <div class="swiper-slide slider-actions-item">
                            <router-link to="/" class="slider-actions-item__body">
                                <picture>
                                    <img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/actions-3-min.jpg`">
                                </picture>
                            </router-link>
                        </div>
                    </div>
                    <div class="slider-actions__scrollbar swiper-scrollbar slider-scrollbar slider-scrollbar__js">
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>
