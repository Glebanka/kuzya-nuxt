<script setup>

const props = defineProps(['order', 'loadingScreen']);

/** @type {Order} */
const order = ref(props.order);
let orderStatus = computed(() => {
    switch (order.value.status_order) {
        case 0: return 'создан'
        case 1: return 'обработан'
        case 2: return 'отменяется'
        case 3: return 'отменен'
        case 4: return 'завершен'
        default: return 'UNKNOWN'
    }
})

const imgBlock = ref(null)
if (order.images?.length > 0) {
    watch(imgBlock, (newValue) => {
        if (newValue) {
            newValue.forEach((imgBlock, index) => {
                imgBlock.addEventListener('error', () => {
                    order.images[index] = null;
                });
            })
        }
    });
}

const orderCancel = async () => {
    props.loadingScreen.show();
    order.value.status_order = 2;
    try {
        const response = await useNuxtApp().$apiFetch(`/order/cancel/${order.value.id}`, {
            headers: {
                'Authorization': `Bearer ${useAuthStore().token}`,
            }
        });
        
        if (response.status === 400) {
            props.loadingScreen.error('Что-то пошло не так, повторите позднее')
        } else if (response.status == true) {
            props.loadingScreen.success('Заявка отправлена. Ждите подтверждения')
        } else {
            props.loadingScreen.error('Что-то пошло не так, повторите позднее')
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        props.loadingScreen.error('Что-то пошло не так, повторите позднее')
    }
}
</script>

<template>
    <div class="order">
        <div class="order-info-wrapper">
            <div class="order-info">
                <div class="order-info-title"
                    :class="{ 'canceled': orderStatus == 'отменен', 'done': orderStatus == 'завершен' }">
                    <p class="order-info-title__text">Заказ №{{ order.id }}</p>
                    <p class="order-info-status">Заказ {{ orderStatus }}</p>
                </div>
                <div class="order-info-container">
                    <div class="order-info__item">
                        <div class="order-info__item-title">
                            Дата заказа:
                        </div>
                        <div class="order-info__item-text">
                            {{ order.date_title }}
                        </div>
                    </div>
                    <div class="order-info__item">
                        <div class="order-info__item-title">
                            Количество товаров:
                        </div>
                        <div class="order-info__item-text">
                            {{ order.total_count }} шт.
                        </div>
                    </div>
                    <div class="address-text-wrapper order-info__address">
                        <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 32 32" fill="none">
                            <path
                                d="M28 15.7647C28 23.9368 18.5348 29.3474 16.417 30.4557C16.1506 30.5951 15.8494 30.5951 15.583 30.4557C13.4652 29.3474 4 23.9368 4 15.7647C4 8.70588 9.81441 4 16 4C22.4 4 28 8.70588 28 15.7647Z"
                                stroke="#1D1D1D" stroke-width="2" />
                            <circle cx="15.9997" cy="15.9999" r="5.66667" stroke="#1D1D1D" stroke-width="2" />
                        </svg>
                        <p class="address-title">{{ order.address }}</p>
                    </div>
                    <div class="order-info__item">
                        <div class="order-info__item-title">
                            Сумма заказа:
                        </div>
                        <div class="order-info__item-text">
                            {{ order.total_sum }} ₽
                        </div>
                    </div>
                    <div class="order-info__item">
                        <div class="order-info__item-title">
                            Оплата:
                        </div>
                        <div class="order-info__item-text">
                            {{ order.pay_platform }}
                        </div>
                    </div>
                    <div v-if="order.date === null" class="order-info__delivery-date">Самовывоз</div>
                    <div v-if="order.date === 0" class="order-info__delivery-date">Доставка сегодня</div>
                    <div v-if="order.date === -1" class="order-info__delivery-date">Доставка уже была</div>
                    <div v-if="order.date > 0" class="order-info__delivery-date">Доставка через
                        {{ order.date }} {{
                            sklonenie(order.date, ['день', 'дня', 'дней']) }}</div>
                </div>
            </div>
        </div>
        <div class="order-images">
            <template v-for="img in order.images">
                <template v-if="img">
                    <picture>
                        <img class="order-image" ref="imgBlock"
                            :src="`https://nmag.tmweb.ru/picture/import_files/${img}`" alt="">
                    </picture>
                </template>
                <template v-else>
                    <picture>
                        <img class="order-image" src="~/assets/img/empty-img.png" alt="empty-img">
                    </picture>
                </template>
            </template>
        </div>
        <div class="order-more-info-btns">
            <router-link :to="`/my-order/${order.id}`" class="order-more-info-btn form-btn btn default-anim bg-yellow"
                v-anim-hover>Подробнее
            </router-link>
            <button @click="orderCancel" class="btn-3"
                v-if="orderStatus === 'создан' || orderStatus === 'обработан'">Отменить
                заказ</button>
        </div>
    </div>
</template>

<style scoped></style>
