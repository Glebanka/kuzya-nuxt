<script setup>

const breadcrumbs = ref([]);
const aboutPage = ref({});
const isAnimActive = ref(false);

const { data } = await usePageData({ 
  urlPage: '/delivery', 
  cacheKey: 'delivery-page-data'
});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

onMounted(()=>{
    isAnimActive.value = true;
})
</script>


<template>
    <main class="main">
      <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="block-info">
            <div class="block-info__container container">
                <div class="block-info__content">
                    <div class="block-info__block anim-item" :class="{'anim-item-active': isAnimActive}">
                        <div class="block-info__block-body">
                            <h1 class="block-info__title">{{aboutPage.headline}}</h1>
                            <div class="block-info__img">
                                <picture>
                                    <!-- <img src="/storage/delivery.jpg" alt=""> -->
                                </picture>
                            </div>

                        </div>
                    </div>
                    <div class="block-info__block anim-item" :class="{'anim-item-active': isAnimActive}">
                        <div class="block-info__block-body">
                            <div class="block-info__text default-content" v-html="aboutPage.content">
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
        <ask-question-form></ask-question-form>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped>

</style>
