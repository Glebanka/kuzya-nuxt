<script>
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
export default {
    setup() {
        return {
            v$: useVuelidate()
        }
    },
    data() {
        return {
            errorMessage: '',
            form: {
                email: ''
            },
            isSuccess: false,
        }
    },
    validations() {
        return {
            form: {
                email: {
                    required,
                    email,
                },
            }
        }
    },
    emits: ['changeFormType'],
    methods: {
        async forgotPassword() {
            this.$refs.loadingScreen.show()
            await this.$recaptchaLoaded()
            const token = await this.$recaptcha('login')

            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$refs.loadingScreen.close()
                return false;
            }

            try {
                await useNuxtApp().$apiFetch('/forgot-password', {
                    method: 'POST',
                    body: {
                        email: this.form.email,
                        token: token,
                    },
                });

                this.errorMessage = '';
                this.$refs.loadingScreen.close()
                this.isSuccess = true;
            } catch (error) {
                if (error.response.status === 404) {
                    this.errorMessage = error.response._data.message || 'Произошла ошибка';
                }
                this.$refs.loadingScreen.close()
            }
        },
    },
}
</script>
<template>
    <form class="authForm">
        <div class="authForm__container" v-if="isSuccess">
            <h2 class="authForm__title">Успешно</h2>
            <p class="authForm-small-text">На email выслали инструкции для восстановления пароля.</p>

            <button class="btn btn-small w-fit" @click.prevent="$emit('changeFormType', 'signIn')">Войти в личный
                кабинет</button>
        </div>
        <div class="authForm__container" v-if="!isSuccess">
            <h2 class="authForm__title">Воcстановить пароль</h2>

            <div class="authForm__wrapper">
                <p class="authForm-small-text">Для восстановления пароля, введите адрес вашей электронной почты.
                    Мы вышлем ссылку для восстановления пароля.</p>

                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body">
                        <label for="" class="form-label">Электронная почта</label>
                        <div class="form-item__body"
                            :class="{ 'has-error': ((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0) }">
                            <input type="email" class="form-input" autocapitalize="off" autocorrect="off"
                                autocomplete="email" inputmode="email" v-model.trim="form.email">
                            <div class="helper-block"
                                v-if="((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0)">
                                Email введен не корректно
                            </div>
                            <div class="helper-block" v-if="(v$.form.email.$error && v$.form.email.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="authForm__btns">
                <div @click="forgotPassword()" class="btn btn-small w-fit">
                    Восстановить
                </div>
                <p class="cursor-pointer authForm__btns-text" @click.prevent="$emit('changeFormType', 'signIn')">
                    Я помню пароль
                </p>
            </div>
            <div class="" style="color: red;" v-if="errorMessage != ''">
                {{ errorMessage }}
            </div>
        </div>
    </form>
    <LoadingScreen ref="loadingScreen"></LoadingScreen>
</template>
