<script setup>
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

const products = ref([]);
const titleCategory = ref('');
const urlCategory = ref('');

const { carouselId } = defineProps({
  carouselId: Number
})

const { data } = await useGetData('/carousel-product', { 
    method: 'POST',
    body: { id_category: carouselId },
    key: `carousel-product-data-id-${carouselId}`
});


if (data.value.data) {
  if (data.value.data.product) {
    products.value = data.value.data.product;
  }
  if (data.value.data.name_carousel) {
    titleCategory.value = data.value.data.name_carousel;
  }
  if (data.value.data.url_category) {
    urlCategory.value = data.value.data.url_category;
  }
}

onMounted(() => {
  nextTick(() => {
    initSlider();
  })
});

function initSlider() {
  const sliderProducts = selectElements('.slider-products__slider');
  if (sliderProducts.length) {
    sliderProducts.forEach(($slider, indx) => {
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
  <section class="slider-products block-products" :class="{ 'hidden': products.length < 1 }">
    <div class="slider-products__container container">
      <div class="slider-products__row anim-item" v-anim-scroll>
        <h2 class="slider-products__title m-0">
          {{ titleCategory }}
        </h2>
        <div class="slider-products__btns">
          <router-link :to="`/catalog${urlCategory}`" class="slider-products__btn btn-2 default-anim" v-anim-hover>
            Посмотреть все товары
          </router-link>
        </div>
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
      <div class="slider-products__slider _swiper anim-item" v-anim-scroll>
        <div class="slider-products__wrapper swiper-wrapper">
          <CardProduct v-for="product in products" :key="'sliderProduct-' + product.id" :product="product"
            class="swiper-slide slider-products-item"></CardProduct>
        </div>
        <div class="slider-products__scrollbar swiper-scrollbar slider-scrollbar slider-scrollbar__js"></div>
      </div>
    </div>
  </section>
</template>
