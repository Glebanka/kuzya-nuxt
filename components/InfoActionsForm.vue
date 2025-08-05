<script>
import useVuelidate from '@vuelidate/core';
import { required, email, sameAs } from '@vuelidate/validators';
import { mapState } from 'pinia';
export default {
	setup() {
		return {
			v$: useVuelidate({ $scope: false }),
			isClient: import.meta.client,
		}
	},
	data() {
		return {
			form: {
				email: '',
				privacy_policy: false,
			},
			responseMessage: '',
			isSubscribed: false,
		}
	},
	validations() {
		return {
			form: {
				email: {
					required,
					email,
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
					const response = await useNuxtApp().$apiFetch('/discount-from', {
						method: 'POST',
						body: {
							email: this.form.email
						},
					});
					this.form.email = '';
					if (response.success) {
						this.responseMessage = 'Подписка оформлена. Спасибо!';
					} else {
						this.responseMessage = response.message;
					}
					// убираем форму через 5 секунд
					setTimeout(() => {
						this.responseMessage = '';
						this.isSubscribed = true;
					}, 5000)

				} catch (error) {
					console.error('Ошибка запроса:', error);
				}
			}
		},
		// добавить сохранение состояния
		async checkUser() {
			if (this.isAuthenticated) {
				let id = getUserIdFromToken(this.token)
				try {
					const response = await useNuxtApp().$apiFetch('/checkAuthSubscribed', {
						method: 'POST',
						body: {
							id: id
						},
					});
					if (response.success) {
						this.isSubscribed = true
					}
				} catch (error) {
					console.error('Ошибка запроса:', error);
				}
			}
		}
	},
	computed: {
		...mapState(useAuthStore, ['token', 'isAuthenticated']),
	},
	watch: {
		token() {
			this.checkUser()
		}
	},
	mounted() {
		this.checkUser()
	},
}
</script>

<template>
	<section v-if="!isSubscribed" class="get-info-actions">
		<div class="get-info-actions__container container bg-grey">
			<div class="get-info-actions__row anim-item" v-anim-scroll>
				<template v-if="responseMessage === ''">
					<h2 class="get-info-actions__title m-0">Узнавайте первыми об акциях!</h2>
					<div class="get-info-actions__form-container">
						<template v-if="isClient">
							<form class="get-info-actions-form form" @submit.prevent="formSubmit">
								<div class="get-info-actions-form__item form-item input _required"
									:class="{ 'has-success': (!v$.form.email.$error && !v$.form.email.required.$invalid && !v$.form.email.email.$invalid), 'has-error': (v$.form.email.$error) || (v$.form.email.email.$invalid && !v$.form.email.required.$invalid) }">
									<div class="get-info-actions-form__body form-item__body">
										<input type="text" name="email" autocomplete="email"
											class="get-info-actions-form__input form-input email" v-model="form.email"
											placeholder="Введите E-mail">
									</div>
								</div>
								<button type="submit" class="get-info-actions-form__btn form-btn btn default-anim bg-yellow"
									v-anim-hover>Подписка</button>
							</form>
							<div class="checkbox-house form-checkboxes">
								<div class="form-item" :class="{ '_checked': form.privacy_policy }">
									<input type="checkbox" id="get-info_privacy_policy" v-model="form.privacy_policy"
										class="form-checkbox">
									<label for="get-info_privacy_policy"
										class="form-check-label make-order-form__politics form-politics">Я даю
										согласие на
										обработку персональных
										данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
											конфиденциальности</router-link>,
										и соглашаюсь с <router-link to="/oferta"
											target="_blank">Офертой</router-link>.</label>
									<div class="helper-block"
										v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
										Обязательно
									</div>
								</div>
							</div>
						</template>
						<template v-else>
							<form class="get-info-actions-form form">
								<div class="get-info-actions-form__item form-item input _required">
									<div class="get-info-actions-form__body form-item__body">
										<input type="text" name="email" autocomplete="email"
											class="get-info-actions-form__input form-input email"
											placeholder="Введите E-mail">
									</div>
								</div>
								<button type="submit" class="get-info-actions-form__btn form-btn btn default-anim bg-yellow"
									v-anim-hover>Подписка</button>
							</form>
							<div class="checkbox-house form-checkboxes">
								<div class="form-item">
									<input type="checkbox" id="get-info_privacy_policy"
										class="form-checkbox">
									<label for="get-info_privacy_policy"
										class="form-check-label make-order-form__politics form-politics">Я даю
										согласие на
										обработку персональных
										данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
											конфиденциальности</router-link>,
										и соглашаюсь с <router-link to="/oferta"
											target="_blank">Офертой</router-link>.</label>
									<div class="helper-block">
										Обязательно
									</div>
								</div>
							</div>
						</template>
					</div>
				</template>
				<h2 v-else class="get-info-actions__title m-0 custom-get-info">
					<div>
						<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
							<rect width="64" height="64" rx="32" fill="#46A358" />
							<path
								d="M18.666 31.675C21.1765 33.5009 26.1975 38.5219 28.2516 41.9453C30.7621 36.4678 37.1525 24.1435 43.9993 18.666"
								stroke="white" stroke-width="4" stroke-linecap="square" stroke-linejoin="round" />
						</svg>
					</div>
					<div class="get-info-actions__text">{{ responseMessage }}</div>
				</h2>
			</div>
		</div>
	</section>
</template>

<style scoped></style>
