<script>

import useVuelidate from '@vuelidate/core';
import { required, minLength, sameAs } from '@vuelidate/validators';

export default {
	setup() {
		const { phoneInput } = usePhoneMask();
		const v$ = useVuelidate();
		return {
			phoneInput,
			v$,
		};
	},
	data() {
		return {
			form: {
				name: '',
				phone: '',
				msg: '',
				privacy_policy: false,
			},
		}
	},
	validations() {
		return {
			form: {
				name: {
					required,
					minLength: minLength(2)
				},
				phone: {
					required,
					minLength: minLength(16)
				},
				msg: {
					minLength: minLength(2)
				},
				privacy_policy: {
					required,
					sameAs: sameAs(true),
				}
			}
		}
	},
	methods: {
		async formSubmit(e) {
			e.preventDefault();
			this.v$.$touch();
			if (!this.v$.$invalid) {
				try {
					const response = await useNuxtApp().$apiFetch('/question', {
						method: 'POST',
						body: {
							name: this.form.name,
							phone: this.form.phone,
							msg: this.form.msg
						},
					});

					if (response.success) {
						this.form.name = '';
						this.form.phone = '';
						this.form.msg = '';
						this.$router.push('/thanks');
					} else {
						console.error('Ошибка сервера:', response.error || 'Неизвестная ошибка');
					}
				} catch (error) {
					console.error('Ошибка запроса:', error);
				}
			}
		},
	},
}
</script>

<template>
	<section class="ask-question" id="ask-question">
		<div class="ask-question__container container">
			<div class="ask-question__block">
				<div class="ask-question__img">
					<picture>
						<img :src="`${useRuntimeConfig().public.imgBaseURL}/storage/question-form.png`" alt="">
					</picture>
				</div>
			</div>
			<div class="ask-question__block anim-item" v-anim-scroll>
				<h2 class="ask-question__title m-t-0">Остались вопросы?</h2>
				<div class="ask-question__text">
					<p>Оставьте свой номер и мы вам перезвоним</p>
				</div>
				<form action="" @submit.prevent="formSubmit" class="ask-question-form form">
					<div class="ask-question-form__item form-item input _required"
						:class="{ 'has-success': (!v$.form.name.$error && !v$.form.name.required.$invalid && !v$.form.name.minLength.$invalid), 'has-error': (v$.form.name.$error) || (v$.form.name.minLength.$invalid) }">
						<label for="" class="form-label">Имя *</label>
						<div class="form-item__body">
							<input type="text" name="name" class="ask-question-form__input form-input"
								v-model.trim="form.name" data-min="2" data-max="32" maxlength="32"
								placeholder="Ваше имя">
							<div class="helper-block" v-if="v$.form.name.minLength.$invalid">
								Минимальное количетсво символов 2
							</div>
							<div class="helper-block" v-if="(v$.form.name.$error && v$.form.name.required.$invalid)">
								Это обязательное поле для заполнения
							</div>
						</div>

					</div>
					<div class="ask-question-form__item form-item input _required"
						:class="{ 'has-success': (!v$.form.phone.$error && !v$.form.phone.required.$invalid && !v$.form.phone.minLength.$invalid), 'has-error': (v$.form.phone.$error) || (v$.form.phone.minLength.$invalid) }">
						<label for="" class="ask-question-form__label form-label">Телефон *</label>
						<div class="form-item__body">
							<input ref="phoneInput" type="text" name="phone"
								class="ask-question-form__input form-input phone" v-model.trim="form.phone"
								inputmode="tel" placeholder="+7_">
							<div class="helper-block" v-if="v$.form.phone.minLength.$invalid">
								Минимальное количетсво символов 16
							</div>
							<div class="helper-block" v-if="(v$.form.phone.$error && v$.form.phone.required.$invalid)">
								Это обязательное поле для заполнения
							</div>
						</div>

					</div>
					<div class="ask-question-form__item form-item textarea"
						:class="{ 'has-success': (form.msg.length > 0) }">
						<label for="" class="ask-question-form__label form-label">Сообщение</label>
						<textarea name="message" class="ask-question-form__textarea form-textarea"
							placeholder="Введите сообщение" v-model.trim="form.msg"></textarea>
					</div>
					<div class="ask-question-form__last-row form-last-row">
						<button type="submit" class="ask-question-form__btn form-btn btn default-anim bg-yellow"
							v-anim-hover>
							Отправить
						</button>
						<div class="checkbox-house form-checkboxes">
							<div class="form-item" :class="{ '_checked': form.privacy_policy }">
								<input type="checkbox" id="question_privacy_policy" v-model="form.privacy_policy"
									class="form-checkbox">
								<label for="question_privacy_policy"
									class="form-check-label make-order-form__politics form-politics">Я даю
									согласие на
									обработку персональных
									данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
										конфиденциальности</router-link>,
									и соглашаюсь с <router-link to="#" target="_blank">Правилами</router-link>.</label>
								<div class="helper-block"
									v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
									Обязательно
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</section>
</template>

<style scoped></style>
