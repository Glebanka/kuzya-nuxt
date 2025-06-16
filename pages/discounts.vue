<script setup>
const { data: discountsData } = await useGetData('/discounts', {
    key: 'discounts-data',
})
const discounts = ref(discountsData.value?.discounts || null);
const tabs = ref(discountsData.value?.tabs || null);

const { data } = await useGetData('/pages', {
    params: { url_page: '/discounts' },
    key: 'discounts-page-data'
});
const breadcrumbs = ref([]);
const aboutPage = ref({});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));
</script>

<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="all-actions">
            <div class="all-actions__container container">
                <h1 class="anim-item anim-item-active">{{ aboutPage.headline }}</h1>
                <template v-if="tabs.length > 0">
                    <DiscountsTabs :tabs="tabs" />
                </template>
                <BodyDiscounts v-if="discounts.length > 0" :discounts="discounts" />
            </div>
        </section>
        <InfoActionsForm></InfoActionsForm>
    </main>
</template>

<style scoped></style>
