<script>
import useVuelidate from '@vuelidate/core';
import { required, email, minLength, maxLength, sameAs } from '@vuelidate/validators';
export default {
    setup() {
        const { phoneInput } = usePhoneMask();
        return {
            v$: useVuelidate(),
            phoneInput,
        }
    },
    data() {
        return {
            isLegalCheckboxChecked: false,
            mailSubscribeChecked: false,
            errorMessage: null,
            emailExist: false,
            form: {
                name: '',
                surname: '',
                phone: '',
                email: '',
                clientType: 'individual',
                privacy_policy: false,
            },
        }
    },
    validations() {
        return {
            form: {
                email: {
                    required,
                    email,
                },
                name: {
                    required,
                    minLength: minLength(2),
                    maxLength: maxLength(30),
                },
                surname: {
                    required,
                    minLength: minLength(2),
                    maxLength: maxLength(30),
                },
                phone: {
                    required,
                    minLength: minLength(16),
                    maxLength: maxLength(16),
                },
                privacy_policy: {
                    required,
                    sameAs: sameAs(true),
                }
            }
        }
    },
    emits: ['changeFormType'],
    methods: {
        async signUp() {
            this.$refs.loadingScreen.show()
            if (this.isLegalCheckboxChecked) {
                this.form.clientType = 'legal'
            } else {
                this.form.clientType = 'individual'
            }
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$refs.loadingScreen.close()
                return false;
            }
            try {
                const response = await useNuxtApp().$apiFetch('/registration', {
                    method: 'POST',
                    body: {
                        person_type: this.form.clientType,
                        name: this.form.name,
                        surname: this.form.surname,
                        phone: this.form.phone,
                        email: this.form.email,
                        mailSubscribeChecked: this.mailSubscribeChecked
                    },
                });

                if (response.success) {
                    this.errorMessage = null;
                    window.location.href = `/thanks-auth/`;
                }
            } catch (error) {
                if (error.response.status == 422) {
                    // Такой email уже существует
                    this.emailExist = true;
                    this.errorMessage = null;
                    this.$refs.loadingScreen.close()
                } else {
                    this.errorMessage = 'Произошла ошибка, попробуйте еще раз или свяжитесь с нами по телефону';
                    this.$refs.loadingScreen.close()
                }
            }
        }
    },
    mounted() {
    },
}
</script>
<template>
    <form class="authForm">
        <div class="authForm__container">
            <h2 class="authForm__title">Регистрация</h2>

            <div class="authForm__wrapper">
                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body"
                        :class="{ 'has-error': ((v$.form.name.$error || v$.form.name.required.$invalid || v$.form.name.minLength.$invalid || v$.form.name.maxLength.$invalid) && form.name.length !== 0) }">
                        <label for="" class="form-label">Имя</label>
                        <div class="form-item__body">
                            <input type="text" class="form-input" v-model.trim="form.name">
                            <div class="helper-block" v-if="v$.form.name.minLength.$invalid">
                                Минимальное количество символов 2
                            </div>
                            <div class="helper-block" v-if="v$.form.name.maxLength.$invalid">
                                Максимальное количество символов 30
                            </div>
                            <div class="helper-block" v-if="(v$.form.name.$error && v$.form.name.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                </div>
                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body"
                        :class="{ 'has-error': ((v$.form.surname.$error || v$.form.surname.required.$invalid || v$.form.surname.minLength.$invalid || v$.form.surname.maxLength.$invalid) && form.surname.length !== 0) }">
                        <label for="" class="form-label">Фамилия</label>
                        <div class="form-item__body">
                            <input type="text" class="form-input" v-model.trim="form.surname">
                            <div class="helper-block" v-if="v$.form.surname.minLength.$invalid">
                                Минимальное количество символов 2
                            </div>
                            <div class="helper-block" v-if="v$.form.surname.maxLength.$invalid">
                                Максимальное количество символов 30
                            </div>
                            <div class="helper-block"
                                v-if="(v$.form.surname.$error && v$.form.surname.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                </div>
                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body"
                        :class="{ 'has-error': ((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0) }">
                        <label for="" class="form-label" autocapitalize="off" autocorrect="off" autocomplete="email"
                            inputmode="email">Email</label>
                        <div class="form-item__body">
                            <input type="email" class="form-input" v-model.trim="form.email">
                            <div class="helper-block"
                                v-if="((v$.form.email.required.$invalid || v$.form.email.email.$invalid) && form.email.length !== 0)">
                                Email введен не корректно
                            </div>
                            <div class="helper-block" v-if="v$.form.email.$error && v$.form.email.required.$invalid">
                                Это обязательное поле для заполнения
                            </div>
                            <div class="helper-block" v-if="emailExist">
                                Пользователь с такой почтой уже зарегистрирован
                            </div>
                        </div>
                    </div>
                </div>

                <div class="inputs-container__item form-item input authForm__input">
                    <div class="form-item__body"
                        :class="{ 'has-error': ((v$.form.phone.required.$invalid || v$.form.phone.$error || v$.form.phone.minLength.$invalid) && form.phone.length !== 0) }">
                        <label for="" class="form-label">Телефон</label>
                        <div class="form-item__body">
                            <input ref="phoneInput" type="text" class="form-input" inputmode="tel" placeholder="+7_"
                                data-tel-input data-min="16" data-max="16" maxlength="16" v-model.trim="form.phone">
                            <div class="helper-block" v-if="v$.form.phone.minLength.$invalid">
                                Минимальное количетсво символов 16
                            </div>
                            <div class="helper-block" v-if="(v$.form.phone.$error && v$.form.phone.required.$invalid)">
                                Это обязательное поле для заполнения
                            </div>
                        </div>
                    </div>
                </div>
                <div class="checkbox-rows">
                    <div class="checkbox-house form-checkboxes">
                        <div class="form-item" :class="{ '_checked': isLegalCheckboxChecked }">
                            <input type="checkbox" id="legalCheckbox" v-model="isLegalCheckboxChecked"
                                class="form-checkbox">
                            <label for="legalCheckbox" class="form-check-label">Я регистрируюсь как юридическое
                                лицо</label>
                        </div>
                    </div>
                    <div class="checkbox-house form-checkboxes">
                        <div class="form-item" :class="{ '_checked': mailSubscribeChecked }">
                            <input type="checkbox" id="mailChecked" v-model="mailSubscribeChecked"
                                class="form-checkbox">
                            <label for="mailChecked" class="form-check-label">Подписка на скидки и новости</label>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="this.errorMessage" style="color: red;">{{ this.errorMessage }}</div>
            <div class="authForm__btns">
                <div @click="signUp()" class="btn btn-small w-fit">Регистрация</div>
                <p class="authForm__btns-text cursor-pointer" @click.prevent="$emit('changeFormType', 'signIn')">Вход
                </p>
            </div>
            <div class="checkbox-house form-checkboxes">
                <div class="form-item" :class="{ '_checked': form.privacy_policy }">
                    <input type="checkbox" id="register_privacy_policy" v-model="form.privacy_policy"
                        class="form-checkbox">
                    <label for="register_privacy_policy"
                        class="form-check-label make-order-form__politics form-politics">Я даю
                        согласие на
                        обработку персональных
                        данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
                            конфиденциальности</router-link>,
                        и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
                    <div class="helper-block"
                        v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
                        Обязательно
                    </div>
                </div>
            </div>
        </div>
    </form>
    <LoadingScreen ref="loadingScreen"></LoadingScreen>
</template>
<style scoped></style>
