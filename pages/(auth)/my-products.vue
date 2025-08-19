<script>
export default {
    data() {
        return {
            breadcrumbs: [],
            isActiveSelect: false,
            sortMethod: 'Новые',
            sortMethods: ['Новые', 'Старые'],
            categoryId: '43aa862d-4380-4654-b6f1-2231df1880d2',
            products: [],
            productsReverse: [],
            displayProducts: [],
            hasMore: false,
            productsPerPage: 8,
            currentPage: 1,
        }
    },
    methods: {
        toggleSelect() {
            this.isActiveSelect = !this.isActiveSelect;
        },
        changeSortMethod(sortMethod) {
            this.sortMethod = sortMethod;
            this.isActiveSelect = false;
            this.currentPage = 1;
            if (this.sortMethod === 'Новые') {
                this.displayProducts = this.products.slice(0, this.productsPerPage);

            } else if (this.sortMethod === 'Старые') {
                this.displayProducts = this.productsReverse.slice(0, this.productsPerPage);
            }
        },
        initMeta() {
            definePageMeta({
                middleware: 'auth'
            })
            useRobotsRule({ noindex: true, nofollow: true })
            useSeoMeta({ title: 'Товары' })
            this.breadcrumbs = [{ ['Товары']: '' }]
        },
        async getProducts() {
            try {
                const response = await useNuxtApp().$apiFetch('/user-products', {
                    headers: {
                        'Authorization': `Bearer ${useAuthStore().token}`,
                    }
                });
                if (response.status == true) {
                    this.products = response.products;
                    this.productsReverse = Array.from(this.products).reverse();
                    this.displayProducts = this.products.slice(0, this.productsPerPage);
                    this.hasMore = this.products.length > this.productsPerPage;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        },
        loadMore() {
            this.currentPage++;
            const end = this.currentPage * this.productsPerPage;
            this.displayProducts = this.products.slice(0, end);
            this.hasMore = this.products.length > end;
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
        <section class="my-products container">
            <h1>Товары</h1>
            <div class="form-item select-box no-hidden-li" :class="{ '_active': isActiveSelect }" data-time-from="10"
                data-time-to="22" data-time-step="30">
                <div class="select-box__head" @click="toggleSelect">
                    <div class="select-box__label select-box__label-black-text">
                        {{ sortMethod }}</div>
                </div>
                <div class="select-box__body">
                    <div class="select-box__content">
                        <ul class="list-style-none select-box__list">
                            <template v-for="sortMethod in sortMethods">
                                <li @click="changeSortMethod(sortMethod)"><span>{{ sortMethod }}</span></li>
                            </template>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="list-products block-products">
            <div class="list-products__container container">
                <div class="list-products__items list-products__js g-4">
                    <template v-for="(product) in displayProducts">
                        <CardProduct :product="product" />
                    </template>
                </div>
                <div class="list-products__btns">
                    <div @click="loadMore" v-if="hasMore" class="list-products__btn btn-2 default-anim load-ajax__js"
                        v-anim-hover>
                        Показать еще
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4.53749 5.73748L4.53397 5.73456C4.60282 5.65251 4.68172 5.57998 4.75334 5.50018C4.89142 5.34636 5.02874 5.19268 5.17597 5.04793C5.27962 4.94608 5.39017 4.85196 5.49847 4.75491C5.63579 4.63153 5.77274 4.50846 5.91704 4.39311C6.03644 4.29718 6.16034 4.20816 6.28417 4.11808C6.42824 4.01308 6.57329 3.91048 6.72322 3.81343C6.85394 3.72883 6.98744 3.64933 7.12237 3.57058C7.27642 3.48128 7.43274 3.39608 7.59134 3.31498C7.72979 3.24433 7.86884 3.17653 8.01134 3.11248C8.17814 3.03748 8.34809 2.96893 8.51984 2.90301C8.66189 2.84878 8.80312 2.79388 8.94832 2.74626C9.13304 2.68513 9.32182 2.63421 9.51134 2.58403C9.64994 2.54706 9.78689 2.50716 9.92789 2.47671C10.1454 2.42916 10.3678 2.39616 10.5904 2.36361C10.7096 2.34636 10.8262 2.32221 10.9469 2.30901C12.5485 2.13117 14.1691 2.35514 15.6624 2.96068C17.1557 3.56622 18.4746 4.53424 19.5 5.77731V2.99998H21V8.99998H15V7.49998H18.8914C18.1462 6.35012 17.1254 5.40476 15.9219 4.74984C14.7183 4.09492 13.3702 3.75122 12 3.74998C11.7021 3.75075 11.4044 3.7675 11.1082 3.80016C11.0061 3.81111 10.9072 3.83166 10.8063 3.84628C10.6181 3.87373 10.4302 3.90193 10.2462 3.94191C10.1268 3.96786 10.0104 4.00191 9.89279 4.03303C9.73297 4.07518 9.57344 4.11838 9.41767 4.16968C9.29444 4.21071 9.17392 4.25721 9.05324 4.30333C8.90879 4.35898 8.76562 4.41651 8.62537 4.47951C8.50454 4.53403 8.38589 4.59201 8.26814 4.65201C8.13429 4.72016 8.00274 4.79183 7.87349 4.86703C7.75874 4.93401 7.64504 5.00203 7.53367 5.07388C7.40774 5.15556 7.28557 5.24203 7.16452 5.32986C7.05907 5.40681 6.95324 5.48263 6.85177 5.56423C6.73057 5.66128 6.61507 5.76493 6.49927 5.86896C6.40739 5.95146 6.31342 6.03156 6.22537 6.11796C6.10027 6.24066 5.98364 6.37138 5.86649 6.50173C4.974 7.49728 4.33702 8.69496 4.01047 9.9915C3.68392 11.288 3.6776 12.6446 3.99204 13.9441C4.30649 15.2436 4.93227 16.4472 5.81544 17.451C6.6986 18.4549 7.81266 19.2288 9.06156 19.7062C10.3105 20.1836 11.6567 20.3502 12.9843 20.1914C14.3119 20.0326 15.5809 19.5534 16.6821 18.795C17.7832 18.0366 18.6833 17.0217 19.3049 15.838C19.9265 14.6542 20.2508 13.337 20.25 12H21.75C21.752 13.5683 21.3756 15.114 20.6528 16.5059C19.9299 17.8978 18.882 19.0947 17.5979 19.9952C16.3138 20.8956 14.8314 21.473 13.2766 21.6784C11.7217 21.8837 10.1402 21.7109 8.6664 21.1747C7.19256 20.6385 5.86983 19.7546 4.81045 18.5981C3.75108 17.4416 2.98632 16.0466 2.58108 14.5315C2.17585 13.0164 2.14209 11.4259 2.48268 9.89499C2.82326 8.36406 3.52814 6.93788 4.53749 5.73748Z"
                                fill="#1D1D1D" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>

        <info-actions-form class="mt-142 mb-60"></info-actions-form>
    </main>
</template>
<style scoped>
.my-products .select-box__head {
    width: 34.8rem;
    height: 4.8rem;
    background-color: var(--grey);
}

.form-item {
    width: 34.8rem;
}
</style>
