<script>
export default {
    data() {
        return {
            breadcrumbs: [],
            aboutPage: {},
            addresses: [],
            token: null,
            type: Boolean,
            default: false,
            isVisible: false,
            addressRemove: null,
        }
    },
    methods: {
        initMeta() {
            definePageMeta({
                middleware: 'auth'
            })
            useSeoMeta({ title: 'Мои адреса доставки' })
            this.breadcrumbs = [{ ['Мои адреса доставки']: '' }]
            this.aboutPage = {
                headline: 'Мои адреса доставки',
            }
        },
        async getAddresses() {
            try {
                const response = await useNuxtApp().$apiFetch(`/user-addresses`, {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    }
                });

                if (response.status == true) {
                    this.addresses = response.addresses;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
        removeAddress(address) {
            this.isVisible = true;
            this.addressRemove = address;
        },
        async confirmDelete() {
            try {
                const response = await useNuxtApp().$apiFetch(`/api/user-addresses/${this.addressRemove.id}`, {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    },
                    method: 'DELETE',
                });

                if (response.status == true) {
                    this.addresses = this.addresses.filter(addr => addr.id !== this.addressRemove.id);
                    this.isVisible = false;
                    this.addressRemove = null;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
        close() {
            this.isVisible = false;
            this.addressRemove = null;
        },
    },
    mounted() {
        this.initMeta();
        useTokenReady(this.getAddresses)
    },
}
</script>
<template>
    <main class="main">
        <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
        <section class="my-delivery-addresses container">
            <h1 v-html="aboutPage.headline"></h1>
            <div class="addresses-wrapper">
                <div v-if="addresses.length > 0" v-for="address in addresses" class="address-container">
                    <div class="address-wrapper">
                        <div class="address-text-wrapper">
                            <svg class="map-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                                viewBox="0 0 32 32" fill="none">
                                <path
                                    d="M28 15.7647C28 23.9368 18.5348 29.3474 16.417 30.4557C16.1506 30.5951 15.8494 30.5951 15.583 30.4557C13.4652 29.3474 4 23.9368 4 15.7647C4 8.70588 9.81441 4 16 4C22.4 4 28 8.70588 28 15.7647Z"
                                    stroke="#1D1D1D" stroke-width="2" />
                                <circle cx="15.9997" cy="15.9999" r="5.66667" stroke="#1D1D1D" stroke-width="2" />
                            </svg>
                            <p class="address-title">{{ address.address }}</p>
                        </div>
                        <p v-if="address.flat !== 0 && address.floor !== 0" class="address-text"><span>кв.
                                {{ address.flat }}</span> / <span>этаж: {{ address.floor }}</span></p>
                        <p v-if="address.flat === 0 && address.floor === 0" class="address-text"><span>Частный
                                дом</span></p>
                    </div>
                    <div class="btns-wrapper">
                        <!--                        <div class="btn-border default-anim">Изменить</div>-->
                        <div class="delete-btn">
                            <svg class="delete-btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="square"
                                    stroke-linejoin="round" />
                            </svg>
                            <p @click="removeAddress(address)" class="delete-btn-text">Удалить адрес</p>
                        </div>
                    </div>
                </div>
                <div v-if="addresses.length === 0">
                    Вы еще не заказывали доставку. Сделайте заказ и укажите адрес доставки, после чего он будет
                    отображаться здесь
                </div>
            </div>
        </section>
        <info-actions-form class="mt-200 mt-120m"></info-actions-form>
        <div class="delete-address-popup" v-if="isVisible">
            <div class="delete-address-popup-overlay" @click="close"></div>
            <div class="delete-address-popup-content">
                <button class="delete-address-popup-close" @click="close">&times;</button>
                <h2>Подтверждение удаления</h2>
                <p>Вы уверены, что хотите удалить этот элемент?</p>
                <div class="delete-address-popup-actions">
                    <button class="delete-button" @click="confirmDelete">Удалить</button>
                    <button class="cancel-button" @click="close">Отмена</button>
                </div>
            </div>
        </div>
    </main>
</template>
<style scoped>
.delete-address-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.delete-address-popup-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
}

.delete-address-popup-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    z-index: 1001;
    position: relative;
    width: 400px;
    /* Задайте ширину по желанию */
}

.delete-address-popup-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #999;
}

.delete-address-popup-close:hover {
    color: red;
    /* Цвет при наведении */
}

.delete-address-popup-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.delete-button {
    background-color: #d9534f;
    /* Красный цвет для кнопки "Удалить" */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

.delete-button:hover {
    background-color: #c9302c;
    /* Более темный красный при наведении */
}

.cancel-button {
    background-color: #f0ad4e;
    /* Оранжевый цвет для кнопки "Отмена" */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

.cancel-button:hover {
    background-color: #ec971f;
    /* Более темный оранжевый при наведении */
}

.delete-address-popup-content h2 {
    margin: 2rem 0 4rem;
}

.delete-address-popup-content p {
    margin: 0 0 6rem;
}
</style>
