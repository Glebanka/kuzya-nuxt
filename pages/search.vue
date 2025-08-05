<script setup>
const searchData = inject('searchData');
const btns = computed(() => {
    if (searchData.value?.categories.length > 0) {
        return [
            ...[{
                name: 'Все категории',
                link: '',
                active: true,
            }],
            ...searchData.value?.categories,
        ]
    } else {
        return []
    }
})
const searchValue = computed(() => {
    return useRoute().query.value
})

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
            <h1>{{ searchValue ? `Поиск по запросу: "${searchValue}"` : "Поиск" }}</h1>
            <div v-if="Object.keys(searchData).length !== 0">
                <p>Найдено в категориях:</p>
                <BtnsSelect :items="btns" />
            </div>
        </div>
        <SearchListProducts :search-data="searchData"></SearchListProducts>
        <InfoActionsForm></InfoActionsForm>
    </main>
</template>
<style scoped>
h1{
    margin: 4rem 0 2.4rem;
}
.container{
    margin-bottom: 4.8rem;
}
</style>