<script setup>
const breadcrumbs = ref([]);
const aboutPage = ref({});
const isAnimActive = ref(false);


const { data } = await useGetData('/pages', { 
    params: { url_page: '/404' },
    key: 'error-page-data'
});

breadcrumbs.value = [{ [data.value.data.breadcrumbs]: '' }];
aboutPage.value = data.value.data;
useSeoMeta(useMetaTags(data.value));

onMounted(()=>{
    isAnimActive.value = true;
})
</script>

<template>
    <NuxtLayout>
        <main class="main">
            <section class="not-found">
                <div class="not-found__container container anim-item" v-anim-scroll>
                    <div class="not-found__box">
                        <div class="not-found__text">
                            <p>К сожалению, запрашиваемая
                                Вами страница не найдена...</p>
                        </div>
                        <div class="not-found__btns">
                            <router-link to="/" class="not-found__btn btn default-anim bg-yellow">Вернуться на
                                главную</router-link>
                        </div>
                    </div>
                    <div class="not-found__img">
                        <picture>
                            <img src="~/assets/img/404.png" alt="">
                        </picture>
                    </div>
                </div>
            </section>
            <info-actions-form></info-actions-form>
        </main>
    </NuxtLayout>
</template>

<style scoped></style>
