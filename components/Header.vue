<script>

export default {
    data() {
        return {
            selectedShop: '',
            inputSearch: '',
        }
    },
    inject: [
        'setSearchData',
        'configs',
        'openPopUpMenu',
        'openAuthPopUp',
    ],
    methods: {
        syncSelectedShop(event) {
            if (event.key === 'selectedShop') {
                this.getSelectedShop()
            }
        },
        getSelectedShop() {
            if (localStorage.getItem('selectedShop') !== null) {
                this.selectedShop = JSON.parse(localStorage.getItem('selectedShop')).address;
            } else {
                const recursionSetTimeout = () => {
                    let timeID = setTimeout(() => {
                        if (localStorage.getItem('selectedShop') !== null) {
                            this.selectedShop = JSON.parse(localStorage.getItem('selectedShop')).address;
                        } else {
                            recursionSetTimeout();
                        }
                        if (this.selectedShop) {
                            clearTimeout(timeID)

                        }
                    }, 100);
                }
                recursionSetTimeout();
            }
        },
        setSearch(e) {
            if (this.inputSearch.length >= 3) {
                useNuxtApp().$apiFetch('/search-product', {
                    params: {
                        inputSearch: this.inputSearch
                    }
                }).then(response => {
                    if (this.$route.path !== '/search') {
                        this.$router.push('/search')
                            .then(() => {
                                this.updateURL(this.inputSearch);
                            });
                    } else {
                        this.updateURL(this.inputSearch);
                    }
                    if (response.success) {
                        this.setSearchData({
                            products: response.data,
                            categories: response.categories
                        });
                    } else {
                        this.setSearchData({});
                    }
                }).catch(error => {
                    console.log('Ошибка запроса:', error)
                })
            }
        },
        updateURL(value) {
            const params = new URLSearchParams();
            params.append('value', value);
            this.$router.replace({ query: { value } });
        },
        getSearchQueryFromURL() {
            if (window.location.pathname === '/search') {
                const queryString = window.location.search;
                const params = new URLSearchParams(queryString);
                const encodedValue = params.get('value');
                const decodedValue = decodeURIComponent(encodedValue);
                if (decodedValue !== 'null') {
                    this.inputSearch = decodedValue;
                    this.setSearch();
                }
            }
        },
    },
    mounted() {
        window.addEventListener('storage', this.syncSelectedShop);
        this.getSelectedShop();
        this.getSearchQueryFromURL();
    },
    beforeUnmount() {
        window.removeEventListener('storage', this.syncSelectedShop);
    },
    watch: {
        $route: {
            handler(val) {
                if (val.path !== '/search') {
                    this.inputSearch = '';
                }
            },
            deep: true,
        }
    }
}
</script>
<script setup>
const { isDesktop } = useVars();

const topNav = ref([]);

const cartStore = useCartStore();
const cartQuantity = computed(() => cartStore.productsAvailable.length)

const { data } = await useAPI(`/header-menu`)
topNav.value = data.value.data

const { userData } = storeToRefs(useAuthStore())

const userAvatar = computed(() => userData.value?.image || '')

onMounted(() => {
    selectCity()
})

function selectCity() {
    const $changeCity = selectElements('.change-shop__js');
    const $selectShopPopup = selectElement('.select-shop');
    const { $body } = useVars();

    if ($changeCity.length) {
        $changeCity.forEach(($item, indx) => {
            $item.addEventListener('click', () => {
                $selectShopPopup.classList.add('_active');
                $body.value.classList.add('_overflow');
            });
        })
    }

    if ($selectShopPopup) {
        $selectShopPopup.addEventListener('click', (e) => {
            let $selectShop = e.target.closest('.select-shop__js');
            if ($selectShop) {
                $changeCity.forEach(($item, indx) => {
                    if ($item.querySelectorAll('span').length) {
                        $item.querySelectorAll('span').forEach(span => {
                            span.textContent = $selectShop.closest('.select-shop-region-item').querySelector('.select-shop-region-item__city').textContent;

                        })
                    }
                    if ($item.querySelector('input')) {
                        $item.querySelector('input').vakue = $selectShop.closest('.select-shop-region-item').querySelector('.select-shop-region-item__city').textContent;
                    }
                })
                $selectShopPopup.classList.remove('_active');
                $body.value.classList.remove('_overflow');
                $selectShop.closest('.select-shop-region-item').classList.remove('_active');
            } else {
                return;
            }
        });
    }

    const $closeSelectShopPopup = selectElement('.close-select-shop-popup__js');
    if ($closeSelectShopPopup) {
        $closeSelectShopPopup.addEventListener('click', () => {
            $selectShopPopup.classList.remove('_active');
            $body.value.classList.remove('_overflow');
        });

    }
}
</script>

