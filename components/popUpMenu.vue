<script>
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from '~/stores/authStore';
export default {
    data() {
        return {
            menuBodyNav: [
                {
                    name: 'Каталог',
                    link: '/catalog/'
                },
            ],
            selectedShop: '',
            isActive: false,
            menuType: 'default',
            avatarImage: '',
        }
    },
    watch: {
        menuType(newValue) {
            if (newValue === 'default') {
                this.menuBodyNav = [
                    {
                        name: 'Каталог',
                        link: '/catalog/'
                    },
                ]
            } else if (newValue === 'person') {
                this.menuBodyNav = [
                    { name: 'Личные данные', link: '/personal-data/' },
                    { name: 'Товары', link: '/my-products/' },
                    { name: 'Заказы', link: '/orders/' },
                    { name: 'Мой магазин', link: '/my-shop/' },
                    { name: 'Мои адреса доставки', link: '/my-delivery-addresses/' },
                    // {name: 'Карта лояльности',link: '/'},
                    // {name: 'Подарочные карты',link: '/'},
                    // {name: 'Сравнение товаров',link: '/'},
                    // {name: 'Избранное',link: '/'},
                ]
            }
        }
    },
    created() {
        if (import.meta.client) {
            window.addEventListener('storage', this.syncSelectedShop);
            document.addEventListener('keydown', this.handleKeydown);
        }
    },
    methods: {
        ...mapActions(useAuthStore, ['logout']),
        openMenu(menuType) {
            this.menuType = menuType
            this.$nextTick(() => {
                this.menuBody();
            })
            this.isActive = true;
            document.body.classList.add('_overflow');
        },
        closeMenu() {
            this.isActive = false;
            document.body.classList.remove('_overflow');
        },
        handleKeydown(e) {
            const ESC = 27;
            if (e.keyCode === ESC) {
                this.closeMenu();
            }
        },
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
        menuBody() {
            const $menuBodyLinks = selectElements('.menu-body-link__js');
            if ($menuBodyLinks.length) {
                $menuBodyLinks.forEach(($link, indx) => {
                    $link.addEventListener('click', () => {
                        this.closeMenu()
                        document.body.classList.remove('_overflow');
                        $link.closest('.menu-body').classList.remove('_active');
                        document.querySelector('.open-menu-body__js').classList.remove('_active');
                        if ($link.closest('.menu-body-nav-body__js')) {
                            $link.closest('.menu-body-nav-body__js').parentElement.classList.remove('_active');
                            $link.closest('.menu-body-nav-body__js').style.height = 0;
                        }
                    })
                });
            }
        },
        toggleMenuBodyItem(e) {
            let $head = e.target.closest('.menu-body-nav-head__js');
            if ($head) {
                let $parent = $head.parentElement;
                let $body = $parent.querySelector('.menu-body-nav-body__js');
                $parent.classList.toggle('_active');
                if ($parent.classList.contains('_active')) {
                    $body.style.height = `${$body.scrollHeight + 1}px`;
                    if (getSiblings($parent).all.length) {
                        getSiblings($parent).all.forEach(($sibling, indx) => {
                            $sibling.querySelector('.menu-body-nav-body__js').style.height = 0;
                            $sibling.classList.remove('_active');
                        })
                    }
                } else {
                    $body.style.height = 0;
                }
            }

        },
        popUpMenuInit() {
            const $closeMenuBody = selectElement('.close-menu-body__js');
            if ($closeMenuBody) {
                $closeMenuBody.addEventListener('click', (e) => {
                    this.closeMenu();
                });
            }
        },
    },
    computed: {
        ...mapState(useAuthStore, ['token', 'isAuthenticated']),
    },
    inject: [
        'configs',
    ],
    mounted() {
        this.getSelectedShop();
        this.popUpMenuInit();
    },
}
</script>
<script setup>
const menuBodyAdditionalNav = ref([]);

const { data } = await useAPI(`/main-menu`)

menuBodyAdditionalNav.value = data.value.data;

defineExpose()

const { userData } = storeToRefs(useAuthStore())
const userAvatar = computed(() => userData.value?.image || '')

