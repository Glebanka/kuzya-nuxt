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
            <div class="container thanks-container">
                <h1>Спасибо!</h1>
                <router-link to="/" class="not-found__btn btn default-anim bg-yellow">Вернуться на главную</router-link>
            </div>
        </section>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped lang="scss">
.thanks-container{
    display: flex;
    flex-flow: column;
    align-items: center;

    h1{
        font-size: 5.4rem;
    }

    p{
        font-size: 2.4rem;
        line-height: 1.4;
        margin-bottom: 2.8rem;
    }
    
    *{
        text-align: center;
    }
}
</style>