<template>
    <header class="header">
        <div class="header__container">
            <div class="top-header">
                <div class="top-header__container">
                    <div class="top-header-address">
                        Ваш магазин:
                        <div class="top-header-address__value change-shop__js text-anim">
                            <template v-if="selectedShop">
                                <span>{{ selectedShop }}</span>
                                <span>{{ selectedShop }}</span>
                            </template>
                        </div>
                        <!-- Тут получается если пользователь авторизован, то ссылка на стр. Магазины, иначе div открывается popup -->
                    </div>
                    <div class="top-header__nav">
                        <ul class="list-style-none top-header__list">
                            <li v-for="(item, indx) in topNav" :key="'topMenu' + indx" class="top-header-item">
                                <router-link :to="'/' + item.url_page + '/'" class="top-header-item__link text-anim">
                                    <span>{{ item.name_menu }}</span>
                                    <span>{{ item.name_menu }}</span>
                                </router-link>
                            </li>
                        </ul>
                    </div>
                    <div class="top-header-contacts">
                        <a :href="'tel:' + configs['TEL_HREF']" class="top-header-contacts-item">
                            <div class="top-header-contacts-item__value text-anim">
                                <span>{{ configs['TEL'] }}</span>
                                <span>{{ configs['TEL'] }}</span>
                            </div>
                        </a>
                        <a :href="configs['LINK_WHATSAPP']" target="_blank" class="top-header-contacts-item"
                            v-if="configs['LINK_WHATSAPP']">
                            <div class="top-header-contacts-item__icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M0 16L1.12466 11.8913C0.430666 10.6886 0.0659999 9.32531 0.0666665 7.92732C0.0686665 3.55666 3.62533 0 7.99532 0C10.116 0.000666665 12.1066 0.826665 13.604 2.32533C15.1006 3.82399 15.9246 5.81599 15.924 7.93465C15.922 12.306 12.3653 15.8626 7.99532 15.8626C6.66865 15.862 5.36132 15.5293 4.20332 14.8973L0 16ZM4.39799 13.462C5.51532 14.1253 6.58198 14.5226 7.99265 14.5233C11.6246 14.5233 14.5833 11.5673 14.5853 7.93332C14.5866 4.29199 11.642 1.34 7.99798 1.33866C4.36332 1.33866 1.40666 4.29466 1.40533 7.92798C1.40466 9.41131 1.83933 10.522 2.56933 11.684L1.90333 14.116L4.39799 13.462ZM11.9893 9.81931C11.94 9.73665 11.808 9.68731 11.6093 9.58798C11.4113 9.48865 10.4373 9.00931 10.2553 8.94331C10.074 8.87731 9.94198 8.84398 9.80931 9.04265C9.67731 9.24065 9.29731 9.68731 9.18198 9.81931C9.06665 9.95131 8.95065 9.96798 8.75265 9.86865C8.55465 9.76931 7.91598 9.56065 7.15932 8.88531C6.57065 8.35998 6.17265 7.71132 6.05732 7.51265C5.94199 7.31465 6.04532 7.20732 6.14399 7.10865C6.23332 7.01998 6.34199 6.87732 6.44132 6.76132C6.54199 6.64665 6.57465 6.56399 6.64132 6.43132C6.70732 6.29932 6.67465 6.18332 6.62465 6.08399C6.57465 5.98532 6.17865 5.00999 6.01399 4.61332C5.85265 4.22732 5.68932 4.27932 5.56799 4.27332L5.18799 4.26666C5.05599 4.26666 4.84132 4.31599 4.65999 4.51466C4.47866 4.71332 3.96666 5.19199 3.96666 6.16732C3.96666 7.14265 4.67666 8.08465 4.77532 8.21665C4.87466 8.34865 6.17199 10.35 8.15932 11.208C8.63198 11.412 9.00131 11.534 9.28865 11.6253C9.76331 11.776 10.1953 11.7546 10.5366 11.704C10.9173 11.6473 11.7086 11.2246 11.874 10.762C12.0393 10.2986 12.0393 9.90198 11.9893 9.81931Z"
                                        fill="white" />
                                </svg>
                            </div>
                        </a>
                        <a :href="configs['LINK_TELEGRAM']" target="_blank" class="top-header-contacts-item"
                            v-if="configs['LINK_TELEGRAM']">
                            <div class="top-header-contacts-item__icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.7754 2.04294C14.485 1.97488 14.1549 1.9856 13.7504 2.09036C11.407 2.69753 2.09165 5.59114 1.32507 5.91538C0.48961 6.26867 0.00751958 6.89113 7.94162e-05 7.70783C-0.00984081 8.79982 0.91098 9.65705 2.00012 9.62035C2.03517 9.61958 3.3828 9.63718 4.15017 9.64483C4.15017 9.64483 4.83515 12.9185 4.85171 12.9575C5.05163 13.427 5.5206 13.567 5.92517 13.398L8.20026 12.4413C8.45779 12.6837 10.1893 14.2827 10.3753 14.4257C10.9294 14.8509 11.4082 14.9847 12.0003 14.9992C12.9537 15.023 13.7866 14.4869 14.2254 13.6129C14.5008 13.0646 15.7846 5.38621 15.9004 4.62457C16.0844 3.41558 16.0428 2.9407 15.5254 2.449C15.3175 2.25171 15.0659 2.11023 14.7754 2.04294ZM14.4003 3.52569C14.4003 3.52569 14.4392 3.66104 14.3254 4.40892C13.9181 7.0869 12.9529 12.566 12.7504 13.0148C12.612 13.3223 12.3348 13.4775 12.0253 13.4691C11.7529 13.4622 11.6173 13.4163 11.3753 13.2305C11.2508 13.1349 10.6907 12.6264 9.9003 11.8915C9.89038 11.8823 8.32379 10.421 8.32379 10.421C8.17106 10.2757 8.02754 10.1893 7.72681 10.1862C7.55193 10.1862 7.32112 10.3132 7.32112 10.3132L6.11806 11.2866L5.70021 9.33359L10.7253 7.27808C11.1312 7.11138 11.3249 6.66172 11.1503 6.27402C10.9758 5.88555 10.5062 5.70051 10.1003 5.86721L4.65018 8.11466C4.33986 8.11313 2.02741 8.08789 1.95012 8.09095C1.77212 8.0963 1.59812 7.92959 1.60012 7.70783C1.60172 7.53042 1.68356 7.42491 1.97508 7.30179C2.65078 7.01579 11.8536 4.16268 14.125 3.57463C14.3393 3.5188 14.4003 3.52569 14.4003 3.52569Z"
                                        fill="white" />
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            <div class="main-header">
                <div class="main-header__container">
                    <div class="main-header__col col-1">
                        <div class="main-header__logo">
                            <NuxtLink to="/">
                                <picture>
                                    <img src="~/assets/img/logo.gif" alt="">
                                </picture>
                            </NuxtLink>
                        </div>
                    </div>
                    <div class="main-header__col col-2">
                        <div class="main-header__btns-wrapper">
                            <div @click="openPopUpMenu('default')"
                                class="main-header__burger-menu burger-menu default-anim" v-anim-hover>
                                <div class="line line-1"></div>
                                <div class="line line-2"></div>
                                <div class="line line-3"></div>
                            </div>
                            <router-link to="/catalog" class="main-header__btn btn-2 default-anim" v-anim-hover>
                                Каталог
                            </router-link>
                        </div>
                        <div class="main-header-search">
                            <ClientOnly>
                                <input type="text" @change="setSearch" v-model="inputSearch"
                                    :placeholder="isDesktop ? 'Поиск народных товаров' : 'Поиск'">
                            </ClientOnly>
                            <div class="main-header-search__icon main-search__js default-anim" v-anim-hover>
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M24 24L19.2779 19.2695M21.8947 12.9474C21.8947 15.3204 20.9521 17.5962 19.2741 19.2741C17.5962 20.9521 15.3204 21.8947 12.9474 21.8947C10.5744 21.8947 8.29858 20.9521 6.62062 19.2741C4.94267 17.5962 4 15.3204 4 12.9474C4 10.5744 4.94267 8.29858 6.62062 6.62062C8.29858 4.94267 10.5744 4 12.9474 4C15.3204 4 17.5962 4.94267 19.2741 6.62062C20.9521 8.29858 21.8947 10.5744 21.8947 12.9474V12.9474Z"
                                        stroke="white" stroke-width="2.5" stroke-linecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="main-header__col col-3">
                        <div class="main-header-user-nav">
                            <div @click="openAuthPopUp" class="main-header-user-nav-item">
                                <img v-if="userAvatar"
                                    :src="`${useRuntimeConfig().public.imgBaseURL}/storage/uploads/users/${userAvatar}`"
                                    alt="avatar" class="main-header-user-nav-item__avatar">
                                <div v-else class="main-header-user-nav-item__body">
                                    <div class="main-header-user-nav-item__icon">
                                        <svg class="person" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M13.9993 14.0007C17.221 14.0007 19.8327 11.389 19.8327 8.16732C19.8327 4.94566 17.221 2.33398 13.9993 2.33398C10.7777 2.33398 8.16602 4.94566 8.16602 8.16732C8.16602 11.389 10.7777 14.0007 13.9993 14.0007Z"
                                                stroke="black" stroke-width="2.3" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                            <path
                                                d="M19.8341 16.334H20.2447C21.0976 16.3342 21.9211 16.6459 22.5605 17.2105C23.1998 17.775 23.611 18.5536 23.7167 19.4L24.1729 23.0447C24.2139 23.373 24.1846 23.7063 24.087 24.0224C23.9894 24.3386 23.8256 24.6304 23.6066 24.8784C23.3876 25.1264 23.1183 25.3251 22.8167 25.4611C22.5151 25.5971 22.1879 25.6674 21.8571 25.6673H6.14439C5.8135 25.6674 5.48638 25.5971 5.18474 25.4611C4.8831 25.3251 4.61384 25.1264 4.39483 24.8784C4.17581 24.6304 4.01206 24.3386 3.91443 24.0224C3.8168 23.7063 3.78753 23.373 3.82856 23.0447L4.28356 19.4C4.38937 18.5532 4.80087 17.7743 5.44069 17.2097C6.08051 16.6451 6.90456 16.3337 7.75789 16.334H8.16739"
                                                stroke="black" stroke-width="2.3" stroke-linecap="square"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="main-header-user-nav-item _active hidden">
                                <a href="#" class="main-header-user-nav-item__body">
                                    <div class="main-header-user-nav-item__icon">
                                        <svg class="comparisons" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M10.4997 25.6663C15.01 25.6663 18.6663 22.01 18.6663 17.4997C18.6663 12.9893 15.01 9.33301 10.4997 9.33301C5.98935 9.33301 2.33301 12.9893 2.33301 17.4997C2.33301 22.01 5.98935 25.6663 10.4997 25.6663Z"
                                                fill="transparent" />
                                            <circle class="circle-1" cx="18.0833" cy="9.91634" r="7.58333"
                                                fill="transparent" />
                                            <circle cx="10.5" cy="17.5" r="7.5" fill="transparent" />
                                            <path class="border"
                                                d="M18.5937 18.5937C22.5867 18.0591 25.6663 14.639 25.6663 10.4997C25.6663 5.98935 22.01 2.33301 17.4997 2.33301C13.3603 2.33301 9.94025 5.41262 9.40565 9.40566M18.6663 17.4997C18.6663 22.01 15.01 25.6663 10.4997 25.6663C5.98935 25.6663 2.33301 22.01 2.33301 17.4997C2.33301 12.9893 5.98935 9.33301 10.4997 9.33301C15.01 9.33301 18.6663 12.9893 18.6663 17.4997Z"
                                                stroke="#1D1D1D" stroke-width="2.3" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <div class="main-header-user-nav-item__count">
                                        12
                                    </div>
                                </a>
                            </div>
                            <div class="main-header-user-nav-item _active hidden">
                                <a href="#" class="main-header-user-nav-item__body">
                                    <div class="main-header-user-nav-item__icon">
                                        <svg class="favorite" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381Z"
                                                fill="transparent" />
                                            <path
                                                d="M14.0008 5.28381C16.7413 2.82331 20.9763 2.90498 23.6165 5.54981C26.2555 8.19581 26.3465 12.4098 23.8918 15.1585L13.9985 25.0658L4.10751 15.1585C1.65285 12.4098 1.74502 8.18881 4.38285 5.54981C7.02535 2.90848 11.2522 2.81981 14.0008 5.28381ZM21.9645 7.19831C20.2145 5.44598 17.3912 5.37481 15.5595 7.01981L14.002 8.41748L12.4433 7.02098C10.6058 5.37364 7.78835 5.44598 6.03368 7.20064C4.29535 8.93898 4.20785 11.7215 5.80968 13.5601L13.9997 21.763L22.1897 13.5613C23.7927 11.7215 23.7052 8.94248 21.9645 7.19831Z"
                                                fill="#1d1d1d" />
                                        </svg>
                                    </div>
                                    <div class="main-header-user-nav-item__count">
                                        1
                                    </div>
                                </a>
                            </div>
                            <div class="main-header-user-nav-item">
                                <template v-if="$route.fullPath === '/order'">
                                    <router-link to="/basket/" class="main-header-user-nav-item__body">
                                        <div class="main-header-user-nav-item__icon">
                                            <svg class="basket" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_766_3440)">
                                                    <path
                                                        d="M4.66631 7.48297L0.882812 3.70064L2.53365 2.0498L6.31598 5.8333H24.0983C24.2802 5.83329 24.4595 5.87579 24.622 5.9574C24.7845 6.03901 24.9257 6.15748 25.0343 6.30335C25.1428 6.44922 25.2158 6.61845 25.2474 6.79754C25.2789 6.97663 25.2682 7.16061 25.216 7.33481L22.416 16.6681C22.3439 16.9086 22.1963 17.1194 21.9949 17.2692C21.7936 17.4191 21.5493 17.5 21.2983 17.5H6.99965V19.8333H19.833V22.1666H5.83298C5.52356 22.1666 5.22681 22.0437 5.00802 21.8249C4.78923 21.6061 4.66631 21.3094 4.66631 21V7.48297ZM6.99965 8.16664V15.1666H20.4303L22.5303 8.16664H6.99965ZM6.41631 26.8333C5.95218 26.8333 5.50706 26.6489 5.17888 26.3207C4.85069 25.9926 4.66631 25.5474 4.66631 25.0833C4.66631 24.6192 4.85069 24.1741 5.17888 23.8459C5.50706 23.5177 5.95218 23.3333 6.41631 23.3333C6.88044 23.3333 7.32556 23.5177 7.65375 23.8459C7.98194 24.1741 8.16631 24.6192 8.16631 25.0833C8.16631 25.5474 7.98194 25.9926 7.65375 26.3207C7.32556 26.6489 6.88044 26.8333 6.41631 26.8333ZM20.4163 26.8333C19.9522 26.8333 19.5071 26.6489 19.1789 26.3207C18.8507 25.9926 18.6663 25.5474 18.6663 25.0833C18.6663 24.6192 18.8507 24.1741 19.1789 23.8459C19.5071 23.5177 19.9522 23.3333 20.4163 23.3333C20.8804 23.3333 21.3256 23.5177 21.6537 23.8459C21.9819 24.1741 22.1663 24.6192 22.1663 25.0833C22.1663 25.5474 21.9819 25.9926 21.6537 26.3207C21.3256 26.6489 20.8804 26.8333 20.4163 26.8333Z"
                                                        fill="black" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_766_3440">
                                                        <rect width="28" height="28" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div
                                            class="main-header-user-nav-item__count bg-green hidden header-total-price__js">
                                        </div>
                                    </router-link>
                                </template>
                                <template v-else>
                                    <div class="main-header-user-nav-item__body open-popup-basket__js">
                                        <div class="main-header-user-nav-item__icon">
                                            <svg class="basket" width="28" height="28" viewBox="0 0 28 28" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_766_3440)">
                                                    <path
                                                        d="M4.66631 7.48297L0.882812 3.70064L2.53365 2.0498L6.31598 5.8333H24.0983C24.2802 5.83329 24.4595 5.87579 24.622 5.9574C24.7845 6.03901 24.9257 6.15748 25.0343 6.30335C25.1428 6.44922 25.2158 6.61845 25.2474 6.79754C25.2789 6.97663 25.2682 7.16061 25.216 7.33481L22.416 16.6681C22.3439 16.9086 22.1963 17.1194 21.9949 17.2692C21.7936 17.4191 21.5493 17.5 21.2983 17.5H6.99965V19.8333H19.833V22.1666H5.83298C5.52356 22.1666 5.22681 22.0437 5.00802 21.8249C4.78923 21.6061 4.66631 21.3094 4.66631 21V7.48297ZM6.99965 8.16664V15.1666H20.4303L22.5303 8.16664H6.99965ZM6.41631 26.8333C5.95218 26.8333 5.50706 26.6489 5.17888 26.3207C4.85069 25.9926 4.66631 25.5474 4.66631 25.0833C4.66631 24.6192 4.85069 24.1741 5.17888 23.8459C5.50706 23.5177 5.95218 23.3333 6.41631 23.3333C6.88044 23.3333 7.32556 23.5177 7.65375 23.8459C7.98194 24.1741 8.16631 24.6192 8.16631 25.0833C8.16631 25.5474 7.98194 25.9926 7.65375 26.3207C7.32556 26.6489 6.88044 26.8333 6.41631 26.8333ZM20.4163 26.8333C19.9522 26.8333 19.5071 26.6489 19.1789 26.3207C18.8507 25.9926 18.6663 25.5474 18.6663 25.0833C18.6663 24.6192 18.8507 24.1741 19.1789 23.8459C19.5071 23.5177 19.9522 23.3333 20.4163 23.3333C20.8804 23.3333 21.3256 23.5177 21.6537 23.8459C21.9819 24.1741 22.1663 24.6192 22.1663 25.0833C22.1663 25.5474 21.9819 25.9926 21.6537 26.3207C21.3256 26.6489 20.8804 26.8333 20.4163 26.8333Z"
                                                        fill="black" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_766_3440">
                                                        <rect width="28" height="28" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div class="main-header-user-nav-item__count bg-green"
                                            :class="{ 'hidden': (cartQuantity < 1) }">
                                            {{ cartQuantity }}
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

</template>

<style scoped>
.main-header__btn {
    font-size: 2rem;
    line-height: 1;
    padding: 1.6rem;

    background-color: var(--white);

    @media only screen and (orientation: portrait) {
        display: none;
    }
}

.main-header__btns-wrapper {
    display: flex;
    gap: 1.6rem;
    align-items: center;
}
</style>