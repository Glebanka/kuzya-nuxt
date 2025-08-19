<script setup>
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';
const breadcrumbs = ref([{ ['Поменять пароль']: '' }]);
const aboutPage = ref({
    headline: 'Поменять пароль',
});
useSeoMeta({ title: 'Поменять пароль' })

const route = useRoute()

// Токен и email из параметров маршрута
const token = route.params.token
const email = route.params.email

// Состояние формы
const form = reactive({
    pass: '',
    confirmPass: ''
})

// Флаг для проверки совпадения паролей
const samePassword = computed(() => form.confirmPass === form.pass)


// Правила валидации
const rules = computed(() => ({
    pass: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(30)
    },
    confirmPass: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(30)
    }
}))



// Vuelidate
const v$ = useVuelidate(rules, form)

// Обработчик смены пароля
async function changePassword() {
    v$.value.$touch()
    if (v$.value.$invalid || !samePassword.value) {
        return
    }

    try {
        const response = await useNuxtApp().$apiFetch('/reset-password/', {
            method: 'POST',
            body: {
                token,
                password: form.pass,
                email
            },
        });
        if (response.success) {
            useRouter().push('/thanks-password/')
        }
    } catch (err) {
        console.error('Ошибка при смене пароля:', err)
    }
}
</script>
<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="container changePassForm">
            <h1 v-html="aboutPage.headline"></h1>
            <form class="inputs-container">
                <div class="inputs-container__item form-item input">
                    <label for="" class="form-label">Новый пароль</label>
                    <div class="form-item__body">
                        <PassInputTemplate>
                            <div class="helper-block" v-if="v$.pass.minLength.$invalid">
                                Минимальное количество символов 6
                            </div>
                            <div class="helper-block" v-if="v$.pass.maxLength.$invalid">
                                Максимальное количество символов 30
                            </div>
                            <input class="form-input" type="password" v-model="form.pass">
                        </PassInputTemplate>
                    </div>
                </div>
                <div class="inputs-container__item form-item input">
                    <label for="" class="form-label">Повторите пароль</label>
                    <div class="form-item__body">
                        <PassInputTemplate>
                            <input class="form-input" type="password" v-model="form.confirmPass">
                            <div class="helper-block" v-if="v$.confirmPass.minLength.$invalid">
                                Минимальное количество символов 6
                            </div>
                            <div class="helper-block" v-if="v$.confirmPass.maxLength.$invalid">
                                Максимальное количество символов 30
                            </div>
                            <div class="helper-block"
                                v-if="(form.confirmPass.length >= 6 && !v$.pass.minLength.$invalid && !v$.confirmPass.maxLength.$invalid && !samePassword)">
                                Пароли не совпадают
                            </div>
                        </PassInputTemplate>
                    </div>
                </div>
                <div @click="changePassword()" class="btn-border default-anim btn-border-240" v-anim-hover>
                    Сохранить
                </div>
            </form>
        </section>
    </main>
</template>
<style scoped></style>
