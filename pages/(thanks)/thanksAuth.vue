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

const openAuthPopUp = inject('openAuthPopUp')
</script>
<template>
    <main class="main">
        <section>
            <div class="container anim-item anim-item-active mt-200">
                <p class="thanks-text">
                    Спасибо за регистрацию!
                </p>
                <p class="thanks-text">
                    Ваша учетная запись успешно создана.
                </p>
                <p class="thanks-text">
                    На указанный электронный адрес мы отправили письмо с инструкцией    
                </p>
                <p class="text-main-color cursor-pointer" @click="openAuthPopUp">Войти в личный кабинет</p>
            </div>
        </section>
        <info-actions-form></info-actions-form>
    </main>
</template>

<style scoped></style>
