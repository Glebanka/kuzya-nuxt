<script>
export default {
    async setup() {
        const { data } = await useGetData('/shops', {
            key: 'shops-data',
        });
        const cities = ref([]);
        const shops = ref([]);

        let citiesArr = data.value.shops;
        let shopsArr = [];
        let keys = Object.keys(citiesArr);
        keys.forEach((key, indx) => {
            let keysShops = Object.keys(citiesArr[key].info);
            keysShops.forEach((keyShops, index) => {
                shopsArr.push({ filter: key, ...citiesArr[key].info[keyShops] })
                if (index === 0) {
                    cities.value.push({ id: key, name: citiesArr[key].city, coords: citiesArr[key].info[keyShops].coords });
                }
            })
        });

        shops.value = shopsArr;

        return {
            shops,
            cities,
        };
    },
    data() {
        return {
            selectedShopItem: {},
            selectbox: null,
        }
    },
    props: {
        title: String,
        hasSelect: Boolean,
        onlyWidget: Boolean,
        modelValue: Object,
    },
    computed: {
        selectedShop: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },
    inject: ['configs'],
    mounted() {
        this.initializeMap();
        this.$nextTick(() => {
            this.nativeJsEvents();
            this.selectbox = new SelectBox('.select-box__js');
            document.addEventListener('keydown', this.handleEscapeBtn);
        });
    },
    unmounted(){
        document.removeEventListener('keydown', this.handleEscapeBtn);
    },
    methods: {
        initializeMap() {
            ymaps.ready(() => {
                const documentWidth = document.documentElement.clientWidth + (window.innerWidth - document.body.offsetWidth);
                const documentHeight = document.documentElement.clientHeight;
                const isDesktop = documentWidth > documentHeight;

                let _center = [54.989342, 73.368212].reverse();
                const _zoom = 7;

                const myMap = new ymaps.Map("shops-map", {
                    center: _center,
                    zoom: _zoom,
                    controls: []
                }, {
                    searchControlProvider: 'yandex#search',
                    yandexMapDisablePoiInteractivity: true
                });

                myMap.controls.remove('routeEditor');
                myMap.controls.add('zoomControl');
                myMap.behaviors.disable('scrollZoom');
                myMap.behaviors.disable('multiTouch');

                const createPlacemark = (coords) => {
                    let metkaSelected;
                    if (Array.isArray(JSON.parse(localStorage.getItem('selectedShop')).coords)) {
                        metkaSelected = JSON.parse(localStorage.getItem('selectedShop')).coords.reverse().map((coords) => {
                            return parseFloat(coords);
                        });
                    } else {
                        metkaSelected = JSON.parse(localStorage.getItem('selectedShop')).coords.split(',').reverse().map((coords) => {
                            return parseFloat(coords);
                        });
                    }
                    return new ymaps.Placemark(coords, {
                        iconCaption: 'поиск...'
                    }, {
                        preset: 'islands#violetDotIconWithCaption',
                        draggable: false,
                        iconLayout: 'default#image',
                        iconImageHref: (metkaSelected[1] === coords[0] && metkaSelected[0] === coords[1]) ? '/img/svg/metka-selected.svg' : '/img/svg/metka.svg',
                        iconImageSize: [38, 40],
                        iconImageOffset: [-19, -20]
                    });
                };

                const placemarks = [];

                const getPos = (pos, metka, index, element) => {
                    const coords = pos;
                    metka = createPlacemark(coords);
                    myMap.geoObjects.add(metka);

                    metka.properties.set('iconCaption', 'поиск...');
                    ymaps.geocode(coords).then((res) => {
                        const firstGeoObject = res.geoObjects.get(0);
                        metka.properties.set({
                            iconCaption: [
                                firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                                firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                            ].filter(Boolean).join(', '),
                            balloonContent: firstGeoObject.getAddressLine()
                        });
                        placemarks.push(metka);

                        metka.events.add('click', (e) => {
                            openShopInfo(element, myMap, metka, index, shops, e);
                        });

                        element.addEventListener('click', (e) => {
                            openShopInfo(element, myMap, metka, index, shops, e);
                        });
                    })
                }

                const openShopInfo = (element, myMap, metka, index, shops, e) => {
                    if (!element.classList.contains('_active')) {
                        setTimeout(() => {
                            myMap.setCenter(metka.geometry._coordinates);
                            myMap.setZoom(12);
                            metka.balloon.open();
                        }, 50);
                    }

                    if (isDesktop) {
                        if (!element.classList.contains('_active')) {
                            element.classList.add('_active');
                            element.classList.remove('hidden');
                            element.querySelectorAll('.our-shops-item__block')[1].style.height = element.querySelectorAll('.our-shops-item__block')[1].scrollHeight + 'px';
                            shops.forEach(($sibling, indx) => {
                                if (indx !== index) {
                                    $sibling.classList.remove('_active');
                                    $sibling.querySelectorAll('.our-shops-item__block')[1].style.height = 0;
                                    $sibling.classList.add('hidden');
                                }
                            });
                        }

                        if (e.target !== undefined) {
                            const $close = e.target.closest('.hide-shops-item__js');
                            if ($close) {
                                element.classList.remove('_active');
                                element.querySelectorAll('.our-shops-item__block')[1].style.height = 0;
                                placemarks[index].balloon.close();
                                shops.forEach(($sibling, indx) => {
                                    if (indx !== index) {
                                        if (document.querySelector('.select-shop-region__js.all').classList.contains('hidden')) {

                                            $sibling.classList.remove('hidden');
                                        } else {
                                            if (document.querySelector('.select-shop-region__js.hidden')) {
                                                if ($sibling.classList.contains(document.querySelector('.select-shop-region__js.hidden').dataset.region)) {
                                                    $sibling.classList.remove('hidden');
                                                }
                                            } else {
                                                $sibling.classList.remove('hidden');
                                            }

                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        element.closest('.our-shops__box').querySelectorAll('.tab-block__js')[0].classList.remove('_active');
                        element.closest('.our-shops__box').querySelectorAll('.select-view__js')[0].classList.remove('_active');
                        element.closest('.our-shops__box').querySelectorAll('.tab-block__js')[1].classList.add('_active');
                        element.closest('.our-shops__box').querySelectorAll('.select-view__js')[1].classList.add('_active');
                        this.selectedShopItem = this.shops[element.getAttribute('data-id')]
                        document.querySelector('.more-info-shop__js').classList.add('_active');
                    }
                }

                const shops = document.querySelectorAll('.cover-shops-item__js');
                if (shops.length) {
                    shops.forEach((element, index) => {
                        const shop = 'placemark' + index;
                        const res = element.getAttribute('data-coords').split(',').reverse().map(parseFloat);
                        getPos(res, shop, index, element);
                    });
                }

                const $regions = document.querySelector('.select-shop-regions__js');
                if ($regions) {
                    $regions.addEventListener('click', (e) => {
                        const $region = e.target.closest('.select-shop-region__js');
                        if ($region) {
                            document.querySelector('.more-info-shop__js').classList.remove('_active');
                            if ($region.classList.contains('all')) {
                                myMap.setZoom(7);
                                myMap.setCenter(_center);
                            } else {
                                if (Array.isArray($region.dataset.coords)) {
                                    myMap.setCenter($region.dataset.coords.reverse());
                                } else {
                                    myMap.setCenter($region.dataset.coords.split(',').reverse());
                                }
                                myMap.setZoom(12);

                            }
                        } else {
                            return false;
                        }
                    });
                }

                const geocode = () => {
                    setTimeout(() => {
                        const request = document.querySelector('.select-shop-region-item._active .select-shop-region-item__city').textContent;
                        ymaps.geocode(request).then((res) => {
                            const obj = res.geoObjects.get(0);
                            let error, hint;
                            if (obj) {
                                switch (obj.properties.get('metaDataProperty.GeocoderMetaData.precision')) {
                                    case 'exact':
                                        break;
                                    case 'number':
                                    case 'near':
                                    case 'range':
                                        error = 'Неточный адрес, требуется уточнение';
                                        hint = 'Уточните номер дома';
                                        break;
                                    case 'street':
                                        error = 'Неполный адрес, требуется уточнение';
                                        hint = 'Уточните номер дома';
                                        break;
                                    case 'other':
                                    default:
                                        error = 'Неточный адрес, требуется уточнение';
                                        hint = 'Уточните адрес';
                                }
                            } else {
                                error = 'Адрес не найден';
                                hint = 'Уточните адрес';
                            }
                            if (error) {
                                console.error(error, hint);
                            } else {
                                myMap.setCenter(obj.geometry._coordinates);
                            }
                        }).catch((e) => {
                            console.error(e);
                        });
                    }, 10);
                };
            });
        },
        nativeJsEvents() {
            const isDesktop = useVars().isDesktop.value
            const $selectCities = selectElement('.select-shop-regions__js');
            const $list = selectElements('.cover-shops-item__js');
            if ($selectCities) {
                $selectCities.addEventListener('click', (e) => {
                    let $city = e.target.closest('.select-shop-region__js');
                    if ($city) {
                        if ($list.length) {
                            $list.forEach(($item, indx) => {
                                if ($city.classList.contains('all')) {
                                    $item.classList.remove('hidden');
                                    $item.classList.add('no_hidden');
                                } else {
                                    if ($item.classList.contains($city.dataset.region)) {
                                        $item.classList.remove('hidden');
                                        $item.classList.add('no_hidden');
                                    } else {
                                        $item.classList.add('hidden');
                                        $item.classList.remove('no_hidden');
                                    }
                                    if ($item.classList.contains('_active')) {
                                        if (isDesktop) {
                                            $item.classList.remove('_active');
                                            $item.querySelectorAll('.our-shops-item__block')[1].style.height = 0;

                                        }
                                    }
                                }

                            });
                        }
                    } else {
                        return;
                    }
                });
            }

            const $tabs = selectElement('.our-shops-tabs__js');
            const $tabsBlocks = selectElements('.tab-block__js')
            if ($tabs && !isDesktop) {
                $tabs.addEventListener('click', (e) => {
                    let $tab = e.target.closest('.select-view__js');
                    if ($tab) {
                        let indx = getIndex($tab, $tab.parentElement.querySelectorAll('.select-view__js'))
                        $tab.classList.add('_active');
                        siblingsClass($tab, { remove: '_active' });

                        if ($tabsBlocks[indx]) {
                            setClass($tabsBlocks, { remove: '_active' });
                            $tabsBlocks[indx].classList.add('_active');
                            if (indx === 0) {
                                selectElement('.more-info-shop__js').classList.remove('_active');
                            }
                        }
                    } else {
                        return;
                    }
                });
            }
        },
        handleEscapeBtn(e) {
            if (e.key === 'Escape') {
                this.selectbox.close();
            }
        },
        // init(){
        //     let selectShopBtn = document.selectElement('selectShopBtn__js');
        //     selectShopBtn.addEventListener('click',{
        //         this.selectedShop = shop;
        //     })
        // }
    },
}
</script>


<template>
    <section class="our-shops">
        <div class="our-shops__container" :class="{ container: !onlyWidget }">
            <h1 class="our-shops__title anim-item anim-item-active">{{ title }}</h1>
            <div :class="{ 'grey-container our-shops__content': !onlyWidget }">
                <div class="our-shops__box anim-item" v-anim-scroll>
                    <div class="our-shops__block">
                        <div class="our-shops__head">
                            <div class="our-shops__select select-box select-box__js select-shop-regions__js">
                                <div class="select-box__head">
                                    <div class="select-box__label">Выберите ваш район</div>
                                </div>
                                <div class="select-box__body">
                                    <div class="select-box__content">
                                        <ul class="list-style-none select-box__list">
                                            <li class="select-box-item__js select-shop-region__js all hidden"><span>Все
                                                    районы</span></li>
                                            <li v-for="city in cities" :key="'contacts-city' + city.id"
                                                class="select-box-item__js select-shop-region__js"
                                                :data-coords="city.coords" :data-region="'filterCity-' + city.id">
                                                <span v-html="city.name">
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="our-shops__tabs our-shops-tabs__js">
                                <div class="our-shops__tab-head tab-head">
                                    <div
                                        class="our-shops__tab-item tab-item select-view__js btn-border default-anim _active">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M8.40057 7.1999H15.6006M8.40057 10.7999H15.6006M8.40057 14.3999H12.0006M6.60029 2.3999H17.4005C18.726 2.3999 19.8005 3.47445 19.8005 4.79995L19.8002 19.2C19.8002 20.5254 18.7257 21.5999 17.4002 21.5999L6.60019 21.5998C5.2747 21.5998 4.20019 20.5253 4.2002 19.1998L4.20029 4.79989C4.2003 3.47441 5.27481 2.3999 6.60029 2.3999Z"
                                                stroke="white" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        Списком
                                    </div>
                                    <div class="our-shops__tab-item tab-item select-view__js btn-border default-anim">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M3.22915 5.66667L18.4297 20.5065M3.22915 5.66667C3.7947 5.021 4.63942 4.61111 5.58316 4.61111H10.7218M3.22915 5.66667C2.77429 6.18596 2.5 6.85777 2.5 7.5915V18.5196C2.5 20.1656 3.88038 21.5 5.58316 21.5H16.8881C18.5909 21.5 19.9713 20.1656 19.9713 18.5196V14.049M10.7218 14.049L4.04158 20.5065M18.0057 5.87778V5.81428M21.5 5.80435C21.5 8.00725 18.0057 10.9444 18.0057 10.9444C18.0057 10.9444 14.5115 8.00725 14.5115 5.80435C14.5115 3.97941 16.0759 2.5 18.0057 2.5C19.9356 2.5 21.5 3.97941 21.5 5.80435Z"
                                                stroke="#1D1D1D" stroke-width="2" stroke-linecap="round"
                                                stroke-linejoin="round" />
                                        </svg>
                                        На карте
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="our-shops__list our-shops__tab-block tab-block__js _active">
                            <div v-for="(shop, index) in shops" :key="index"
                                class="select-shop-region-item our-shops-item cover-shops-item__js"
                                :class="'filterCity-' + [shop.filter]" :data-coords="shop.coords" :data-id="index">
                                <SelectShopItem :shop="shop" v-model="selectedShop"></SelectShopItem>
                            </div>
                        </div>
                    </div>
                    <div class="our-shops__block our-shops__tab-block tab-block__js">
                        <div class="our-shops__map" id="shops-map">
                        </div>
                        <div class="select-shop-region-item our-shops-item more-info-shop more-info-shop__js">
                            <SelectShopItem v-if="selectedShopItem" :shop="selectedShopItem" v-model="selectedShop">
                            </SelectShopItem>
                        </div>
                    </div>
                </div>

                <template
                    v-if="(configs['CONTACT_EMAIL'] || configs['TEL_HOT'] || configs['LINK_TELEGRAM'] || configs['LINK_WHATSAPP']) && !onlyWidget">
                    <div class="our-shops-contacts">

                        <template v-if="configs['CONTACT_EMAIL']">
                            <div class="our-shops-contact">
                                <div class="our-shops-contact__items">
                                    <div class="our-shops-contact__item">
                                        <div class="our-shops-contact__label">Написать на почту</div>
                                        <div class="our-shops-contact__value">
                                            <a :href="'mailto:' + configs['CONTACT_EMAIL']">
                                                {{ configs['CONTACT_EMAIL'] }}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-if="configs['TEL_HOT'] || configs['LINK_TELEGRAM'] || configs['LINK_WHATSAPP']">
                            <div class="our-shops-contact">
                                <div class="our-shops-contact__items">

                                    <template v-if="configs['TEL_HOT']">
                                        <div class="our-shops-contact__item">
                                            <div class="our-shops-contact__label">Телефон горячей линии:</div>
                                            <div class="our-shops-contact__value">
                                                <a :href="'tel:' + configs['TEL_HOT_HREF']">
                                                    {{ configs['TEL_HOT'] }}
                                                </a>
                                            </div>
                                        </div>
                                    </template>

                                    <template v-if="configs['LINK_WHATSAPP'] || configs['LINK_TELEGRAM']">
                                        <div class="our-shops-contact__item">
                                            <div class="our-shops-contact__label">Чат в мессенджере</div>
                                            <div class="our-shops-contact__value">
                                                <template v-if="configs['LINK_WHATSAPP']">
                                                    <a :href="configs['LINK_WHATSAPP']">
                                                        <div>
                                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M0 18L1.26525 13.3777C0.484499 12.0247 0.0742498 10.491 0.0749998 8.91823C0.0772498 4.00124 4.07849 0 8.99473 0C11.3805 0.000749998 13.62 0.929998 15.3045 2.61599C16.9882 4.30199 17.9152 6.54299 17.9145 8.92648C17.9122 13.8442 13.911 17.8455 8.99473 17.8455C7.50223 17.8447 6.03149 17.4705 4.72874 16.7595L0 18ZM4.94774 15.1447C6.20474 15.891 7.40473 16.338 8.99173 16.3387C13.0777 16.3387 16.4062 13.0132 16.4085 8.92498C16.41 4.82849 13.0972 1.5075 8.99773 1.506C4.90874 1.506 1.5825 4.83149 1.581 8.91898C1.58025 10.5877 2.06925 11.8372 2.89049 13.1445L2.14125 15.8805L4.94774 15.1447ZM13.488 11.0467C13.4325 10.9537 13.284 10.8982 13.0605 10.7865C12.8377 10.6747 11.742 10.1355 11.5372 10.0612C11.3332 9.98698 11.1847 9.94948 11.0355 10.173C10.887 10.3957 10.4595 10.8982 10.3297 11.0467C10.2 11.1952 10.0695 11.214 9.84673 11.1022C9.62398 10.9905 8.90548 10.7557 8.05423 9.99598C7.39198 9.40498 6.94423 8.67523 6.81448 8.45173C6.68473 8.22898 6.80098 8.10823 6.91198 7.99723C7.01248 7.89748 7.13473 7.73698 7.24648 7.60648C7.35973 7.47748 7.39648 7.38448 7.47148 7.23523C7.54573 7.08673 7.50898 6.95623 7.45273 6.84449C7.39648 6.73349 6.95098 5.63624 6.76573 5.18999C6.58424 4.75574 6.40049 4.81424 6.26399 4.80749L5.83649 4.79999C5.68799 4.79999 5.44649 4.85549 5.24249 5.07899C5.03849 5.30249 4.46249 5.84099 4.46249 6.93823C4.46249 8.03548 5.26124 9.09523 5.37224 9.24373C5.48399 9.39223 6.94348 11.6437 9.17923 12.609C9.71098 12.8385 10.1265 12.9757 10.4497 13.0785C10.9837 13.248 11.4697 13.224 11.8537 13.167C12.282 13.1032 13.1722 12.6277 13.3582 12.1072C13.5442 11.586 13.5442 11.1397 13.488 11.0467Z"
                                                                    fill="#1D1D1D" />
                                                            </svg>
                                                        </div>
                                                        whatsapp
                                                    </a>
                                                </template>
                                                <template v-if="configs['LINK_TELEGRAM']">
                                                    <a :href="configs['LINK_TELEGRAM']">
                                                        <div>
                                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                                                                xmlns="http://www.w3.org/2000/svg">
                                                                <path
                                                                    d="M16.6223 1.17331C16.2956 1.09674 15.9242 1.1088 15.4692 1.22666C12.8328 1.90972 2.3531 5.16504 1.4907 5.5298C0.550811 5.92725 0.00845953 6.62752 8.93432e-05 7.54631C-0.0110709 8.7748 1.02485 9.73919 2.25014 9.69789C2.28956 9.69703 3.80564 9.71683 4.66894 9.72543C4.66894 9.72543 5.43954 13.4083 5.45817 13.4522C5.68309 13.9804 6.21068 14.1378 6.66582 13.9477L9.2253 12.8715C9.51501 13.1442 11.463 14.9431 11.6722 15.1039C12.2955 15.5823 12.8342 15.7328 13.5004 15.7492C14.5729 15.7758 15.5099 15.1728 16.0035 14.1895C16.3134 13.5726 17.7577 4.93449 17.888 4.07764C18.0949 2.71753 18.0481 2.18329 17.4661 1.63013C17.2321 1.40817 16.9491 1.24901 16.6223 1.17331ZM16.2004 2.8414C16.2004 2.8414 16.2441 2.99367 16.116 3.83503C15.6578 6.84776 14.572 13.0117 14.3442 13.5167C14.1885 13.8625 13.8767 14.0372 13.5285 14.0277C13.222 14.02 13.0695 13.9684 12.7972 13.7593C12.6572 13.6518 12.0271 13.0797 11.1378 12.2529C11.1267 12.2426 9.36426 10.5986 9.36426 10.5986C9.19245 10.4352 9.03098 10.3379 8.69267 10.3345C8.49592 10.3345 8.23627 10.4773 8.23627 10.4773L6.88281 11.5725L6.41273 9.37529L12.0659 7.06284C12.5226 6.8753 12.7405 6.36944 12.5441 5.93327C12.3478 5.49624 11.8195 5.28807 11.3628 5.47561L5.23146 8.00399C4.88234 8.00227 2.28083 7.97388 2.19389 7.97732C1.99363 7.98334 1.79788 7.79579 1.80013 7.54631C1.80193 7.34672 1.894 7.22802 2.22197 7.08952C2.98213 6.76777 13.3353 3.55802 15.8907 2.89646C16.1317 2.83365 16.2004 2.8414 16.2004 2.8414Z"
                                                                    fill="#1D1D1D" />
                                                            </svg>
                                                        </div>
                                                        telegram
                                                    </a>
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>

                    </div>
                </template>

            </div>
        </div>
    </section>
</template>

<style scoped></style>
