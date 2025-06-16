<script setup>
const { data } = await useGetData('/pages', { 
    params: { url_page: '/o-kompanii' },
    key: 'about-page-data'
});

const breadcrumbs = ref([]);
const aboutPage = ref({});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

const isAnimActive = ref(false);
onMounted(()=>{
    isAnimActive.value = true;
})
</script>

<template>
    <main class="main default-page">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="">
            <div class="container default-content anim-item" :class="{ 'anim-item-active': isAnimActive }">
                <h1 v-html="aboutPage.title"></h1>
                <div v-html="aboutPage.content"></div>
            </div>
        </section>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped></style>