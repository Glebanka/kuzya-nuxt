<script>
export default {
    data() {
        return {
            breadcrumbs: [],
            aboutPage: {},
            addresses: [],
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
        getAddresses() {
            console.log('getAddresses');
            
            const { isAuthenticated, userData } = useAuthStore();
            if(isAuthenticated){
                this.addresses = userData.delivery_addresses;
            }
        },
        confirmRemove(address){
            useConfirmPopup()('Вы уверены, что хотите удалить этот элемент?').then((ques) => {ques && this.deleteAddress(address)});
        },
        async deleteAddress(address) {
            try {
                const response = await useNuxtApp().$apiFetch(`/user-addresses/${address.id}`, {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    },
                    method: 'DELETE',
                });
                if (response.status == true) {
                    // Обновляем данные в authStore
                    useAuthStore().getUserData();
                    this.addresses = this.addresses.filter(addr => addr.id !== address.id);
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
    },
    mounted() {
        this.initMeta();
        useGetUserData(this.getAddresses);
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
                            <p @click="confirmRemove(address)" class="delete-btn-text">Удалить адрес</p>
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
    </main>
</template>
<style scoped>
</style>
