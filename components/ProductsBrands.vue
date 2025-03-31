<script setup>

const brands = ref([]);

const { data } = await useAPI(`/brand-slider`)

brands.value = data.value.data;

function getImagePath(image) {
  return `${useRuntimeConfig().public.imgBaseURL}/storage/parnters/${image}`;
}
</script>
<template>
  <section class="products-brands">
    <div class="products-brands__container grey-container">
      <div class="products-brands__content anim-item" v-anim-scroll>
        <div class="products-brands__box">
          <h2 class="products-brands__title m-t-0">Народный магазин товаров для дома</h2>
          <div class="products-brands__text">
            <p>Я домовой, и моя задача, чтобы дома было все по-хозяйски, то есть тепло и уютно.
              Лучшие товары для дома собрал в одном месте под вывеской КУЗЯ.</p>
          </div>
        </div>
        <div v-if="brands && brands.length" class="products-brands-marquee marquee">
          <div class="products-brands-marquee-item marquee-item">
            <div v-for="brand in brands" :key="'brand-row-' + brand.id" class="products-brands-marquee-item__img">
              <a :href="brand.link" target="_blank">
                <!-- <img :src="getImagePath(brand.image)" alt=""> -->
              </a>
            </div>
          </div>
          <div class="products-brands-marquee-item marquee-item">
            <div v-for="brand in brands" :key="'brand-2row-' + brand.id" class="products-brands-marquee-item__img">
              <a :href="brand.link" target="_blank">
                <!-- <img :src="getImagePath(brand.image)" alt=""> -->
              </a>
            </div>
          </div>
        </div>
        <div class="products-brands__btns">
          <router-link to="/brands/" class="products-brands__btn btn default-anim bg-yellow">
            Посмотреть все бренды
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>