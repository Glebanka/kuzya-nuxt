<script setup>
const breadcrumbs = ref([]);
const aboutPage = ref({});

const { data } = await useGetData('/pages', { 
    params: { url_page: '/shops' },
    key: 'shops-page-data'
});

breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

</script>

<template>
    <main class="main shops-page">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <OurShops :title="aboutPage.headline" :has-contacts-blocks="false" />
        <AskQuestionForm />
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped>

</style>
