<script setup>
const { data } = await useGetData('/pages', { 
    params: { url_page: '/thanks' },
    key: 'thanks-page-data'
});

const breadcrumbs = ref([]);
const aboutPage = ref({});
breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));
</script>

<template>
    <main class="main">
        <section>
            <div class="container anim-item anim-item-active">
                <h1>Пароль успешно изменен!</h1>
                <router-link to="/" class="not-found__btn btn default-anim bg-yellow">Вернуться на главную</router-link>
            </div>
        </section>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped></style>
