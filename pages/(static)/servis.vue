<script setup>
const breadcrumbs = ref([]);
const aboutPage = ref({});
const isAnimActive = ref(false);


const { data } = await usePageData({ 
  urlPage: '/servis', 
  cacheKey: 'service-page-data'
});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

onMounted(()=>{
    isAnimActive.value = true;
})
</script>

<template>
    <main class="main default-page">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="">
            <div class="container default-content anim-item" :class="{'anim-item-active': isAnimActive}">
                <h1 v-html="aboutPage.title"></h1>
                <div v-html="aboutPage.content"></div>
            </div>
        </section>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped>

</style>
