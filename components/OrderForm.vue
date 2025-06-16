<script>
import useVuelidate from '@vuelidate/core';
import { required, requiredIf, minLength, email, sameAs } from '@vuelidate/validators';
export default {
  async setup() {
    return {
      v$: useVuelidate(),
      isClient: import.meta.client,
    }
  },
  data() {
    return {
      form: {
        name: '',
        surname: '',
        phone: '',
        email: '',
        delivery: {
          isDelivery: false,
          address: '',
          detailAddress: {
            flat: '',
            floor: '',
            privateHome: false,
            date: '',
            time: '',
            needMovers: false,
          }
        },
        noDelivery: {
          isNoDelivery: true,
          address: 'г. Исилькуль, ул. Коммунистическая, 30',
        },
        comment: '',
        pay: [
          'Картой онлайн',
          'Наличными или картой при получении',
          'Плайт - оплата частями',
          'Рассрочка по карте «Халва»',
          'Долями - оплата частями в два клика',
          'Сплит - оплата частями',
          'Кредит',
        ],
        selectedPay: 'Картой онлайн',
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
        surname: {
          required,
          minLength: minLength(2)
        },
        phone: {
          required,
          minLength: minLength(16)
        },
        email: {
          required,
          email,
        },
        comment: {
          minLength: minLength(2)
        },
        delivery: {
          detailAddress: {
            flat: { required: requiredIf(this.getIsDeliveryAndPrivateHome) },
            floor: { required: requiredIf(this.getIsDeliveryAndPrivateHome) },
            date: { required: requiredIf(this.getIsDelivery) },
            time: { required: requiredIf(this.getIsDelivery) },
          }
        },
        privacy_policy: {
          required,
          sameAs: sameAs(true),
        }
      }
    }
  },
}
</script>
<template>
  <template v-if="isClient">
    <div class="checkbox-house form-checkboxes">
      <div class="form-item" :class="{ '_checked': form.privacy_policy }">
        <input type="checkbox" id="order_privacy_policy" v-model="form.privacy_policy" class="form-checkbox">
        <label for="order_privacy_policy" class="form-check-label make-order-form__politics form-politics">Я
          даю
          согласие на
          обработку персональных
          данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
            конфиденциальности</router-link>,
          и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
        <div class="helper-block" v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
          Обязательно
        </div>
      </div>
    </div>
  </template>
  <!-- <template v-else>
    <div class="checkbox-house form-checkboxes">
      <div class="form-item" :class="{ '_checked': form.privacy_policy }">
        <input type="checkbox" id="order_privacy_policy" v-model="form.privacy_policy" class="form-checkbox">
        <label for="order_privacy_policy" class="form-check-label make-order-form__politics form-politics">Я
          даю
          согласие на
          обработку персональных
          данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
            конфиденциальности</router-link>,
          и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
        <div class="helper-block" v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
          Обязательно
        </div>
      </div>
    </div>
    
  </template> -->
</template>


<style scoped></style>