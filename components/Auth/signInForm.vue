<script>
import { email, maxLength, minLength, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
export default {
    setup() {
        return {
            v$: useVuelidate()
        }
    },
    data() {
        return {
            errorMessage: null,
            form: {
                email: '',
                password: '',
            },
            passOpened: false,
            passwordEye: `url(${useRuntimeConfig().public.imgBaseURL}/assets/password-eye.svg)`,
        }
    },
    emits: ['changeFormType'],
    inject: [
        'closeAuthPopUp',
    ],
    validations() {
        return {
            form: {
                email: {
                    required,
                    email,
                },
                password: {
                    required,
                    minLength: minLength(2),
                    maxLength: maxLength(60),
                },
            }
        }
    },
    methods: {
        async login() {
            this.$refs.loadingScreen.show()
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$refs.loadingScreen.close()
                return false;
            }
            try {
                const response = await useNuxtApp().$apiFetch('/login', {
                    method: 'POST',
                    body: {
                        password: this.form.password,
                        email: this.form.email,
                    },
                });               

                if (response.success) {
                    const authStore = useAuthStore();
                    authStore.setToken(response.token);
                    authStore.getUserData();
                    this.closeAuthPopUp()
                    this.$router.push({
                        path: '/',
                        query: { justLoggedIn: true }
                    });
                }
            } catch (error) {
                if(error.response.status == 401){
                    this.errorMessage = 'Неправильный логин или пароль';
                    this.$refs.loadingScreen.close()
                }
            }
        },
    },
    watch: {
        passOpened(newState) {
            if (newState == true) {
                this.$refs.passInput.type = 'text'
            } else {
                this.$refs.passInput.type = 'password'
            }
        }
    },
}
</script>
<template>
    <form class="authForm" @keydown.enter="login()">
        <div class="authForm__container">
            <h2 class="authForm__title">Вход</h2>

            <div class="authForm__wrapper">
                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body">
                        <label for="" class="form-label">Элетронная почта</label>
                        <div class="form-item__body"
                            :class="{ 'has-error': ((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0) }">
                            <input type="email" class="form-input" autocapitalize="off" autocorrect="off"
                                autocomplete="email" inputmode="email" v-model.trim="form.email">
                            <div class="helper-block"
                                v-if="((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0)">
                                Email введен не корректно
                            </div>
                            <div class="helper-block" v-if="v$.form.email.$error && v$.form.email.required.$invalid">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                </div>
                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body">
                        <label for="" class="form-label">Пароль</label>
                        <div class="form-item__body"
                            :class="{ 'has-error': ((v$.form.password.required.$invalid || v$.form.password.minLength.$invalid || v$.form.password.maxLength.$invalid) && form.password.length !== 0) }">
                            <div class="password-input">
                                <input ref="passInput" type="password" v-model.trim="form.password" class="form-input">
                                <div class="password-eye" @click="passOpened = !passOpened"
                                    :class="{ 'opened': passOpened }"></div>
                            </div>
                            <div class="helper-block" v-if="v$.form.password.minLength.$invalid">
                                Минимальное количество символов 2
                            </div>
                            <div class="helper-block" v-if="v$.form.password.maxLength.$invalid">
                                Максимальное количество символов 60
                            </div>
                            <div class="helper-block"
                                v-if="(v$.form.password.$error && v$.form.password.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                        <div class="forgot-pass cursor-pointer" @click.prevent="$emit('changeFormType', 'forgotPass')">
                            Забыли пароль?
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="this.errorMessage" style="color: red;">{{ this.errorMessage }}</div>
            <div class="authForm__btns">
                <div @click="login()" class="btn btn-small w-fit">
                    Вход</div>
                <p class="authForm__btns-text cursor-pointer" @click.prevent="$emit('changeFormType', 'signUp')">
                    Регистрация</p>
            </div>
        </div>
    </form>
    <LoadingScreen ref="loadingScreen"></LoadingScreen>
</template>
<style scoped>
.password-eye{
	cursor: pointer;
	position: absolute;
	width: 3.8rem;
	height: 2rem;
	right: 2rem;
	top: 50%;
	transform: translate(0, -50%);
	background-image: v-bind('passwordEye');
	background-position: 0 2rem;
	background-size: 3.8rem 6rem;
}
.password-eye.opened{
	background-position: 0 0;
	height: 3rem;
}
</style>