</script>
<template>
    <div class="menu-body" :class="{ '_active': isActive }">
        <div class="menu-body__close close-menu-body__js default-anim" v-anim-hover>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

        <div class="menu-body__container">
            <div class="menu-body__content">
                <div class="menu-body-default" v-if="menuType == 'default'">
                    <div class="menu-body-address">
                        <div class="menu-body-address__label">Ваш магазин:</div>
                        <div class="menu-body-address__value change-shop__js">
                            <span>
                                {{ selectedShop }}
                            </span>
                        </div>
                    </div>
                    <nav class="menu-body-nav">
                        <ul class="list-style-none menu-body-nav__list">
                            <template v-for="(item, indx) in menuBodyNav" :key="'menyBodyItem'+indx">
                                <li class="menu-body-nav-item">
                                    <router-link :to="item.link" class="menu-body-nav-item__link menu-body-link__js"
                                        :class="{ '_active': $route.path.indexOf(item.link) === 0 }">{{ item.name
                                        }}</router-link>
                                </li>
                            </template>
                        </ul>
                    </nav>
                    <div class="menu-body-additional-nav">
                        <template v-for="menuCategory in menuBodyAdditionalNav">
                            <div class="menu-body-additional-nav-category__item" @click="toggleMenuBodyItem($event)">
                                <div class="menu-body-additional-nav-category__head menu-body-nav-head__js">
                                    <div class="menu-body-additional-nav-category__label">{{ menuCategory.name }}</div>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12 16.5L18 10.6578L16.5766 9.31564L12 13.8156L7.42335 9.31564L6 10.6578L12 16.5Z"
                                            fill="#1D1D1D" />
                                    </svg>
                                </div>
                                <div class="menu-body-additional-nav-category__body menu-body-nav-body__js">
                                    <div class="menu-body-additional-nav-category__content">
                                        <ul class="list-style-none menu-body-additional-nav__list">
                                            <template v-for="menuItem in menuCategory.tabs">
                                                <li class="menu-body-additional-nav__item">
                                                    <router-link :to="'/' + menuItem.url_page"
                                                        class="menu-body-additional-nav__link menu-body-link__js">
                                                        <span>{{ menuItem.name_menu }}</span>
                                                    </router-link>
                                                </li>
                                            </template>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>
                <div class="menu-body-person" v-if="menuType == 'person'">
                    <div class="menu-body-img-container">
                        <img class="menu-body-img" :src="`${useRuntimeConfig().public.imgBaseURL}/storage/uploads/users/${userAvatar}`"
                            v-if="userAvatar" alt="avatar">
                        <svg class="menu-body-avatar" v-else width="60" height="60"
                            viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink">
                            <rect width="60" height="60" rx="30" fill="#F0F4FC" />
                            <mask id="mask0_209_6773" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0"
                                width="60" height="60">
                                <rect width="60" height="60" rx="30" fill="#0D111A" />
                            </mask>
                            <g mask="url(#mask0_209_6773)">
                                <rect width="60" height="60" fill="url(#pattern0_209_6773)" />
                                <rect width="60" height="60" fill="#0078BE" />
                                <path
                                    d="M54.375 54.2843V57.2367C54.3162 57.8949 54.277 58.5597 54.1855 59.2179C54.1463 59.4851 53.9961 59.7393 53.8981 60H5.99682C5.90536 59.7849 5.73549 59.5764 5.72896 59.3548C5.6767 57.5169 5.58523 55.679 5.64403 53.8477C5.68976 52.5377 6.29735 51.4689 7.37532 50.6086C10.2826 48.308 13.5361 46.7243 17.0902 45.7141C18.7822 45.2318 20.4678 44.7235 22.1534 44.2086C23.0288 43.9414 23.6168 43.4135 23.7409 42.4555C23.7801 42.1622 23.8716 41.8689 23.9565 41.5822C24.0937 41.126 23.9696 40.7936 23.6168 40.4482C22.2383 39.0991 21.2126 37.561 21.0297 35.5602C20.9513 34.7325 20.7291 33.9048 20.4809 33.1097C20.3763 32.7708 20.0366 32.4906 19.7884 32.1973C19.5336 31.8975 19.2004 31.6564 18.9978 31.324C18.73 30.9004 18.5013 30.4311 18.3576 29.9488C18.0309 28.8605 17.7043 27.7656 17.5083 26.6511C17.3645 25.856 17.5475 25.0935 18.4752 24.7546C18.5928 24.7089 18.6908 24.4613 18.6973 24.3049C18.7235 23.7965 18.6908 23.2882 18.7039 22.7864C18.8149 19.6581 19.8406 16.8621 21.8724 14.4638C22.97 13.1669 24.342 12.1958 26.0667 12.0589C27.4191 11.9481 28.7127 11.6614 30.0324 11.4137C32.4693 10.9575 34.7101 11.4398 36.644 13.0495C37.9506 14.1379 38.8848 15.5066 39.5839 17.0381C40.6096 19.2801 41.276 21.6132 41.1257 24.1159C41.1126 24.3375 41.0408 24.5982 41.3674 24.7089C41.9358 24.898 42.2102 25.3542 42.2494 25.9016C42.4193 28.2413 41.6614 30.3008 40.1392 32.0539C39.7668 32.4841 39.4206 32.8816 39.2964 33.4421C39.1984 33.8918 39.0743 34.335 39.009 34.7912C38.8064 36.1794 38.5451 37.548 37.6697 38.7015C37.1927 39.3337 36.657 39.9268 36.1866 40.559C36.0364 40.761 35.9188 41.0673 35.9384 41.3085C35.9776 41.7581 36.1409 42.2013 36.2324 42.651C36.3434 43.2441 36.6897 43.6482 37.2254 43.9023C37.5259 44.0457 37.8265 44.1891 38.1466 44.2868C39.597 44.7431 41.0539 45.1993 42.5173 45.6164C46.3131 46.7048 49.8279 48.3341 52.8658 50.9084C53.4212 51.3776 53.8197 51.9316 53.9961 52.6224C54.1398 53.1699 54.2443 53.7239 54.3685 54.2778L54.375 54.2843Z"
                                    fill="white" />
                            </g>
                            <defs>
                                <pattern id="pattern0_209_6773" patternContentUnits="objectBoundingBox" width="1"
                                    height="1">
                                    <use xlink:href="#image0_209_6773" transform="scale(0.00625)" />
                                </pattern>
                                <image id="image0_209_6773" width="160" height="160"
                                    xlink:href="data:image/jpeg;base64,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" />
                            </defs>
                        </svg>
                    </div>
                    <nav class="menu-body-nav">
                        <ul class="list-style-none menu-body-nav__list">
                            <template v-for="(item, indx) in menuBodyNav" :key="'menyBodyItem'+indx">
                                <li class="menu-body-nav-item">
                                    <router-link :to="item.link" class="menu-body-nav-item__link menu-body-link__js"
                                        :class="{ '_active': $route.path.indexOf(item.link) === 0 }">{{ item.name
                                        }}</router-link>
                                </li>
                            </template>
                            <li class="menu-body-nav-item menu-body-logout-btn" @click="logout">
                                <div class="menu-body-nav-item__link">
                                    Выйти
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="menu-body-contacts">
                    <ul class="list-style-none menu-body-contacts__list">
                        <li class="menu-body-contacts__item">
                            <a :href="'mailto:' + configs['EMAIL']" class="menu-body-contacts__link text-anim">
                                <span>{{ configs['EMAIL'] }}</span>
                                <span>{{ configs['EMAIL'] }}</span>
                            </a>
                        </li>
                        <li class="menu-body-contacts__item">
                            <a :href="'tel:' + configs['TEL_HREF']" class="menu-body-contacts__link tel text-anim">
                                <span>{{ configs['TEL'] }}</span>
                                <span>{{ configs['TEL'] }}</span>
                            </a>
                        </li>
                    </ul>
                    <div class="menu-body-contacts-socials">
                        <ul class="list-style-none menu-body-contacts-socials__list socials-list">
                            <li class="menu-body-contacts-socials__item socials-list-item" v-if="configs['LINK_OK']">
                                <a :href="configs['LINK_OK']" target="_blank" class="socials-list-item__link">
                                    <svg class="ok" width="14" height="22" viewBox="0 0 14 22" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path class="bg"
                                            d="M6.99938 3.56027C8.25646 3.56027 9.279 4.5828 9.279 5.83989C9.279 7.09592 8.2562 8.11845 6.99938 8.11845C5.74309 8.11845 4.72029 7.09592 4.72029 5.83989C4.72003 4.58254 5.74335 3.56027 6.99938 3.56027ZM6.99938 11.3436C10.0359 11.3436 12.5052 8.87507 12.5052 5.83989C12.5052 2.80312 10.0361 0.333496 6.99938 0.333496C3.96314 0.333496 1.49352 2.80339 1.49352 5.83989C1.49352 8.87507 3.96314 11.3436 6.99938 11.3436ZM9.22682 15.8346C10.3595 15.5767 11.4404 15.1291 12.4238 14.5109C12.7859 14.2831 13.0426 13.9208 13.1375 13.5037C13.2325 13.0866 13.1579 12.6489 12.9301 12.2868C12.8174 12.1074 12.6705 11.9519 12.4977 11.8293C12.3249 11.7067 12.1296 11.6193 11.923 11.5722C11.7165 11.5251 11.5026 11.5192 11.2938 11.5548C11.0849 11.5905 10.8851 11.6669 10.7058 11.7798C8.45017 13.1979 5.54702 13.1969 3.29323 11.7798C3.11396 11.6669 2.91418 11.5904 2.70533 11.5548C2.49648 11.5191 2.28265 11.525 2.07608 11.5721C1.86951 11.6192 1.67425 11.7066 1.50148 11.8292C1.32872 11.9519 1.18183 12.1074 1.06922 12.2868C0.841364 12.6488 0.766613 13.0865 0.861404 13.5035C0.956195 13.9206 1.21277 14.2829 1.57469 14.5109C2.55807 15.1289 3.63875 15.5764 4.77116 15.8346L1.69328 18.913C1.39081 19.2156 1.22092 19.6259 1.221 20.0538C1.22107 20.4816 1.3911 20.8919 1.69367 21.1943C1.99625 21.4968 2.40659 21.6667 2.83442 21.6666C3.26225 21.6666 3.67253 21.4965 3.975 21.194L6.99885 18.1696L10.0246 21.1942C10.1742 21.344 10.3518 21.4629 10.5474 21.544C10.743 21.6251 10.9526 21.6668 11.1644 21.6668C11.3761 21.6668 11.5857 21.6251 11.7813 21.544C11.9769 21.4629 12.1546 21.344 12.3042 21.1942C12.4542 21.0446 12.5733 20.8669 12.6545 20.6712C12.7357 20.4755 12.7775 20.2658 12.7775 20.0539C12.7775 19.842 12.7357 19.6322 12.6545 19.4365C12.5733 19.2409 12.4542 19.0631 12.3042 18.9135L9.22682 15.8346Z"
                                            fill="white" />
                                    </svg>
                                </a>
                            </li>
                            <li class="menu-body-contacts-socials__item socials-list-item" v-if="configs['LINK_VK']">
                                <a :href="configs['LINK_VK']" target="_blank" class="socials-list-item__link">
                                    <svg class="vk" width="22" height="13" viewBox="0 0 22 13" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path class="bg" fill-rule="evenodd" clip-rule="evenodd"
                                            d="M21.1769 1.02291C21.3252 0.528458 21.1769 0.165039 20.471 0.165039H18.1372C17.5437 0.165039 17.2703 0.478945 17.1219 0.825193C17.1219 0.825193 15.935 3.71803 14.2536 5.59714C13.7096 6.1411 13.4624 6.31397 13.1657 6.31397C13.0173 6.31397 12.8026 6.1411 12.8026 5.64665V1.02291C12.8026 0.429435 12.6304 0.165039 12.1358 0.165039H8.46824C8.09749 0.165039 7.87444 0.440437 7.87444 0.701498C7.87444 1.26413 8.71496 1.39383 8.80165 2.97619V6.41316C8.80165 7.16667 8.66562 7.30337 8.36888 7.30337C7.5777 7.30337 5.65325 4.39736 4.51165 1.07242C4.28793 0.4261 4.06355 0.165039 3.46707 0.165039H1.13319C0.466372 0.165039 0.333008 0.478945 0.333008 0.825193C0.333008 1.44334 1.12436 4.50939 4.0172 8.56433C5.94598 11.3333 8.66295 12.8347 11.1355 12.8347C12.6192 12.8347 12.8026 12.5012 12.8026 11.9269V9.83396C12.8026 9.16714 12.9431 9.03411 13.4127 9.03411C13.7591 9.03411 14.3524 9.20715 15.7373 10.5423C17.3196 12.1245 17.5804 12.8347 18.4706 12.8347H20.8045C21.4713 12.8347 21.8047 12.5012 21.6123 11.8433C21.4019 11.1874 20.6464 10.2362 19.6438 9.10829C19.0999 8.46531 18.2839 7.77298 18.0368 7.4269C17.6906 6.9818 17.7894 6.78408 18.0368 6.38866C18.0368 6.38866 20.8801 2.38306 21.1769 1.02307V1.02291Z"
                                            fill="white" />
                                    </svg>
                                </a>
                            </li>
                            <li class="menu-body-contacts-socials__item socials-list-item"
                                v-if="configs['LINK_TELEGRAM']">
                                <a :href="configs['LINK_TELEGRAM']" target="_blank" class="socials-list-item__link">
                                    <svg class="tlgm" width="18" height="15" viewBox="0 0 18 15" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path class="bg"
                                            d="M1.19158 6.64746C5.84445 4.57767 8.94709 3.21314 10.4995 2.55386C14.932 0.671499 15.853 0.344513 16.4533 0.333601C16.5853 0.331341 16.8806 0.36475 17.0718 0.523181C17.2333 0.656956 17.2777 0.837668 17.2989 0.964502C17.3202 1.09134 17.3467 1.38027 17.3256 1.60603C17.0854 4.18284 16.0461 10.4361 15.5174 13.3222C15.2936 14.5434 14.8531 14.9528 14.4266 14.9929C13.4997 15.08 12.7959 14.3675 11.8982 13.7666C10.4934 12.8265 9.69983 12.2412 8.33628 11.3237C6.76046 10.2635 7.782 9.68073 8.68006 8.72837C8.91508 8.47913 12.9989 4.68652 13.0779 4.34247C13.0878 4.29944 13.097 4.13905 13.0037 4.05436C12.9103 3.96967 12.7726 3.99863 12.6732 4.02166C12.5323 4.05431 10.2882 5.56876 5.94088 8.565C5.3039 9.0116 4.72694 9.22919 4.21001 9.21779C3.64013 9.20522 2.54391 8.8888 1.72898 8.61833C0.729438 8.28659 -0.0649766 8.1112 0.00419916 7.5478C0.0402301 7.25435 0.436023 6.95423 1.19158 6.64746Z"
                                            fill="white" />
                                    </svg>
                                </a>
                            </li>
                            <li class="menu-body-contacts-socials__item socials-list-item"
                                v-if="configs['LINK_WHATSAPP']">
                                <a :href="configs['LINK_WHATSAPP']" target="_blank" class="socials-list-item__link">
                                    <svg class="wp" width="18" height="18" viewBox="0 0 18 18" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path class="bg"
                                            d="M17.2954 5.15119C16.8404 4.1459 16.1874 3.24334 15.3582 2.46553C14.529 1.69505 13.5678 1.08601 12.4964 0.660409C11.3884 0.220136 10.2143 0 9.00359 0C7.79284 0 6.61877 0.220136 5.51075 0.660409C4.43942 1.08601 3.47816 1.68771 2.64898 2.46553C1.8198 3.24334 1.16674 4.1459 0.711789 5.15119C0.242164 6.19317 0 7.30853 0 8.45324C0 10.4565 0.748456 12.379 2.12064 13.9053L1.38685 17.9044L5.29062 16.1653C6.45734 16.6643 7.69744 16.9138 8.99625 16.9138C10.207 16.9138 11.3811 16.6937 12.4891 16.2534C13.5604 15.8278 14.5217 15.2261 15.3509 14.4483C16.18 13.6705 16.8331 12.7679 17.288 11.7626C17.7577 10.7206 17.9998 9.60528 17.9998 8.46057C18.0072 7.30853 17.765 6.20051 17.2954 5.15119Z"
                                            fill="white" />
                                        <path class="white"
                                            d="M12.6587 10.1405C12.2772 9.94976 11.9983 9.83236 11.8002 9.75898C11.6755 9.71495 11.382 9.58287 11.2792 9.66359C10.9564 9.92775 10.6115 10.6762 10.2446 10.8156C9.33468 10.6395 8.49083 10.0158 7.83042 9.37741C7.5369 9.09857 6.9939 8.30608 6.87649 8.09328C6.85448 7.87314 7.25071 7.57963 7.33877 7.41086C7.79371 6.8972 7.44885 6.57434 7.39014 6.36154C7.28741 6.1414 7.11131 5.74516 6.95722 5.42229C6.82514 5.20949 6.79576 4.89396 6.56094 4.77656C5.56299 4.26291 4.99067 5.29021 4.75585 5.82587C3.33964 9.23799 11.8516 15.732 13.5833 11.2559C13.6714 10.867 13.6347 10.7202 13.5026 10.5441C13.2384 10.3607 12.9302 10.28 12.6587 10.1405Z"
                                            fill="#0078BE" />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>
