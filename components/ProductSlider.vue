<script setup>
import { Navigation, Pagination, Scrollbar } from "swiper/modules";
import Swiper from "swiper";

const slides = ref([]);

const config = useRuntimeConfig();
const { data, error } = await useFetch(`${config.public.apiBaseURL}/product-slider`)
if (error.value) {
  console.error('Ошибка при загрузке данных в product-slider:', error.value);
}
  slides.value = data.value.data;

function initSwiper() {
  const $slider = selectElement('.first-screen__slider');

  const { isDesktop } = useVars();

  if ($slider) {
    const swiper = new Swiper('.first-screen__slider', {
      modules: [Navigation, Pagination, Scrollbar],
      loop: true,
      slidesPerView: 1.01,
      spaceBetween: isDesktop ? remToPixels(1.6) : remToPixels(.4),
      slidesPerGroup: 1,
      speed: 700,
      centeredSlides: true,
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

onMounted(() => {
  nextTick(() => {
    if (import.meta.client) {
      initSwiper();
    }
  })
})

function getImagePath(image) {
  const config = useRuntimeConfig();
  return `${config.public.apiBaseURL.replace('/api', '')}/storage/${image}`;
}


</script>

<template>
  <section class="first-screen">
    <div class="first-screen__container container anim-item" v-anim-scroll>
      <div class="first-screen__slider _swiper">
        <div class="first-screen__wrapper swiper-wrapper">
          <div v-for="slide in slides" :key="'productSlider' + slide.id"
            class="swiper-slide first-screen-slide bg-red">
            <a :href="slide.link" class="first-screen-slide__body">
              <div class="first-screen-slide__block">
                <div class="first-screen-slide__name">
                  {{ slide.name }}
                </div>
                <div class="first-screen-slide__btns">
                  <div class="first-screen-slide__btn btn default-anim bg-yellow" v-anim-hover>
                    Подробнее
                  </div>
                </div>
              </div>
              <div class="first-screen-slide__bg">
                <picture>
                  <img :src="getImagePath(slide.image)" alt="">
                </picture>
              </div>
            </a>
          </div>
          <!--                    <div class="swiper-slide first-screen-slide bg-red">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-yellow">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-1.jpg" alt="icn">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                       <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-red.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->
          <!--                    <div class="swiper-slide first-screen-slide bg-yellow">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-normal">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-2.jpg" alt="icn">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                        <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-yellow.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->
          <!--                    <div class="swiper-slide first-screen-slide bg-blue">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-yellow">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-3.jpg" alt="icn">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                        <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-blue.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->
          <!--                    <div class="swiper-slide first-screen-slide bg-red">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-yellow">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-1.jpg" alt="">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                        <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-red.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->
          <!--                    <div class="swiper-slide first-screen-slide bg-yellow">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-normal">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-2.jpg" alt="">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                        <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-yellow.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->
          <!--                    <div class="swiper-slide first-screen-slide bg-blue">-->
          <!--                        <a href="#" class="first-screen-slide__body">-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__name">-->
          <!--                                    Емкость 1,2л Маки (соль)-->
          <!--                                    с&nbsp;ложкой М4828-->
          <!--                                </div>-->
          <!--                                <div class="first-screen-slide__btns">-->
          <!--                                    <div class="first-screen-slide__btn btn default-anim bg-yellow">-->
          <!--                                        Подробнее-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__block">-->
          <!--                                <div class="first-screen-slide__img">-->
          <!--                                    <picture>-->
          <!--                                        <img src="@img/fs-3.jpg" alt="">-->
          <!--                                    </picture>-->
          <!--                                    <div class="first-screen-slide__icon">-->
          <!--                                        <img src="@img/svg/fs-icon.svg" alt="icn">-->
          <!--                                    </div>-->
          <!--                                </div>-->
          <!--                            </div>-->
          <!--                            <div class="first-screen-slide__bg">-->
          <!--                                <picture>-->
          <!--                                    <img src="@img/fs-bg-blue.jpg" alt="">-->
          <!--                                </picture>-->
          <!--                            </div>-->
          <!--                        </a>-->
          <!--                    </div>-->

        </div>
        <div class="first-screen__arrows slider-arrows">
          <div class="first-screen__arrow default-anim slider-big-arrow slider-arrow__js left" v-anim-hover>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 7L9 12L14 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                stroke-linejoin="round" />
            </svg>
          </div>
          <div class="first-screen__arrow default-anim slider-big-arrow slider-arrow__js right" v-anim-hover>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 7L15 12L10 17" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <div class="first-screen__scrollbar swiper-scrollbar slider-scrollbar slider-scrollbar__js"></div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
