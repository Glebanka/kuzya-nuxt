<script>
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

export default {
  name: 'CarouselProduct',
  props: {
    carouselId: Number
  },
  data() {
    return {
      products: [],
      titleCategory: '',
      urlCategory: '',
    }
  },
  methods: {
    async getProducts() {
      const config = useRuntimeConfig();
      const { data, error, execute } = useFetch(`${config.public.apiBaseURL}/carousel-product`, {
        method: 'POST',
        body: { id_category: this.carouselId },
      });
      await execute()
      if (error.value) {
        console.error('Ошибка при загрузки CarouselProduct:', error.value);
        return;
      }
      if (data.value.data) {
        if (data.value.data.product) {
          this.products = data.value.data.product;
        }
        if (data.value.data.name_carousel) {
          this.titleCategory = data.value.data.name_carousel;
        }
        if (data.value.data.url_category) {
          this.urlCategory = data.value.data.url_category;
        }
        this.$nextTick(() => {
          this.initSlider();
        })
      }


      // axios.post('/api/carousel-product', { id_category: this.carouselId })
      //   .then(res => {
      //     let data = res.data.data;
      //     if (data) {
      //       if (data.product) {
      //         this.products = data.product;
      //       }
      //       if (data.name_carousel) {
      //         this.titleCategory = data.name_carousel;
      //       }
      //       if (data.url_category) {
      //         this.urlCategory = data.url_category;
      //       }
      //       this.$nextTick(() => {
      //         this.initSlider();
      //       })
      //     }
      //   })
      //   .catch(err => {
      //     // console.log(err.response.data)
      //   })
    },
    initSlider() {
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
  },
  computed: {},
  async mounted() {
    await this.getProducts();
  }
}
</script>
<template>
  <section v-if="products.length" class="slider-products block-products">
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
