<script>
export default {
    data() {
        return {
            breadcrumbs: [],
            aboutPage: {},
            products: [],
            /** @type {Order} */
            order: null,
        }
    },
    methods: {
        async getProducts() {
            let orderId = window.location.pathname.split('/')[2];
            try {
                const response = await useNuxtApp().$apiFetch(`/order/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    }
                });
                if (response.status == true) {
                    this.order = response.order;
                    this.products = response.order.products;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
        initMeta() {
            definePageMeta({
                middleware: 'auth'
            })
            useRobotsRule({ noindex: true, nofollow: true })
            useSeoMeta({ title: 'Мой заказ' })
            this.breadcrumbs = [{ ['Мой заказ']: '' }]
        },
    },
    computed: {
        orderStatus() {
            if (this.order.status_order == 0) {
                return 'создан'
            } else if (this.order.status_order == 1) {
                return 'обработан'
            } else if (this.order.status_order == 2) {
                return 'отмена'
            } else if (this.order.status_order == 3) {
                return 'отменен'
            } else if (this.order.status_order == 4) {
                return 'завершен'
            }
        }
    },
    mounted() {
        this.initMeta()
        useTokenReady(this.getProducts)
    },
}
</script>
<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="my-order container">
            <router-link :to="`/orders/`" class="go-back-btn btn-2 default-anim" v-anim-hover>
                <svg class="go-back-btn__icon" xmlns="http://www.w3.org/2000/svg" width="17" height="16"
                    viewBox="0 0 17 16" fill="none">
                    <path d="M2.29346 8.33333H15.1712M2.29346 8.33333L7.62679 3M2.29346 8.33333L7.62679 13.6667"
                        stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round" />
                </svg>
                <p class="go-back-btn__text">
                    К списку заказов
                </p>
            </router-link>

            <h1 v-if="order">Заказ №{{ order.id }}</h1>
            <div class="my-order-info">
                <div v-if="order" class="order-product-info">
                    <div class="order-product-info__status" :class="{ 'canceled': orderStatus === 'отменен', 'done': orderStatus === 'завершен' }">Заказ {{orderStatus}}</div>
                    <div class="order-product-info__item">
                        <div class="order-product-info__item-title">
                            Дата заказа:
                        </div>
                        <div class="order-product-info__item-text">
                            {{ order.date_title }}
                        </div>
                    </div>
                    <div class="order-product-info__item">
                        <div class="order-product-info__item-title">
                            Количество заказов:
                        </div>
                        <div class="order-product-info__item-text">
                            {{ order.total_count }} шт.
                        </div>
                    </div>
                    <div class="order-product-info__info-container">
                        <div class="text-with-icon">
                            <svg class="text-with-icon__icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M16 18L18 20L22 16M22 10H2M22 12V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.0799 19 5.2 19H12"
                                    stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="order-product-info__item">
                                <div class="order-product-info__item-title">
                                    Оплата:
                                </div>
                                <div class="order-product-info__item-text">
                                    {{ order.pay_platform }}
                                </div>
                            </div>
                        </div>
                        <div class="order-product-info__text-container">
                            <div class="order-product-info__text">{{ order.total_sum }} ₽</div>
                        </div>
                    </div>
                    <div class="order-product-info__info-container">
                        <div class="text-with-icon">
                            <svg class="text-with-icon__icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M21 11.8235C21 17.8239 14.1961 21.8392 12.42 22.7852C12.1547 22.9265 11.8453 22.9265 11.58 22.7852C9.80387 21.8392 3 17.8239 3 11.8235C3 6.52941 7.36081 3 12 3C16.8 3 21 6.52941 21 11.8235Z"
                                    stroke="#1D1D1D" stroke-width="2" />
                                <circle cx="12" cy="12" r="4" stroke="#1D1D1D" stroke-width="2" />
                            </svg>
                            <div v-if="order.delivery" class="text-with-icon__text">Доставка по адресу:</div>
                            <div v-if="!order.delivery" class="text-with-icon__text">Самовывоз из магазина:</div>
                        </div>
                        <div class="order-product-info__text-container">
                            <div class="order-product-info__text">{{ order.address }}</div>
                        </div>
                    </div>
                    <div class="order-product-info__info-container">
                        <div class="text-with-icon">
                            <svg class="text-with-icon__icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z"
                                    stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div class="text-with-icon__text">Получатель</div>
                        </div>

                        <div class="order-product-info__text-container">
                            <div class="order-product-info__text">{{ order.surname }} {{ order.name }}</div>
                            <div class="order-product-info__text">{{ order.tel }}</div>
                            <div class="order-product-info__text">{{ order.email }}</div>
                        </div>

                    </div>
                </div>
                <div class="order-products small-products">
                    <CardProduct v-for="product in products" :key="'sliderProduct-5'" :product="product"></CardProduct>
                </div>
            </div>
        </section>

        <info-actions-form class="mt-200 mt-120m"></info-actions-form>
    </main>
</template>
<style scoped></style>
