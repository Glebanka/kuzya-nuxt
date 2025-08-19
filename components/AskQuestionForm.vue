<script setup>
import { required, minLength, sameAs } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { useIMask } from 'vue-imask';

const form = reactive({
	name: '',
	phone: '',
	msg: '',
	privacy_policy: false,
})
const rules = computed(() => ({
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
}))

const v$ = useVuelidate(rules, form, { $scope: false })

const { el: phoneInput, masked: maskedPhoneValue } = useIMask({
    mask: '+{7}(000)000-00-00',
});
watch(maskedPhoneValue, (newVal) => {
    form.phone = newVal
})

async function formSubmit(e) {
	e.preventDefault();
	v$.value.$touch();
	if (!v$.value.$invalid) {
		try {
			const response = await useNuxtApp().$apiFetch('/question', {
				method: 'POST',
				body: {
					name: form.name,
					phone: form.phone,
					msg: form.msg
				},
			});

			if (response.success) {
				useRouter().push('/thanks');
				form.name = '';
				form.phone = '';
				form.msg = '';
			} else {
				console.error('Ошибка сервера:', response.error || 'Неизвестная ошибка');
			}
		} catch (error) {
			console.error('Ошибка запроса:', error);
		}
	}
}
</script>
<template>
	<section class="ask-question" id="ask-question">
		<div class="ask-question__container container">
			<div class="ask-question__block">
				<div class="ask-question__img">
					<picture>
						<NuxtImg src="/img/question-form.png" loading="lazy" :placeholder="[400, 493]" alt="image"
							format="webp" />
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
						:class="{ 'has-success': (!v$.name.$error && !v$.name.required.$invalid && !v$.name.minLength.$invalid), 'has-error': (v$.name.$error || v$.name.minLength.$invalid) }">
						<label for="" class="form-label">Имя *</label>
						<div class="form-item__body">
							<input type="text" name="name" class="ask-question-form__input form-input"
								v-model.trim="form.name" data-min="2" data-max="32" maxlength="32"
								placeholder="Ваше имя">
							<div class="helper-block" v-if="v$.name.minLength.$invalid">
								Минимальное количетсво символов 2
							</div>
							<div class="helper-block" v-if="(v$.name.$error && v$.name.required.$invalid)">
								Это обязательное поле для заполнения
							</div>
						</div>
					</div>
					<div class="ask-question-form__item form-item input _required"
						:class="{ 'has-success': (!v$.phone.$error && !v$.phone.required.$invalid && !v$.phone.minLength.$invalid), 'has-error': (v$.phone.$error) || (v$.phone.minLength.$invalid) }">
						<label for="" class="ask-question-form__label form-label">Телефон *</label>
						<div class="form-item__body">
							<input ref="phoneInput" type="text" name="phone"
								class="ask-question-form__input form-input phone"
								inputmode="tel" placeholder="+7_">
							<div class="helper-block" v-if="v$.phone.minLength.$invalid">
								Минимальное количетсво символов 16
							</div>
							<div class="helper-block" v-if="(v$.phone.$error && v$.phone.required.$invalid)">
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
									и соглашаюсь с <router-link to="/oferta"
										target="_blank">Офертой</router-link>.</label>
								<div class="helper-block"
									v-if="v$.privacy_policy.sameAs.$invalid && v$.privacy_policy.$error">
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
