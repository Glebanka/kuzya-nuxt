<script>
export default {
    data() {
        return {
            date: 'Дата',
            isActivePurchaseTypeSelect: false,
            isActiveOrderStatusSelect: false,
            purchaseType: 'Покупки онлайн',
            purchaseTypes: ["Все", "Покупки онлайн", "Покупки в магазинах"],
            orderStatus: 'Все заказы',
            orderStatuses: ['Все заказы', 'Текущие заказы', "Прошедшие заказы"],
            orders: [],
            ordersShow: [],
            showClearOrderButton: false,
            breadcrumbs: [],
        }
    },
    methods: {
        clearOrders() {
            this.ordersShow = this.orders;
            this.showClearOrderButton = false;
        },
        async getOrders() {
            try {
                const response = await useNuxtApp().$apiFetch(`/orders`, {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    }
                });
                if (response.status == true) {
                    this.orders = response.orders;
                    this.ordersShow = this.orders;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
        togglePurchaseTypeSelect() {
            this.isActivePurchaseTypeSelect = !this.isActivePurchaseTypeSelect;
        },
        toggleOrderStatusSelect() {
            this.isActiveOrderStatusSelect = !this.isActiveOrderStatusSelect;
        },
        changePurchaseType(purchaseType) {
            this.purchaseType = purchaseType;
            this.isActivePurchaseTypeSelect = false;
        },
        changeOrderStatus(orderStatus) {
            this.orderStatus = orderStatus;
            this.isActiveOrderStatusSelect = false;
        },
        init() {
            const setDateBirth = (date) => {
                this.date = date;
                this.ordersShow = this.orders.filter(order => {
                    return order.created_at === this.date
                })
                this.showClearOrderButton = true
            }
            function dateCalendar() {
                const $calendar = selectElement('.vanilla-calendar.vanilla-calendar__date');
                let today = new Date();

                if ($calendar) {
                    const calendarInfoDate = $calendar.parentElement.querySelector('.vanilla-calendar__input');

                    const calendar = new VanillaCalendar($calendar, {
                        settings: {
                            lang: 'ru',
                            iso8601: true,
                            visibility: {
                                weekend: false,
                            },
                            range: {
                                min: (today.getFullYear() - 100) + '-01-01',
                                max: today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'),
                                // values: ['2023-02-16', '2022-02-17'],
                            },
                        },
                        actions: {
                            clickDay(e, dates) {
                                let currentDate = new Date(dates[0]);
                                if (currentDate.getDate()) {
                                    setDateBirth(`${(currentDate.getDate() < 10) ? '0' + currentDate.getDate() : currentDate.getDate()}.${(currentDate.getMonth() + 1) < 10 ? '0' + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1)}.${currentDate.getFullYear()}`)
                                } else {
                                    setDateBirth('');
                                }
                                $calendar.classList.remove('_active');
                            },
                            clickArrow(e, year, month) {
                                let $this = e.target;
                                if ($this.classList.contains('vanilla-calendar-arrow_prev')) {
                                    $this.nextElementSibling.classList.remove('hide');
                                }
                                if ($this.getAttribute('style') === 'visibility: hidden;') {
                                    $this.classList.add('hide');
                                }
                            },
                        },
                        DOMTemplates: CalendarDOMTemplate,
                    });
                    calendar.init();

                    if (calendarInfoDate) {
                        calendarInfoDate.addEventListener('click', () => {
                            $calendar.classList.toggle('_active');
                        });
                    }
                }
            }
            dateCalendar();
        },
        async initMeta() {
            definePageMeta({
                middleware: 'auth'
            })
            useSeoMeta({ title: 'Заказы' })
            this.breadcrumbs = [{ ['Заказы']: '' }]
        },
    },
    mounted() {
        this.initMeta();
        useTokenReady(this.getOrders)
        this.init();
    },
}
</script>
<template>
    <LoadingScreen ref="loadingScreen"></LoadingScreen>
    <main class="main">
        <Breadcrumbs :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="my-orders container">
            <h1>Заказы</h1>
            <div class="select-boxes-wrapper">
                <div class="calendar">
                    <div class="form-item__body">
                        <input class="vanilla-calendar__input form-input" readonly v-model="date">
                        <div class="vanilla-calendar vanilla-calendar__date"></div>
                    </div>
                    <div v-if='showClearOrderButton' @click="clearOrders()"
                        class="order-more-info-btn form-btn btn default-anim bg-yellow" style="margin: 2rem 0;">Удалить
                        поиск по дате</div>
                </div>
                <!--                <div class="form-item select-box select-box__purchase-type no-hidden-li"-->
                <!--                    :class="{ '_active': isActivePurchaseTypeSelect }" data-time-from="10" data-time-to="22"-->
                <!--                    data-time-step="30">-->
                <!--                    <div class="select-box__head" @click="togglePurchaseTypeSelect">-->
                <!--                        <div class="select-box__label select-box__label-black-text">-->
                <!--                            {{ purchaseType }}</div>-->
                <!--                    </div>-->
                <!--                    <div class="select-box__body">-->
                <!--                        <div class="select-box__content">-->
                <!--                            <ul class="list-style-none select-box__list">-->
                <!--                                <template v-for="purchaseType in purchaseTypes">-->
                <!--                                    <li @click="changePurchaseType(purchaseType)"><span>{{ purchaseType }}</span></li>-->
                <!--                                </template>-->
                <!--                            </ul>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                </div>-->
                <!--                <div class="form-item select-box no-hidden-li" :class="{ '_active': isActiveOrderStatusSelect }"-->
                <!--                    data-time-from="10" data-time-to="22" data-time-step="30">-->
                <!--                    <div class="select-box__head" @click="toggleOrderStatusSelect">-->
                <!--                        <div class="select-box__label select-box__label-black-text">-->
                <!--                            {{ orderStatus }}</div>-->
                <!--                    </div>-->
                <!--                    <div class="select-box__body">-->
                <!--                        <div class="select-box__content">-->
                <!--                            <ul class="list-style-none select-box__list">-->
                <!--                                <template v-for="orderStatus in orderStatuses">-->
                <!--                                    <li @click="changeOrderStatus(orderStatus)"><span>{{ orderStatus }}</span></li>-->
                <!--                                </template>-->
                <!--                            </ul>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                </div>-->
            </div>
            <div class="orders-wrapper">
                <template v-for="order in ordersShow">
                    <OrdersPageItem :loadingScreen="$refs.loadingScreen" :order="order"></OrdersPageItem>
                </template>
            </div>
        </section>
        <section class="my-order container">
            <router-link to="/my-products" class="slider-products__btn btn-2 default-anim" v-anim-hover>
                <svg width="16" height="16" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 10H25M1 10L9 2M1 10L9 18" stroke="#1D1D1D" stroke-width="2" stroke-linecap="square"
                        stroke-linejoin="round"></path>
                </svg>
                <p class="my-order-btn-text">
                    Посмотреть все товары
                </p>
            </router-link>
        </section>

        <info-actions-form class="mt-200 mt-120m"></info-actions-form>
    </main>
</template>
<style scoped></style>
