<script setup>
const searchProducts = inject('searchProducts');

const breadcrumbs = ref([]);
const { data } = await useGetData('/pages', { 
    params: { url_page: '/search' },
    key: 'search-page-data'
});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
useSeoMeta(useMetaTags(data.value));
</script>
<template>
    <main class="main">
        <Breadcrumbs :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <div class="container">
            <h1>Поиск</h1>
        </div>
        <SearchListProducts :search-products="searchProducts"></SearchListProducts>
        <InfoActionsForm></InfoActionsForm>
    </main>
</template>
<style></style>