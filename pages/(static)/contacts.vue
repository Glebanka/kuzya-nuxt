<script setup>
const breadcrumbs = ref([]);
const aboutPage = ref({});

const { data } = await useGetData('/pages', { 
    params: { url_page: '/contacts' },
    key: 'contacts-page-data'
});

breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));
</script>

<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <OurShops :title="aboutPage.headline" :has-contacts-blocks="true"/>
        <ContactsDepartments />
        <AskQuestionForm />
        <InfoActionsForm />
    </main>
</template>

<style scoped>

</style>
