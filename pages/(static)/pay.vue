<script setup>

const breadcrumbs = ref([]);
const aboutPage = ref({});
const isAnimActive = ref(false);

const { data } = await usePageData({ 
  urlPage: '/pay', 
  cacheKey: 'pay-page-data'
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
        <section class="block-info info-pay">
            <div class="block-info__container info-pay__container container">
                <div class="block-info__content info-pay__content">
                    <div class="block-info__block info-pay__block anim-item"
                        :class="{ 'anim-item-active': isAnimActive }">
                        <div class="block-info__block-body info-pay__block-body">
                            <h1 class="block-info__title info-pay__title">{{ aboutPage.headline }}</h1>
                            <div class="block-info__img info-pay__img">
                                <picture>
                                    <!-- <img src="/storage/pay.jpg" alt=""> -->
                                </picture>
                            </div>
                        </div>
                    </div>
                    <div class="block-info__block info-pay__block anim-item"
                        :class="{ 'anim-item-active': isAnimActive }">
                        <div class="block-info__block-body info-pay__block-body" v-html="aboutPage.content"></div>
                    </div>
                </div>
            </div>
        </section>
        <AskQuestionForm></AskQuestionForm>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped></style>
