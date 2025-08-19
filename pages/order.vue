<script setup>
import useVuelidate from '@vuelidate/core';
import { required, requiredIf, minLength, email, sameAs } from '@vuelidate/validators';
import { useIMask } from 'vue-imask';

const form = reactive({
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
        'В кредит',
        'QR-код',
    ],
    selectedPay: 'Картой онлайн',
    privacy_policy: false,
})
const rules = computed(() => ({
    name: {
        required,
        minLength: minLength(2),
    },
    surname: {
        required,
        minLength: minLength(2),
    },
    phone: {
        required,
        minLength: minLength(16),
    },
    email: {
        required,
        email,
    },
    comment: {
        minLength: minLength(2),
    },
    delivery: {
        detailAddress: {
            flat: {
                required: requiredIf(() => form.delivery.isDelivery && !form.delivery.detailAddress.privateHome),
            },
            floor: {
                required: requiredIf(() => form.delivery.isDelivery && !form.delivery.detailAddress.privateHome),
            },
        }
    },
    privacy_policy: {
        required,
        sameAs: sameAs(true),
    },
}))

const v$ = useVuelidate(rules, form)

const { data } = await useGetData('/pages', {
    params: { url_page: '/order' },
    key: 'order-page-data'
});
const breadcrumbs = ref([]);
breadcrumbs.value = [{ 'Корзина': '/basket' }, { [data.value.data.breadcrumbs]: '' }];
const aboutPage = ref(data.value?.data || []);
useSeoMeta(useMetaTags(data.value));


const { removeItemsFromCart, updateCartProducts } = useCartStore();
const { validItems: products, validTotal } = storeToRefs(useCartStore());

const totalPrice = computed(() => {
    // если выбрана доставка то прибавляем 5000 к стоимости
    const deliverySurcharge = form.delivery.isDelivery ? 5000 : 0
    return validTotal.value + deliverySurcharge
})

const { isDesktop } = useVars()

const { el: phoneInput, masked: maskedPhoneValue } = useIMask({
    mask: '+{7}(000)000-00-00',
});
watch(maskedPhoneValue, (newVal) => {
    form.phone = newVal
})


const isFormSend = ref(false)
const isActiveTimeSelect = ref(false)
const deliveryTimes = ref([]);

watch(() => form.name, (val) => {
    form.name = val.replace(/\d/ig, '')
})
watch(() => form.surname, (val) => {
    form.surname = val.replace(/\d/ig, '')
})

const userAddresses = ref([]);

useGetUserData(getUserData);
onMounted(() => {
    init()
    document.addEventListener('scroll', scrollHandler);
})
onBeforeUnmount(() => {
    document.removeEventListener('scroll', scrollHandler);
});




async function formSubmit(e) {
    e.preventDefault();
    if (isFormSend.value === false) {
        const isDelivery = form.delivery.isDelivery;

        const detailAddress = !isDelivery ? {
            date: '',
            time: '',
            flat: '',
            floor: '',
            needMovers: false,
            privateHome: false,
        } : form.delivery.detailAddress;

        const newFormDate = {
            user_id: getUserIdFromToken(useAuthStore().token),
            name: form.name,
            surname: form.surname,
            phone: form.phone,
            email: form.email,
            isDelivery: isDelivery,
            address: (isDelivery) ? form.delivery.address : form.noDelivery.address,
            detailAddress: detailAddress,
            comment: form.comment,
            selectedPay: form.selectedPay,
            products: products.value,
        };

        if (!v$.value.$invalid) {
            if (products.value.length <= 0) {
                useRouter().push('/')
                return;
            }
            isFormSend.value = true;
            v$.value.$touch();
            try {
                const response = await useNuxtApp().$apiFetch('/basket-form', {
                    method: 'POST',
                    body: { 'basket': JSON.stringify(newFormDate) },
                });
                if (response.success) {
                    removeItemsFromCart(products.value)
                    window.location.href = `${response.redirect}`;
                }
                isFormSend.value = false;
            } catch (error) {
                console.error('Ошибка запроса:', error);
                setTimeout(() => {
                    isFormSend.value = false;
                }, 50);
            }
        } else {
            v$.value.$touch();
            setTimeout(() => {
                let offsetError = document.querySelector('.has-error');
                if (offsetError) {

                    if (newFormDate.address === '') {
                        alert('Укажите адрес доставки');
                    } else {
                        $('html,body').stop().animate({ scrollTop: (getCoords(offsetError).top - 300) }, 1000);
                    }
                }
            }, 10);
        }
    }
}

function init() {
    updateCartProducts();
    let shopAddress = JSON.parse(localStorage.getItem('selectedShop'));
    if (shopAddress) {
        form.noDelivery.address = shopAddress.address;
    }
    imgCheck()

    initGetParameters()

    // календарь отключен
    // orderPageInitFunctions()

    // яндекс карта
    setTimeout(() => {
        ymapsInit()
    }, 100)
}

function getUserData() {
    const { userData, isAuthenticated } = useAuthStore();
    if (isAuthenticated) {
        form.name = userData.name;
        form.surname = userData.surname;
        form.email = userData.email;
        maskedPhoneValue.value = userData.phone;
        userAddresses.value = userData.delivery_addresses;
        setDeliveryAddress(userData.delivery_addresses[0])
    }
}
function imgCheck() {
    let imgs = selectElements('.your-order-item__img img');

    imgs.forEach((img, index) => {
        img.addEventListener('error', (e) => {
            products.value[index].json_imgs = null
        });
    });
}
function initGetParameters() {
    if (useRoute().query.installment && totalPrice.value > 3000 && totalPrice.value < 50000) {
        form.selectedPay = form.pay[2];
    }
}
function orderPageInitFunctions() {
    const setDate = (date) => {
        form.delivery.detailAddress.date = date;
    }

    const $calendar = selectElement('.vanilla-calendar');

    let startDay = new Date();
    startDay.setDate(startDay.getDate() + 1)
    let endDay = new Date();
    endDay.setMonth(endDay.getMonth() + 1);
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
                    min: startDay.getFullYear() + '-' + (startDay.getMonth() + 1 < 10 ? '0' + (startDay.getMonth() + 1) : (startDay.getMonth() + 1)) + '-' + (startDay.getDate() < 10 ? '0' + startDay.getDate() : startDay.getDate()),
                    max: endDay.getFullYear() + '-' + (endDay.getMonth() + 1 < 10 ? '0' + (endDay.getMonth() + 1) : (endDay.getMonth() + 1)) + '-' + (endDay.getDate() < 10 ? '0' + endDay.getDate() : endDay.getDate()),
                    // values: ['2023-02-16', '2022-02-17'],
                },
            },
            actions: {
                clickDay(e, dates) {
                    let currentDate = new Date(dates[0]);
                    if (currentDate.getDate()) {
                        setDate(`${(currentDate.getDate() < 10) ? '0' + currentDate.getDate() : currentDate.getDate()}.${(currentDate.getMonth() + 1) < 10 ? '0' + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1)}.${currentDate.getFullYear()}`)
                    } else {
                        setDate('');
                    }
                    $calendar.classList.remove('_active');
                },
                clickMonth(e, month) {
                    console.log(`Current month: ${month}`);
                },
                clickYear(e, year) {
                    console.log(`Current year: ${year}`);
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
        },
        );
        calendar.init();

        if (calendarInfoDate) {
            calendarInfoDate.addEventListener('click', () => {
                $calendar.classList.toggle('_active');
            });
        }

        const $dateTime = selectElement('.select-time__js');
        if ($dateTime) {
            let _date = new Date();
            _date.setHours($dateTime.dataset.timeFrom);
            let i = 0;
            let count = (((+$dateTime.dataset.timeTo - +$dateTime.dataset.timeFrom) * 60) / +$dateTime.dataset.timeStep);
            for (let index = +$dateTime.dataset.timeFrom; index <= count + +$dateTime.dataset.timeFrom; index++) {
                let newTime = new Date(_date);
                newTime.setMinutes(+$dateTime.dataset.timeStep * i);
                i++;
                // let $times = document.createElement('li');
                // $dateTime.querySelector('.select-box__list').insertAdjacentElement('beforeEnd', $times);
                // $times.classList.add('select-box-item__js');
                // if (new Date() > newTime) {
                // 	$times.classList.add('hidden');
                // }
                deliveryTimes.value.push({ time: `${newTime.getHours()}:${newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes()}`, isHidden: new Date() > newTime ? '' : '' });
                // $times.innerHTML = `<span>${newTime.getHours()}:${newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes()}</span>`
            }
        }

        document.addEventListener('mouseup', (e) => {
            if ($dateTime.contains(e.target) === false) {
                isActiveTimeSelect.value = false;
            }
        });

        let ESC = 27;
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === ESC) {
                isActiveTimeSelect.value = false;
            }
        });
    }

}
function ymapsInit() {
    if (selectElement('.popup-map__map ymaps')) {
        selectElement('.popup-map__map ymaps').remove();
    }
    ymaps.ready(mapInit);

    const setAddressCity = (address) => {
        form.noDelivery.address = address;
    }

    const $selectShopPopup = selectElement('.select-shop');
    if ($selectShopPopup) {
        $selectShopPopup.addEventListener('click', (e) => {
            let $selectShop = e.target.closest('.select-shop__js');
            if ($selectShop) {
                setAddressCity($selectShop.closest('.select-shop-region-item').querySelector('.select-shop-region-item__city').textContent);
            }
        })
    }
    function mapInit() {
        // Создание карты.
        const $selectAddress = document.querySelector('.popup-map-select-address__js');

        let city = 'Омская область';

        let myProvider = {
            suggest: (function (request, options) {
                return ymaps.suggest(city + ", " + request)
            })
        };

        let suggestView1 = new ymaps.SuggestView('inputMapAddress', {
            provider: myProvider,
            boundedBy: [
                [54.989342, 73.368212]
            ],
        });

        let pos;
        let _center = [54.920729, 71.266576].reverse();
        let _zoom = 12;
        let isMetka = false;
        let popupAddress = document.querySelector('.popup-map-address');
        var myPlacemark,
            myMap = new ymaps.Map("map-user", {
                center: _center,
                zoom: _zoom,
                controls: [],
            }, {
                searchControlProvider: 'yandex#search',
                yandexMapDisablePoiInteractivity: true,
                hideIconOnBalloonOpen: false
            });

        myMap.controls.remove('routeEditor');
        myMap.controls.add('zoomControl');
        myMap.behaviors.disable('multiTouch');

        function selectAddress() {
            if ($selectAddress) {
                $selectAddress.style.width = `${$selectAddress.scrollWidth}px`;
            }
        }

        const setAddress = (address) => {
            form.delivery.address = address;
        }

        myMap.events.add('click', function (e) {
            let coords = e.get('coords');
            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords);

            } else {
                myPlacemark = createPlacemark(coords);
                myMap.geoObjects.add(myPlacemark);
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates());
                });
            }
            selectAddress();
            pos = coords;
            myPlacemark.events.add('click', function (e) {
                popupAddress.classList.add('_active');
            })

            function openPopupAddres() {
                popupAddress.classList.add('_active');
            }

            isMetka = true;
            getAddress(coords);
        })

        suggestView1.events.add('select', function (e) {
            geocode();
            isMetka = true;

            setAddress(e.originalEvent.item.value);
            selectAddress();
        })

        document.querySelector('.map-search__js').addEventListener('click', () => {
            geocode();

            let street = document.querySelector('.input-map-address__js').value;

            myMap.setZoom(16);
            isMetka = true;
        })

        document.querySelector('.input-map-address__js').addEventListener('change', (e) => {
            geocode();

            let street = e.currentTarget.value;
            setAddress(street);

            myMap.setZoom(16);
            isMetka = true;
        })

        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#violetDotIconWithCaption',
                draggable: false,
                // Необходимо указать данный тип макета.
                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                // iconImageHref: '/img/icons/metka.svg',
                // Размеры метки.
                iconImageSize: [48, 60],
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                iconImageOffset: [-20, -60],
                hasBalloon: false,
            }, {
                hideIconOnBalloonOpen: false,
                balloonCloseButton: false,
            });
        }
        let placemarks = [];
        let idPlacemark = 0;

        function getPos(pos, metka, index, element) {
            var coords = pos;
            metka = createPlacemark(coords);
            myMap.geoObjects.add(metka);
            // Слушаем событие окончания перетаскивания на метке.
            metka.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                metka.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() :
                                firstGeoObject.getAdministrativeAreas(),
                            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: ``
                    });
                placemarks.push(metka)
            });
        }


        function geocode() {
            setTimeout(() => {
                let request = 'Омск, ' + document.querySelector('.input-map-address__js').value;
                ymaps.geocode(request).then(function (res) {
                    var obj = res.geoObjects.get(0),
                        error, hint;
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
                    if (error) { } else {
                        myMap.setCenter(obj.geometry._coordinates)
                        if (myPlacemark) {
                            myPlacemark.geometry.setCoordinates(obj.geometry._coordinates);

                        } else {
                            myPlacemark = createPlacemark(obj.geometry._coordinates);
                            myMap.geoObjects.add(myPlacemark);
                            myPlacemark.events.add('dragend', function () {
                                getAddress(myPlacemark.geometry.getCoordinates());
                            });
                        }
                        getAddress(obj.geometry._coordinates);
                        myPlacemark.events.add('click', function (e) {
                            setTimeout(() => {
                                popupAddress.classList.add('_active');

                            }, 150);
                        })
                        selectAddress();
                        function openPopupAddres() {
                            popupAddress.classList.add('_active');
                        }
                    }
                    myMap.setCenter(obj.geometry._coordinates);
                }, function (e) { })
            }, 10);

        }

        const changeAddressBtns = document.querySelectorAll('.change-address__js');
        changeAddressBtns.forEach(btn => btn.addEventListener('click', () => {
            document.querySelector('.popup-map').classList.add('_active');
            // ставим радиобатон "Новый адрес" активным 
            document.querySelector('#radio-user-address-new').checked = true;
            document.body.classList.add('_overflow');
            geocode();
        }))

        if ($selectAddress) {
            $selectAddress.addEventListener('click', () => {
                $selectAddress.style.width = 0;
            })

            document.querySelector('.popup-map .popup-map__close').addEventListener('click', () => {
                $selectAddress.style.width = 0;
            })
        }

        function getAddress(coords) {
            myPlacemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                myPlacemark.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject
                                .getLocalities() :
                                firstGeoObject.getAdministrativeAreas(),
                            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
                if (isMetka) {
                    // $('#mapPersonAddressInput').val(firstGeoObject.properties._data.text);

                }
                // $('.about-order__address').find('.about-order__item__value span').text(firstGeoObject.properties._data.text);
                document.querySelector('.popup-map__address input').value = firstGeoObject.properties._data.text;
                // if (document.querySelectorAll('.map-address__js').length) {
                // 	document.querySelectorAll('.map-address__js').forEach(($item, indx) => {
                // 		let spans = $item.querySelectorAll('span');
                // 		if (spans.length) {
                // 			spans.forEach(span => {
                // 				span.textContent = firstGeoObject.properties._data.text;
                // 			})
                // 		}

                // 		let $input = $item.querySelector('input');
                // 		if ($input) {
                // 			$input.value = firstGeoObject.properties._data.text;
                // 		}
                // 	})
                // }
                popupAddress.querySelector('.popup-map-address__value').textContent = firstGeoObject.properties._data.text;
                myMap.setCenter(myPlacemark.geometry._coordinates);
                myMap.setZoom(16);
                setAddress(firstGeoObject.properties._data.text);
            });
        }

        popupAddress.querySelector('.close-popup-address__js').addEventListener('click', (e) => {
            popupAddress.classList.remove('_active');
            $selectAddress.style.width = 0;
        });

        popupAddress.querySelector('.select-address__js').addEventListener('click', (e) => {
            document.querySelector('.map-address__js span').textContent = popupAddress.querySelector('.popup-map-address__value').textContent;
            setAddress(popupAddress.querySelector('.popup-map-address__value').textContent);
            popupAddress.classList.remove('_active');
            popupAddress.closest('.popup').classList.remove('_active');
            $body.classList.remove('_overflow');
        });
    }
}

const scrollPosition = ref(0);

function scrollHandler() {
    const parentElem = document.querySelector('.make-order__block.block-2');
    const sidebarElem = parentElem.querySelector('.make-order__block-body');

    if (!isDesktop) return;

    const parentRect = parentElem.getBoundingClientRect();
    const sidebarRect = sidebarElem.getBoundingClientRect();
    const scrollY = window.scrollY;

    // Фиксируем сайдбар к верху
    const stickToTop = () => {
        sidebarElem.classList.add('sticky-top');
    };

    // Фиксируем сайдбар выше экрана
    const stickAboveScreen = () => {
        const topValue = scrollY > parentRect.height
            ? parentRect.height - sidebarRect.height : scrollY - sidebarRect.height;

        sidebarElem.style.top = `${topValue}px`;
    };

    // Отлепляем сайдбар от верха, даём ему свободно двигаться
    const releaseFromTop = () => {
        sidebarElem.classList.remove('sticky-top');
        sidebarElem.style.top = `${scrollY}px`;
    };

    // Если текущая прокрутка меньше предыдущей — скроллим вверх
    if (scrollY < scrollPosition.value) {
        // Если скроллим вверх и сайдбар полностью ушёл вверх за пределы экрана — фиксируем его в позиции выше текущего скролла (экраном выше)
        if (sidebarRect.bottom < 0) {
            stickAboveScreen();
        }
        // Если верх экрана достиг верхней границы сайдбара — фиксируем его наверху экрана
        else if (sidebarRect.top > 0) {
            stickToTop();
        }
    } else {
        // Если скроллим вниз и сайдбар приклеен к верху — отпускаем его
        if (sidebarRect.top === 0) {
            releaseFromTop();
        }
    }
    // сохраняем предыдущую позицию скролла
    scrollPosition.value = window.scrollY;
}



function selectDelivery() {
    form.delivery.isDelivery = true;
    form.noDelivery.isNoDelivery = false;
}
function selectNoDelivery() {
    form.noDelivery.isNoDelivery = true;
    form.delivery.isDelivery = false;
}
function toggleSelectTime() {
    isActiveTimeSelect.value = !isActiveTimeSelect.value;
}
function selectTime(time) {
    form.delivery.detailAddress.time = time;
    isActiveTimeSelect.value = false;
}
function setDeliveryAddress(addressObj) {
    form.delivery.address = addressObj.address;
    form.delivery.detailAddress.flat = addressObj.flat;
    form.delivery.detailAddress.floor = addressObj.floor;
}
</script>
<template>
    <main class="main order-page">
        <section class="make-order m-b-0">
            <div class="make-order__container container">
                <form class="make-order-form" @submit.prevent="formSubmit" :class="{ '_send': isFormSend }">
                    <div class="make-order__block block-1">
                        <div class="make-order__block-body">
                            <Breadcrumbs v-if="breadcrumbs" :breadcrumbs="breadcrumbs"></Breadcrumbs>
                            <h1 class="make-order__title anim-item anim-item-active">{{
                                aboutPage.headline }}</h1>
                            <div class="make-order-form-block">
                                <div class="make-order-form-block__title">Получатель</div>
                                <div class="make-order-form__item form-item input"
                                    :class="{ 'has-success': (!v$.name.$error && !v$.name.required.$invalid && !v$.name.minLength.$invalid), 'has-error': (v$.name.$error) || (v$.name.minLength.$invalid) }">
                                    <label for="" class="form-label">Имя *</label>
                                    <div class="form-item__body">
                                        <input type="text" class="make-order-form__input form-input"
                                            v-model.trim="form.name" placeholder="Ваше имя">
                                        <div class="helper-block" v-if="v$.name.minLength.$invalid">
                                            Минимальное количетсво символов 2
                                        </div>
                                        <div class="helper-block" v-if="(v$.name.$error && v$.name.required.$invalid)">
                                            Это обязательное поле для заполнения
                                        </div>
                                    </div>
                                </div>
                                <div class="make-order-form__item form-item input"
                                    :class="{ 'has-success': (!v$.surname.$error && !v$.surname.required.$invalid && !v$.surname.minLength.$invalid), 'has-error': (v$.surname.$error) || (v$.surname.minLength.$invalid) }">
                                    <label for="" class="form-label">Фамилия *</label>
                                    <div class="form-item__body">
                                        <input type="text" class="make-order-form__input form-input"
                                            v-model.trim="form.surname" placeholder="Ваша фамилия">
                                        <div class="helper-block" v-if="v$.surname.minLength.$invalid">
                                            Минимальное количетсво символов 2
                                        </div>
                                        <div class="helper-block"
                                            v-if="(v$.surname.$error && v$.surname.required.$invalid)">
                                            Это обязательное поле для заполнения
                                        </div>
                                    </div>
                                </div>
                                <div class="make-order-form__item form-item input"
                                    :class="{ 'has-success': (!v$.phone.$error && !v$.phone.required.$invalid && !v$.phone.minLength.$invalid), 'has-error': (v$.phone.$error) || (v$.phone.minLength.$invalid) }">
                                    <label for="" class="make-order-form__label form-label">Телефон *</label>
                                    <div class="form-item__body">
                                        <input ref="phoneInput" type="text"
                                            class="make-order-form__input form-input phone" inputmode="tel"
                                            placeholder="+7_" data-tel-input data-min="16" data-max="16" maxlength="16">
                                        <div class="helper-block" v-if="v$.phone.minLength.$invalid">
                                            Минимальное количетсво символов 16
                                        </div>
                                        <div class="helper-block"
                                            v-if="(v$.phone.$error && v$.phone.required.$invalid)">
                                            Это обязательное поле для заполнения
                                        </div>
                                    </div>
                                </div>
                                <div class="make-order-form__item form-item input"
                                    :class="{ 'has-success': (!v$.email.$error && !v$.email.required.$invalid && !v$.email.email.$invalid), 'has-error': (v$.email.$error) || (v$.email.email.$invalid && !v$.email.required.$invalid) }">
                                    <label for="" class="make-order-form__label form-label">Email *</label>
                                    <div class="form-item__body">
                                        <input type="email" name="email" v-model.trim="form.email" autocapitalize="off"
                                            autocorrect="off" autocomplete="email"
                                            class="make-order-form__input form-input email " inputmode="email"
                                            placeholder="email">
                                        <div class="helper-block"
                                            v-if="(v$.email.$error && form.email.length !== 0) || (v$.email.required.$invalid && v$.email.email.$invalid)">
                                            Email введен не корректно
                                        </div>
                                        <div class="helper-block"
                                            v-if="(v$.email.$error && v$.email.required.$invalid)">
                                            Это обязательное поле для заполнения
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="make-order-form-block">

                                <div class="make-order-form-block__title">Способ получения</div>

                                <div class="make-order-form__radiobtns form-radiobtns">
                                    <div class="form-item" :class="{ '_checked': form.noDelivery.isNoDelivery }">
                                        <input id="radio-4" name="btns2[]" type="radio"
                                            :checked="form.noDelivery.isNoDelivery"
                                            v-model="form.noDelivery.isNoDelivery" @click="selectNoDelivery"
                                            class="form-radiobtn">
                                        <label for="radio-4" class="form-check-label">Самовывоз из магазина</label>
                                    </div>
                                    <div class="form-item" :class="{ '_checked': form.delivery.isDelivery }">
                                        <input id="radio-3" name="btns2[]" type="radio"
                                            :checked="form.delivery.isDelivery" v-model="form.delivery.isDelivery"
                                            @click="selectDelivery" class="form-radiobtn">
                                        <label for="radio-3" class="form-check-label">Экспресс-доставка от 1 дня</label>
                                    </div>
                                    <div class="make-order-form__radiobtns-info">
                                        *Стоимость 5 000 ₽ по Омску и Омской Области
                                    </div>
                                </div>

                                <div class="order-form-subblock block-delivery"
                                    :class="!form.delivery.isDelivery && 'hidden'">
                                    <div class="order-form-subblock__block">
                                        <div class="order-form-subblock__title">Адрес доставки</div>
                                        <div class="form-radiobtns custom form-radiobtns--column"
                                            :class="userAddresses.length <= 0 && 'hidden'">
                                            <div v-for="(addressItem, index) in userAddresses"
                                                class="form-item radio-container radio-container--small-text">
                                                <input :id="`radio-user-address-${index}`" name="userAddresses"
                                                    type="radio" class="form-radiobtn" :checked="index == 0">
                                                <label :for="`radio-user-address-${index}`"
                                                    @click="setDeliveryAddress(addressItem)" class="form-check-label">
                                                    {{ addressItem.address }}</label>
                                            </div>
                                            <div class="form-item radio-container radio-container--small-text">
                                                <input :id="`radio-user-address-new`" name="userAddresses" type="radio"
                                                    class="form-radiobtn">
                                                <label @click="" :for="`radio-user-address-new`"
                                                    class="form-check-label change-address__js">Новый адрес</label>
                                            </div>
                                        </div>
                                        <div v-if="!form.delivery.address" class="order-form-subblock__row grid">
                                            <div class="order-form-subblock__btn btn-border default-anim change-address__js"
                                                v-anim-hover>
                                                <span>Укажите адрес
                                                    доставки</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="order-form-subblock__block order-form-delivery"
                                        :class="{ 'hidden': form.delivery.address.length === 0 }">
                                        <div class="make-order-form__item form-item"
                                            :class="{ 'has-success': (form.delivery.address) }">
                                            <label for="" class="form-label">Адрес*</label>
                                            <input type="text"
                                                class="make-order-form__input form-input change-address__js"
                                                v-model.trim="form.delivery.address">
                                        </div>
                                        <div
                                            class="order-form-subblock__checkboxes checkbox-house form-checkboxes form-checkboxes__js">
                                            <div class="form-item"
                                                :class="{ '_checked': form.delivery.detailAddress.privateHome }">
                                                <input type="checkbox" id="delivery-2"
                                                    v-model="form.delivery.detailAddress.privateHome"
                                                    class="form-checkbox instock__js">
                                                <label for="delivery-2" class="form-check-label">Частный дом</label>
                                            </div>
                                        </div>
                                        <div class="order-form-subblock__row details-delivery a-items-end">
                                            <div class="make-order-form__item input-flat form-item input"
                                                :class="{ 'has-success': (!v$.delivery.detailAddress.flat.$error && form.delivery.detailAddress.flat.length > 0), 'has-error': (v$.delivery.detailAddress.flat.$error) }">
                                                <label for="" class="form-label">Квартира <span
                                                        v-if="form.delivery.detailAddress.privateHome === false">*</span></label>
                                                <div class="form-item__body">
                                                    <input type="text" class="make-order-form__input form-input"
                                                        v-model.trim="form.delivery.detailAddress.flat" placeholder="0">
                                                    <!-- <div class="helper-block" v-if="form.delivery.detailAddress.flat.length === 0">
														Это обязательное поле для заполнения
													</div> -->
                                                </div>
                                            </div>
                                            <div class="make-order-form__item input-floor form-item input"
                                                :class="{ 'has-success': (!v$.delivery.detailAddress.floor.$error && form.delivery.detailAddress.floor.length > 0), 'has-error': (v$.delivery.detailAddress.floor.$error) }">
                                                <label for="" class="form-label">Этаж <span
                                                        v-if="form.delivery.detailAddress.privateHome === false">*</span></label>
                                                <div class="form-item__body">
                                                    <input type="text" class="make-order-form__input form-input"
                                                        v-model.trim="form.delivery.detailAddress.floor"
                                                        placeholder="0">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="order-form-subblock__checkboxes form-checkboxes form-checkboxes__js"
                                            :class="{ 'hidden': form.delivery.address.length === 0 }">
                                            <div class="form-item"
                                                :class="{ '_checked': form.delivery.detailAddress.needMovers }">
                                                <input type="checkbox" id="delivery-1"
                                                    v-model="form.delivery.detailAddress.needMovers"
                                                    class="form-checkbox instock__js">
                                                <label for="delivery-1" class="form-check-label">Требуются
                                                    грузчики</label>
                                            </div>
                                        </div>
                                        <div class="order-form-subblock__title">Укажите детали доставки</div>
                                        <div class="make-order-form__item form-item textarea"
                                            :class="{ 'has-success': (form.comment.length > 0) }">
                                            <label for="" class="form-label">Комментарий</label>
                                            <textarea class="form-textarea" v-model.trim="form.comment"
                                                placeholder="Комментарий к доставке"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="order-form-subblock block-no-delivery"
                                    :class="!form.noDelivery.isNoDelivery && 'hidden'">
                                    <div class="order-form-subblock__block">
                                        <div class="order-form-subblock__title">Адрес магазина</div>
                                        <div class="order-form-subblock__row grid">
                                            <div class="order-form-subblock__address change-shop__js">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M21 11.8235C21 17.8239 14.1961 21.8392 12.42 22.7852C12.1547 22.9265 11.8453 22.9265 11.58 22.7852C9.80387 21.8392 3 17.8239 3 11.8235C3 6.52941 7.36081 3 12 3C16.8 3 21 6.52941 21 11.8235Z"
                                                        stroke="#3A3A3A" />
                                                    <circle cx="12" cy="12" r="4.5" stroke="#3A3A3A" />
                                                </svg>
                                                <input type="hidden" class="hidden"
                                                    v-model.trim="form.noDelivery.address">
                                                <span v-html="form.noDelivery.address"></span>
                                            </div>
                                            <div class="order-form-subblock__btn btn-border default-anim change-shop__js"
                                                v-anim-hover>
                                                Изменить адрес магазина
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="make-order-form-block">
                                <div class="make-order-form-block__title">Способ оплаты</div>
                                <div class="make-order-form__radiobtns payment-methods flex-col form-radiobtns">
                                    <div class="form-item"
                                        :class="{ '_checked': (form.pay[0].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                        <input id="radio-p-1" type="radio" value="Картой онлайн"
                                            v-model.trim="form.selectedPay" class="form-radiobtn">
                                        <label for="radio-p-1"
                                            :checked="(form.pay[0].toLowerCase() === form.selectedPay.toLowerCase())"
                                            class="form-check-label">
                                            <span>Картой онлайн</span>

                                            <svg width="40" height="24" viewBox="0 0 40 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M3.69893 6.54654C4.05628 6.5444 5.11832 6.44875 5.56818 7.96702C5.87121 8.98975 6.35392 10.665 7.01631 12.9928H7.28607C7.99643 10.5387 8.4844 8.86342 8.75 7.96702C9.20455 6.43293 10.3409 6.54657 10.7955 6.54657L14.3024 6.54657V17.4556H10.728V11.0267H10.4883L8.49582 17.4556H5.80657L3.81404 11.022H3.57436V17.4556H0V6.54657L3.69893 6.54654ZM19.4351 6.54657V12.9802H19.7202L22.144 7.68988C22.6144 6.63709 23.6172 6.54657 23.6172 6.54657H27.0761V17.4556H23.4271V11.022H23.142L20.7658 16.3123C20.2953 17.3604 19.245 17.4556 19.245 17.4556H15.7861V6.54657H19.4351ZM39.6887 11.7306C39.1797 13.173 37.5812 14.206 35.8115 14.206H31.9848V17.4556H28.5149V11.7306H39.6887Z"
                                                    fill="#0F754E" />
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M35.979 6.54651H28.333C28.515 8.97524 30.6065 11.0544 32.7717 11.0544H39.9299C40.343 9.03583 38.921 6.54651 35.979 6.54651Z"
                                                    fill="url(#paint0_linear_544_44355)" />
                                                <defs>
                                                    <linearGradient id="paint0_linear_544_44355" x1="40.0001"
                                                        y1="9.38216" x2="28.333" y2="9.38216"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#1F5CD7" />
                                                        <stop offset="1" stop-color="#02AEFF" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>

                                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M26.6792 10.8135H15.3223V31.2222H26.6792V10.8135Z"
                                                    fill="#FF5F00" />
                                                <path
                                                    d="M16.0429 21.0184C16.0411 19.0529 16.4865 17.1128 17.3454 15.3448C18.2043 13.5769 19.4541 12.0276 21.0003 10.8141C19.0855 9.30904 16.786 8.37309 14.3645 8.11319C11.943 7.85329 9.49723 8.27992 7.30673 9.34432C5.11623 10.4087 3.26938 12.0679 1.97729 14.1323C0.685205 16.1967 0 18.583 0 21.0184C0 23.4538 0.685205 25.8401 1.97729 27.9045C3.26938 29.9689 5.11623 31.6282 7.30673 32.6926C9.49723 33.757 11.943 34.1836 14.3645 33.9237C16.786 33.6638 19.0855 32.7278 21.0003 31.2228C19.4541 30.0093 18.2043 28.46 17.3454 26.692C16.4865 24.9241 16.0411 22.9839 16.0429 21.0184Z"
                                                    fill="#EB001B" />
                                                <path
                                                    d="M41.9996 21.0184C41.9997 23.4538 41.3146 25.8401 40.0226 27.9045C38.7305 29.9689 36.8838 31.6281 34.6933 32.6925C32.5029 33.7569 30.0571 34.1836 27.6356 33.9237C25.2142 33.6638 22.9147 32.7278 21 31.2228C22.5448 30.0081 23.7937 28.4585 24.6524 26.6908C25.5111 24.9232 25.9573 22.9836 25.9573 21.0184C25.9573 19.0532 25.5111 17.1137 24.6524 15.346C23.7937 13.5784 22.5448 12.0288 21 10.8141C22.9147 9.30903 25.2142 8.37309 27.6356 8.11319C30.0571 7.85329 32.5029 8.27993 34.6933 9.34434C36.8838 10.4088 38.7305 12.068 40.0226 14.1324C41.3146 16.1968 41.9997 18.5831 41.9996 21.0184Z"
                                                    fill="#F79E1B" />
                                                <path
                                                    d="M40.7616 29.0609V28.6431H40.9301V28.558H40.501V28.6431H40.6695V29.0609H40.7616ZM41.5946 29.0609V28.5571H41.4631L41.3118 28.9037L41.1605 28.5571H41.0289V29.0609H41.1218V28.6809L41.2636 29.0085H41.3599L41.5018 28.6801V29.0609H41.5946Z"
                                                    fill="#F79E1B" />
                                            </svg>
                                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M20.7957 14.431L17.9897 27.5494H14.5957L17.402 14.431H20.7957ZM35.0739 22.9017L36.8602 17.9755L37.8881 22.9017H35.0739ZM38.8618 27.5494H42L39.2584 14.431H36.3636C35.7112 14.431 35.1612 14.8092 34.9178 15.3926L29.8255 27.5494H33.3897L34.0973 25.5902H38.4508L38.8618 27.5494ZM30.0022 23.2667C30.017 19.8045 25.2162 19.6127 25.2483 18.0658C25.2587 17.5957 25.7071 17.095 26.6873 16.967C27.1733 16.9044 28.5143 16.8537 30.0344 17.5541L30.6289 14.7712C29.8125 14.4758 28.7618 14.1914 27.4544 14.1914C24.0994 14.1914 21.7393 15.9735 21.7204 18.5275C21.6988 20.4162 23.4063 21.4692 24.6901 22.0983C26.0137 22.7412 26.4572 23.1534 26.4507 23.7278C26.4415 24.608 25.3953 24.9977 24.421 25.0125C22.7138 25.0391 21.7242 24.551 20.9355 24.1834L20.3195 27.0593C21.1137 27.4228 22.5772 27.7391 24.0926 27.7553C27.6595 27.7553 29.9916 25.9941 30.0022 23.2667ZM15.9462 14.431L10.4473 27.5494H6.86029L4.15406 17.08C3.99001 16.4362 3.84691 16.1995 3.34797 15.9275C2.53186 15.4843 1.18464 15.0698 0 14.8119L0.0802555 14.431H5.85504C6.59061 14.431 7.25242 14.9205 7.42089 15.7679L8.85043 23.3596L12.3807 14.431H15.9462Z"
                                                    fill="#1434CB" />
                                            </svg>
                                            <svg width="42" height="42" viewBox="0 0 42 42" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M32.8348 7.02197C30.2675 7.02197 28.1624 9.10143 28.1624 11.6943V16.5464H34.7602C34.9142 16.5464 35.0939 16.5464 35.2223 16.5721C36.7113 16.6491 37.8152 17.4193 37.8152 18.7542C37.8152 19.8068 37.0707 20.7053 35.6844 20.8851V20.9364C37.1991 21.0391 38.3543 21.8863 38.3543 23.1956C38.3543 24.6075 37.0707 25.5318 35.3763 25.5318H28.1367V35.0305H34.9912C37.5585 35.0305 39.6636 32.9511 39.6636 30.3582V7.02197H32.8348Z"
                                                    fill="url(#paint0_linear_513_57534)" />
                                                <path
                                                    d="M30.4472 24.0427H33.1428C33.1813 24.0427 33.2455 24.0363 33.3097 24.0299C33.3739 24.0235 33.4381 24.0171 33.4766 24.0171C33.99 23.9144 34.4265 23.4523 34.4265 22.8105C34.4265 22.1943 33.99 21.7322 33.4766 21.6039C33.3996 21.5782 33.2455 21.5782 33.1428 21.5782H30.4472V24.0427Z"
                                                    fill="url(#paint1_linear_513_57534)" />
                                                <path
                                                    d="M33.1428 17.9584C33.6563 18.0354 34.0927 18.4462 34.0927 19.0623C34.0927 19.6784 33.6563 20.0892 33.1428 20.1662C33.1172 20.1919 32.9631 20.1919 32.8861 20.1919H30.4472V17.9327H32.8861C32.9285 17.9327 32.9865 17.9405 33.0386 17.9475C33.0811 17.9532 33.1198 17.9584 33.1428 17.9584Z"
                                                    fill="url(#paint2_linear_513_57534)" />
                                                <path
                                                    d="M7.00859 7.02197C4.44135 7.02197 2.33622 9.10143 2.33622 11.6943V23.2212C3.64551 23.8631 5.00615 24.2738 6.36678 24.2738C7.98414 24.2738 8.857 23.2983 8.857 21.9633V16.5208H12.8619V21.9376C12.8619 24.0428 11.5526 25.7628 7.11128 25.7628C4.41568 25.7628 2.31055 25.1723 2.31055 25.1723V35.0049H9.16507C11.7323 35.0049 13.8374 32.9254 13.8374 30.3325V7.02197H7.00859Z"
                                                    fill="url(#paint3_linear_513_57534)" />
                                                <path
                                                    d="M19.9214 7.02197C17.3542 7.02197 15.249 9.10143 15.249 11.6943V17.8044C16.43 16.8031 18.4837 16.1613 21.7955 16.3154C23.5669 16.3924 25.4666 16.8802 25.4666 16.8802V18.8569C24.5167 18.3692 23.3872 17.9327 21.9238 17.83C19.4079 17.6503 17.8933 18.8826 17.8933 21.0391C17.8933 23.2212 19.4079 24.4535 21.9238 24.2481C23.3872 24.1454 24.5167 23.6833 25.4666 23.2212V25.198C25.4666 25.198 23.5925 25.6858 21.7955 25.7628C18.4837 25.9168 16.43 25.275 15.249 24.2738V35.0562H22.1035C24.6708 35.0562 26.7759 32.9767 26.7759 30.3838V7.02197H19.9214Z"
                                                    fill="url(#paint4_linear_513_57534)" />
                                                <defs>
                                                    <linearGradient id="paint0_linear_513_57534" x1="28.1573"
                                                        y1="19.0584" x2="39.6942" y2="19.0584"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#007940" />
                                                        <stop offset="0.2285" stop-color="#00873F" />
                                                        <stop offset="0.7433" stop-color="#40A737" />
                                                        <stop offset="1" stop-color="#5CB531" />
                                                    </linearGradient>
                                                    <linearGradient id="paint1_linear_513_57534" x1="28.1573"
                                                        y1="19.0584" x2="39.6942" y2="19.0584"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#007940" />
                                                        <stop offset="0.2285" stop-color="#00873F" />
                                                        <stop offset="0.7433" stop-color="#40A737" />
                                                        <stop offset="1" stop-color="#5CB531" />
                                                    </linearGradient>
                                                    <linearGradient id="paint2_linear_513_57534" x1="28.1573"
                                                        y1="19.0584" x2="39.6942" y2="19.0584"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#007940" />
                                                        <stop offset="0.2285" stop-color="#00873F" />
                                                        <stop offset="0.7433" stop-color="#40A737" />
                                                        <stop offset="1" stop-color="#5CB531" />
                                                    </linearGradient>
                                                    <linearGradient id="paint3_linear_513_57534" x1="2.33038"
                                                        y1="21.0146" x2="14.0458" y2="21.0146"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#1F286F" />
                                                        <stop offset="0.4751" stop-color="#004E94" />
                                                        <stop offset="0.8261" stop-color="#0066B1" />
                                                        <stop offset="1" stop-color="#006FBC" />
                                                    </linearGradient>
                                                    <linearGradient id="paint4_linear_513_57534" x1="15.1823"
                                                        y1="21.0146" x2="26.5602" y2="21.0146"
                                                        gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#6C2C2F" />
                                                        <stop offset="0.1735" stop-color="#882730" />
                                                        <stop offset="0.5731" stop-color="#BE1833" />
                                                        <stop offset="0.8585" stop-color="#DC0436" />
                                                        <stop offset="1" stop-color="#E60039" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </label>
                                    </div>
                                    <div class="form-item"
                                        :class="{ '_checked': (form.pay[1].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                        <input id="radio-p-2" type="radio" value="Наличными или картой при получении"
                                            v-model.trim="form.selectedPay" class="form-radiobtn">
                                        <label for="radio-p-2"
                                            :checked="(form.pay[1].toLowerCase() === form.selectedPay.toLowerCase())"
                                            class="form-check-label">
                                            <span>Наличными или картой при
                                                получении</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <g clip-path="url(#clip0_12_7968)">
                                                    <path
                                                        d="M22.5897 10.61V6C22.5897 4.89543 21.6943 4 20.5897 4L2.5 4C1.39543 4 0.5 4.89543 0.5 6L0.5 17.4582C0.5 18.5627 1.39543 19.4582 2.5 19.4582H11.5449H13.7101"
                                                        stroke="black" stroke-width="1.5" stroke-linecap="round" />
                                                    <path d="M3.60227 16.3077H12.2112" stroke="black" stroke-width="1.5"
                                                        stroke-linecap="round" />
                                                    <path d="M3.60227 14.0989H10.059" stroke="black" stroke-width="1.5"
                                                        stroke-linecap="round" />
                                                    <rect x="0.5" y="7.35704" width="22.381" height="2.2381"
                                                        fill="black" />
                                                    <circle cx="19" cy="16" r="4.5" fill="#F7DE00" stroke="black" />
                                                    <path
                                                        d="M17.78 17.9999V13.7999H19.508C20.06 13.7999 20.494 13.9199 20.81 14.1599C21.13 14.3959 21.29 14.7459 21.29 15.2099C21.29 15.6699 21.13 16.0199 20.81 16.2599C20.494 16.4959 20.06 16.6139 19.508 16.6139H18.212L18.56 16.2539V17.9999H17.78ZM18.56 16.3379L18.212 15.9839H19.502C19.822 15.9839 20.068 15.9179 20.24 15.7859C20.416 15.6499 20.504 15.4599 20.504 15.2159C20.504 14.9719 20.416 14.7859 20.24 14.6579C20.068 14.5259 19.822 14.4599 19.502 14.4599H18.212L18.56 14.0759V16.3379ZM17.18 17.3759V16.9559H19.88V17.3759H17.18Z"
                                                        fill="black" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_12_7968">
                                                        <rect width="24" height="24" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </label>

                                    </div>

                                    <template v-if="totalPrice > 3000 && totalPrice < 50000">
                                        <div class="form-item"
                                            :class="{ '_checked': (form.pay[2].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                            <input id="radio-p-3" type="radio" value="Плайт - оплата частями"
                                                v-model.trim="form.selectedPay" class="form-radiobtn">
                                            <label for="radio-p-3"
                                                :checked="(form.pay[2].toLowerCase() === form.selectedPay.toLowerCase())"
                                                class="form-check-label"><span>Оплата частями</span>
                                                <svg class="playt-icon" width="86" height="16" viewBox="0 0 86 16"
                                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M22.8803 15.0852H17.8658C17.8475 13.393 17.1624 11.7764 15.9594 10.5863C14.7563 9.39613 13.1324 8.7286 11.4401 8.7286C9.74787 8.7286 8.12392 9.39613 6.92087 10.5863C5.71782 11.7764 5.03278 13.393 5.0145 15.0852H0C0.024437 12.0671 1.2405 9.18097 3.38329 7.05547C5.52607 4.92996 8.42196 3.7373 11.4401 3.7373C14.4583 3.7373 17.3542 4.92996 19.497 7.05547C21.6398 9.18097 22.8558 12.0671 22.8803 15.0852Z"
                                                        fill="#6969FF" />
                                                    <path
                                                        d="M28.6013 4.73443H37.9246V15.0852H35.7308V6.65368H30.7786V15.0852H28.6021L28.6013 4.73443ZM41.7811 9.70693C41.7953 10.4247 41.7428 11.1424 41.6236 11.8504C41.5193 12.3492 41.3633 12.6927 41.1541 12.8817C40.9094 13.0799 40.6 13.1803 40.2856 13.1637H39.9203V15.0852H40.6291C41.3603 15.0852 41.9603 14.9284 42.4283 14.6149C42.8963 14.3014 43.2496 13.7599 43.4888 12.9882C43.7251 12.2119 43.8436 11.1432 43.8436 9.78343V6.64918H47.8261V15.0807H50.0101V4.73743H41.7811V9.70693ZM62.4173 13.1839H62.8621V15.0852H61.7108C60.9698 15.0852 60.4643 14.9232 60.1951 14.5992C59.9349 14.2642 59.7992 13.8494 59.8111 13.4254C59.5269 13.8539 59.1712 14.2304 58.7596 14.5384C58.1648 14.9832 57.3766 15.2059 56.3933 15.2059C55.7094 15.2191 55.0295 15.0988 54.3916 14.8519C53.8481 14.6451 53.3773 14.2831 53.0378 13.8109C52.7066 13.3304 52.5364 12.7571 52.5518 12.1737C52.5518 11.1087 52.9298 10.2904 53.6851 9.71743C54.4403 9.14518 55.5376 8.85868 56.9761 8.85868H59.5861V8.23243C59.5983 7.97423 59.5507 7.7167 59.4471 7.47992C59.3434 7.24315 59.1864 7.03353 58.9883 6.86743C58.5908 6.53743 58.0343 6.37243 57.3211 6.37243C56.7625 6.34799 56.2094 6.49168 55.7333 6.78493C55.5408 6.90649 55.3757 7.06685 55.2487 7.25577C55.1216 7.4447 55.0353 7.65804 54.9953 7.88218H52.8563C52.9088 7.24618 53.1511 6.64018 53.5538 6.14443C53.9774 5.6457 54.5191 5.261 55.1296 5.02543C55.8607 4.7417 56.6405 4.60435 57.4246 4.62118C58.7986 4.62118 59.8628 4.94143 60.6181 5.58043C61.3733 6.22018 61.7498 7.15093 61.7468 8.37343V12.5164C61.7468 12.7737 61.7993 12.9492 61.9036 13.0429C62.0521 13.1509 62.2343 13.2012 62.4173 13.1839ZM59.5966 10.4764H56.8793C56.2051 10.4764 55.6868 10.6039 55.3223 10.8604C54.9593 11.1162 54.7771 11.5069 54.7756 12.0327C54.772 12.2376 54.8169 12.4404 54.9066 12.6247C54.9963 12.809 55.1282 12.9695 55.2916 13.0932C55.6366 13.3707 56.1031 13.5087 56.7016 13.5087C57.2381 13.5251 57.7701 13.4065 58.2488 13.1637C58.6594 12.948 59.002 12.6227 59.2388 12.2239C59.4811 11.8032 59.6033 11.3247 59.5936 10.8402L59.5966 10.4764ZM67.1191 11.9104V4.73443H64.9876V15.0852H66.8881L72.4876 7.88743V15.0852H74.6101V4.74268H72.6901L67.1191 11.9104ZM69.7658 3.64543C70.7633 3.64543 71.5418 3.39868 72.1006 2.90668C72.6593 2.41468 72.9436 1.71043 72.9533 0.794678H71.2748C71.2976 1.1898 71.1755 1.57966 70.9313 1.89118C70.7011 2.16268 70.3171 2.29618 69.7786 2.29618C69.2386 2.29618 68.8786 2.16268 68.6558 1.89118C68.4208 1.57575 68.3049 1.18732 68.3288 0.794678H66.6458C66.6713 1.71043 66.9511 2.41468 67.4836 2.90668C68.0161 3.39868 68.7751 3.64468 69.7576 3.64468H69.7651L69.7658 3.64543ZM76.6613 4.74193V6.66193H80.1796V15.0934H82.3628V6.66193H85.8811V4.73443L76.6613 4.74193Z"
                                                        fill="#020202" />
                                                </svg></label>
                                        </div>

                                        <BnplWidget
                                            :class="{ 'hidden': (form.pay[2].toLowerCase() !== form.selectedPay.toLowerCase()) }"
                                            :key="checkedTotalPrice" :price="checkedTotalPrice"></BnplWidget>
                                    </template>


                                    <div class="form-item"
                                        :class="{ '_checked': (form.pay[3].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                        <input id="radio-p-4" type="radio" value="Рассрочка по карте «Халва»"
                                            v-model.trim="form.selectedPay" class="form-radiobtn">
                                        <label for="radio-p-4"
                                            :checked="(form.pay[3].toLowerCase() === form.selectedPay.toLowerCase())"
                                            class="form-check-label"><span>Рассрочка по карте «Халва»</span>
                                            <svg class='halva-icon' width="39" height="7" viewBox="0 0 39 7" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M11.4228 5.19733C11.0798 5.19812 10.7442 5.09927 10.4583 4.91322C10.1726 4.7278 9.94943 4.46324 9.8171 4.1531C9.68495 3.84316 9.64988 3.50159 9.71636 3.17199C9.78284 2.84239 9.94785 2.53972 10.1903 2.30263C10.433 2.06454 10.7421 1.90235 11.0785 1.83655C11.4149 1.77074 11.7637 1.80425 12.0808 1.93286C12.3978 2.06133 12.6691 2.27875 12.8599 2.55792C13.0827 2.88381 13.1831 3.27558 13.1441 3.66618C13.1051 4.05677 12.929 4.42191 12.6461 4.6991C12.3214 5.01735 11.8816 5.19648 11.4228 5.19733ZM11.4228 0.000863242C10.8211 -0.000453224 10.2287 0.146806 9.7001 0.429099C9.17225 0.710821 8.72528 1.11869 8.40052 1.61498C7.91079 2.36376 7.73074 3.26789 7.89714 4.14264C8.06355 5.0174 8.56386 5.79675 9.29584 6.32145C9.78133 6.67049 10.3485 6.89394 10.945 6.97123C11.5416 7.04851 12.1483 6.97714 12.7094 6.76369C13.2702 6.55092 13.7673 6.20283 14.1549 5.75157C13.9184 6.18145 13.5766 6.54175 13.1807 6.76822V6.94857H14.9919V3.48275C14.9873 2.55823 14.6094 1.67328 13.941 1.02204C13.2713 0.369292 12.3664 0.00233342 11.4228 0.000863242ZM28.5954 5.23151H26.2399V4.09545H28.5505C28.8395 4.09545 29.1766 4.36145 29.1766 4.66369C29.1766 4.88275 29.0017 5.23151 28.5954 5.23151ZM26.2399 1.77269L28.218 1.77228C28.4323 1.77228 28.7866 1.98886 28.7866 2.33516C28.7866 2.61145 28.5572 2.90916 28.1584 2.90916H26.2399V1.77269ZM30.204 3.29128C30.6339 2.65304 30.6733 1.7801 30.2808 1.12663C30.0862 0.803492 29.8096 0.535369 29.4781 0.348393C29.1459 0.161095 28.77 0.0612419 28.387 0.0585103L24.4287 0.0580985V6.94857L28.8579 6.9461C30.2472 6.9461 31.0226 5.82445 31.0226 4.88316C31.0226 3.97728 30.4959 3.52351 30.204 3.29128ZM22.6376 2.59704C23.2323 4.16586 23.2625 5.58892 23.2625 6.94898H21.424C21.424 5.84586 21.3846 4.84157 21.1485 3.93363C20.8323 2.71645 20.2431 1.83157 19.6958 1.83157C19.1486 1.83157 18.5594 2.71686 18.2428 3.93363C18.0067 4.84157 17.9677 5.81951 17.9677 6.94898H16.1292C16.1292 5.71122 16.1594 4.16586 16.7541 2.59704C17.3072 1.13569 18.3426 0.000863242 19.6954 0.000863242C21.0483 0.000863242 22.0836 1.13569 22.6376 2.59704ZM5.29939 0.0576868H7.13826V0.783628C7.13872 1.30502 7.02007 1.81988 6.79103 2.29028C6.56193 2.76101 6.22852 3.17548 5.81519 3.50333C6.22857 3.83131 6.56199 4.24592 6.79103 4.7168C7.01999 5.18708 7.13865 5.70179 7.13826 6.22304V6.94898H5.29939V6.04145C5.29939 5.59263 5.11697 5.16192 4.79239 4.84486C4.46754 4.52709 4.02768 4.34866 3.56913 4.34866C3.11058 4.34866 2.67072 4.52709 2.34587 4.84486C2.18537 5.00175 2.058 5.18822 1.97106 5.39356C1.88413 5.5989 1.83935 5.81908 1.83929 6.04145V6.94857H1.27562e-06V6.22304C-0.00043455 5.70165 0.118219 5.1868 0.347227 4.71639C0.576485 4.24564 0.910041 3.83117 1.32349 3.50333C0.909982 3.17539 0.57642 2.76077 0.347227 2.28986C0.118205 1.81946 -0.000448798 1.30461 1.27562e-06 0.783216V0.0576868H1.83929V0.965216C1.83929 1.41404 2.02171 1.84433 2.34587 2.1618C2.67072 2.47958 3.11058 2.65801 3.56913 2.65801C4.02768 2.65801 4.46754 2.47958 4.79239 2.1618C4.95297 2.00495 5.08042 1.8185 5.16742 1.61316C5.25443 1.40781 5.29927 1.18762 5.29939 0.965216V0.0576868ZM35.2841 5.19733C34.9411 5.19827 34.6055 5.09956 34.3196 4.91363C34.1059 4.77537 33.9262 4.59208 33.7937 4.3771C33.6612 4.16212 33.5792 3.92084 33.5535 3.67081C33.5279 3.42078 33.5594 3.16829 33.6456 2.93169C33.7318 2.69509 33.8707 2.48034 34.052 2.30304C34.295 2.06537 34.604 1.90348 34.9404 1.83769C35.2767 1.77191 35.6253 1.80516 35.9425 1.93328C36.2595 2.06133 36.5304 2.27916 36.7212 2.55792C36.9441 2.88372 37.0447 3.27543 37.0058 3.66603C36.9669 4.05662 36.791 4.42181 36.5082 4.6991C36.1833 5.01756 35.7432 5.1967 35.2841 5.19733ZM38.8528 3.48275C38.8476 2.66088 38.5472 1.86719 38.0045 1.24151C37.4605 0.614329 36.7095 0.194736 35.8825 0.0560397C35.0552 -0.082978 34.2045 0.0672472 33.4784 0.480569C32.7534 0.893081 32.1996 1.54313 31.9142 2.31663C31.6292 3.08903 31.6312 3.93547 31.92 4.70651C32.2096 5.47858 32.7668 6.12586 33.4939 6.53475C34.2219 6.94418 35.0731 7.09003 35.8994 6.94694C36.7257 6.80385 37.4747 6.38086 38.0162 5.75157C37.7797 6.18145 37.4379 6.54216 37.0424 6.76822V6.94898H38.8532L38.8528 3.48275Z"
                                                    fill="black" />
                                            </svg>
                                        </label>
                                    </div>

                                    <!-- Выключен так как не работает на стороне банка -->
                                    <template v-if="false">
                                        <!-- В кредит -->
                                        <div class="form-item"
                                            :class="{ '_checked': (form.pay[6].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                            <input id="radio-p-6" type="radio" :value="form.pay[6]"
                                                v-model.trim="form.selectedPay" class="form-radiobtn">
                                            <label for="radio-p-6"
                                                :checked="(form.pay[6].toLowerCase() === form.selectedPay.toLowerCase())"
                                                class="form-check-label"><span>{{ form.pay[6] }}</span>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <g clip-path="url(#clip0_12_7924)">
                                                        <rect x="1" y="18.0089" width="22" height="2" rx="0.7"
                                                            fill="black" />
                                                        <rect x="4.0372" y="9.5984" width="1.42095" height="7.47333"
                                                            fill="black" stroke="black" />
                                                        <rect x="18.5629" y="9.5984" width="1.42095" height="7.47333"
                                                            fill="black" stroke="black" />
                                                        <rect x="11.3" y="9.5984" width="1.42095" height="7.47333"
                                                            fill="black" stroke="black" />
                                                        <rect x="1.11623" y="7.88796" width="21.7886" height="2.42095"
                                                            rx="0.7" fill="black" />
                                                        <rect y="21.0089" width="24" height="2" rx="0.7" fill="black" />
                                                        <path
                                                            d="M11.8721 0.0821603C12.0778 -0.0273258 12.3246 -0.0274477 12.5303 0.0821603L23.3565 5.85169C23.9995 6.19445 23.7559 7.16977 23.0274 7.17005H1.37501C0.64617 7.17005 0.402709 6.19448 1.04591 5.85169L11.8721 0.0821603ZM12.2012 3.53821C11.5327 3.53821 10.9902 4.08063 10.9902 4.74915C10.9905 5.41749 11.5328 5.95911 12.2012 5.95911C12.8695 5.95897 13.4109 5.4174 13.4111 4.74915C13.4111 4.08071 12.8696 3.53836 12.2012 3.53821Z"
                                                            fill="black" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_12_7924">
                                                            <rect width="24" height="24" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </label>
                                        </div>
                                    </template>

                                    <!-- QR-код -->
                                    <div class="form-item"
                                        :class="{ '_checked': (form.pay[7].toLowerCase() === form.selectedPay.toLowerCase()) }">
                                        <input id="radio-p-7" type="radio" :value="form.pay[7]"
                                            v-model.trim="form.selectedPay" class="form-radiobtn">
                                        <label for="radio-p-7"
                                            :checked="(form.pay[7].toLowerCase() === form.selectedPay.toLowerCase())"
                                            class="form-check-label"><span>{{ form.pay[7] }}</span>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_12_7945)">
                                                    <path
                                                        d="M9.25 23H2C1.44772 23 1 22.5523 1 22V14.75M14.75 23H22C22.5523 23 23 22.5523 23 22V14.75M23 7.875V2C23 1.44772 22.5523 1 22 1H14.75M9.25 1H2C1.44772 1 1 1.44772 1 2V7.875"
                                                        stroke="black" stroke-width="2" />
                                                    <mask id="path-2-inside-1_12_7945" fill="white">
                                                        <rect x="4" y="4" width="6" height="6" rx="1" />
                                                    </mask>
                                                    <rect x="4" y="4" width="6" height="6" rx="1" stroke="black"
                                                        stroke-width="4" mask="url(#path-2-inside-1_12_7945)" />
                                                    <mask id="path-3-inside-2_12_7945" fill="white">
                                                        <rect x="4" y="14" width="6" height="6" rx="1" />
                                                    </mask>
                                                    <rect x="4" y="14" width="6" height="6" rx="1" stroke="black"
                                                        stroke-width="4" mask="url(#path-3-inside-2_12_7945)" />
                                                    <mask id="path-4-inside-3_12_7945" fill="white">
                                                        <rect x="14" y="14" width="6" height="6" rx="1" />
                                                    </mask>
                                                    <rect x="14" y="14" width="6" height="6" rx="1" stroke="black"
                                                        stroke-width="4" mask="url(#path-4-inside-3_12_7945)" />
                                                    <rect x="13.1" y="8.69997" width="2.2" height="2.2" rx="0.4"
                                                        fill="black" />
                                                    <rect x="15.3" y="6.5" width="2.2" height="2.2" rx="0.4"
                                                        fill="black" />
                                                    <rect x="13.1" y="4.30003" width="2.2" height="2.2" rx="0.4"
                                                        fill="black" />
                                                    <rect x="17.5" y="8.69997" width="2.2" height="2.2" rx="0.4"
                                                        fill="black" />
                                                    <rect x="17.5" y="4.30003" width="2.2" height="2.2" rx="0.4"
                                                        fill="black" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_12_7945">
                                                        <rect width="24" height="24" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="make-order-form__last-row" v-if="isDesktop">
                                <button type="submit" class="make-order-form__btn btn form-btn default-anim bg-yellow"
                                    v-anim-hover>
                                    <span>Оформить заказ</span>
                                    <div class="form-btn__dots">
                                        <div class="dot dot-1"></div>
                                        <div class="dot dot-2"></div>
                                        <div class="dot dot-3"></div>
                                    </div>
                                </button>
                                <div class="checkbox-house form-checkboxes">
                                    <div class="form-item" :class="{ '_checked': form.privacy_policy }">
                                        <input type="checkbox" id="order_privacy_policy" v-model="form.privacy_policy"
                                            class="form-checkbox">
                                        <label for="order_privacy_policy"
                                            class="form-check-label make-order-form__politics form-politics">Я
                                            даю
                                            согласие на
                                            обработку персональных
                                            данных, в соответствии с <router-link to="/politics/"
                                                target="_blank">Политикой
                                                конфиденциальности</router-link>,
                                            и соглашаюсь с <router-link to="/oferta/"
                                                target="_blank">Офертой</router-link>.</label>
                                        <div class="helper-block"
                                            v-if="v$.privacy_policy.sameAs.$invalid && v$.privacy_policy.$error">
                                            Обязательно
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="make-order__block block-2">
                        <div class="make-order__block-body">
                            <div class="your-order">
                                <div class="your-order__title">Ваш заказ</div>
                                <div class="your-order__list">
                                    <div class="your-order__block">
                                        <!-- <div class="your-order__date">Доставка сегодня</div> -->
                                        <div class="your-order__items">
                                            <template v-for="product in products" :key="'basketProducts-'+product.id">
                                                <div class="your-order-item" :id="product.id">
                                                    <div class="your-order-item__body">
                                                        <div class="your-order-item__block">
                                                            <div class="your-order-item__img">
                                                                <template v-if="product.json_imgs">
                                                                    <picture>
                                                                        <img :src="product.json_imgs" alt="">
                                                                    </picture>
                                                                </template>
                                                                <template v-else>
                                                                    <picture>
                                                                        <img src="~/assets/img/empty-img.png"
                                                                            alt="empty-img">
                                                                    </picture>
                                                                </template>
                                                            </div>
                                                        </div>
                                                        <div class="your-order-item__block">
                                                            <div class="your-order-item__name">{{ product.title }}</div>
                                                            <div class="your-order-item-price card-product-price">
                                                                <div
                                                                    class="your-order-item-price__row card-product-price__row">
                                                                    <div
                                                                        class="your-order-item-price__value card-product-price__value new">
                                                                        {{
                                                                            numberWithSpaces(product.price) }} ₽<template
                                                                            v-if="product.unit">/{{ product.unit
                                                                            }}</template></div>
                                                                    <div class="your-order-item-price__value card-product-price__value old"
                                                                        v-if="product.price.old">{{
                                                                            numberWithSpaces(product.price.old) }}
                                                                        ₽<template v-if="item.unit">/{{ product.unit
                                                                            }}</template></div>
                                                                    <div class="your-order-item-price__count">{{
                                                                        product.quantity }} шт.</div>
                                                                </div>
                                                                <div
                                                                    class="your-order-item-price__info card-product-price__info hidden">
                                                                    Экономия по карте
                                                                    лояльности</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                <div class="your-order-info">
                                    <div class="your-order-info__count"> {{ products.length }} {{
                                        sklonenie(products.length, ['товар', 'товара',
                                            'товаров']) }}</div>
                                    <div class="your-order-info__items hidden">
                                        <div class="your-order-info-item info-item-delivery">
                                            <div class="your-order-info-item__label">Доставка:</div>
                                            <div class="your-order-info-item__value">659 ₽</div>
                                        </div>
                                        <div class="your-order-info-item">
                                            <div class="your-order-info-item__label">Скидка по карте:</div>
                                            <div class="your-order-info-item__value old">658 ₽</div>
                                        </div>
                                    </div>
                                    <div class="your-order-info-total">
                                        <div class="your-order-info-total__label">Итого:</div>
                                        <div class="your-order-info-total__value">{{ numberWithSpaces(totalPrice)
                                            }} ₽</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="make-order-form__last-row" v-if="!isDesktop">
                        <button type="submit" class="make-order-form__btn btn form-btn default-anim bg-yellow"
                            v-anim-hover>
                            <span>Оформить заказ</span>
                            <div class="form-btn__dots">
                                <div class="dot dot-1"></div>
                                <div class="dot dot-2"></div>
                                <div class="dot dot-3"></div>
                            </div>
                        </button>
                        <div class="checkbox-house form-checkboxes">
                            <div class="form-item" :class="{ '_checked': form.privacy_policy }">
                                <input type="checkbox" id="order_privacy_policy" v-model="form.privacy_policy"
                                    class="form-checkbox">
                                <label for="order_privacy_policy"
                                    class="form-check-label make-order-form__politics form-politics">Я
                                    даю
                                    согласие на
                                    обработку персональных
                                    данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
                                        конфиденциальности</router-link>,
                                    и соглашаюсь с <router-link to="/oferta/"
                                        target="_blank">Офертой</router-link>.</label>
                                <div class="helper-block"
                                    v-if="v$.privacy_policy.sameAs.$invalid && v$.privacy_policy.$error">
                                    Обязательно
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    </main>
    <div class="popup-map popup">
        <div class="popup-map__container popup__container h100vh">
            <div class="popup-map__head popup__head">
                <div class="popup-map__title popup__title">Выберите адрес доставки</div>
                <div class="popup-map__address">
                    <input type="text" class="input-address form-input input-map-address__js" id="inputMapAddress"
                        placeholder="Введите адрес">
                    <div class="popup-map__search map-search__js">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M24 24L19.2779 19.2695M21.8947 12.9474C21.8947 15.3204 20.9521 17.5962 19.2741 19.2741C17.5962 20.9521 15.3204 21.8947 12.9474 21.8947C10.5744 21.8947 8.29858 20.9521 6.62062 19.2741C4.94267 17.5962 4 15.3204 4 12.9474C4 10.5744 4.94267 8.29858 6.62062 6.62062C8.29858 4.94267 10.5744 4 12.9474 4C15.3204 4 17.5962 4.94267 19.2741 6.62062C20.9521 8.29858 21.8947 10.5744 21.8947 12.9474V12.9474Z"
                                stroke="white" stroke-width="2.5" stroke-linecap="round" />
                        </svg>
                    </div>
                </div>
                <div class="popup-map__select popup-map-select-address__js">
                    <div class="popup-map__btn btn default-anim bg-yellow close-popup__js" v-anim-hover>Выбрать</div>
                </div>
                <div class="popup-map__close popup__close close-popup__js default-anim" v-anim-hover>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
            <div class="popup-map__content popup__content">
                <div class="popup-map__map user" id="map-user">
                    <div class="popup-map-address ">
                        <div class="popup-map-address__container">
                            <div class="popup-map-address__value">Омская область, г. Исилькуль,
                                ул. Коммунистическая, 30</div>
                            <div class="popup-map-address__btn btn default-anim bg-yellow select-address__js"
                                v-anim-hover>
                                Выбрать</div>
                            <div class="popup-map-address__close close-popup-address__js default-anim" v-anim-hover>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
<style lang="scss">
.order-page {
    padding-bottom: 0;

    @media screen and (orientation: portrait) {
        padding-bottom: 6rem;
    }

    .breadcrumbs-block__container {
        margin: 0;
    }
}

.make-order {

    &__container {
        margin-right: 0;
    }

    &__block.block-1 {
        width: 71.2rem;
        position: relative;
    }

    &__block.block-1 &__block-body {
        top: 17.2rem;
        padding-bottom: 12rem;
    }

    &__block.block-2 {
        background-color: var(--grey);
        // значения для имитации что блок на всю ширину
        margin-top: -16rem;
        overflow: clip;
    }

    &__block.block-2 &__block-body {
        position: relative;
        top: 0;
        padding: 18rem 3rem 5rem;
    }

    @media screen and (orientation: portrait) {
        &__container {
            margin-right: 1.6rem;
        }

        &__block.block-1 {
            margin-bottom: 6rem;
            width: 100%;
        }

        &__block.block-1 &__block-body {
            padding-bottom: 0;
        }

        &__block.block-1,
        &__block.block-2 {
            grid-area: unset;
        }

        &__block.block-2 {
            margin: 0 0 2.4rem;
            border-radius: 3.2rem;
            width: 100%;
            height: unset;
        }

        &__block.block-2 &__block-body {
            position: initial;
            padding: 4rem 1.6rem;
            width: unset;
        }
    }
}

.make-order-form {
    display: grid;
    justify-content: space-between;
    grid-template-columns: 1fr 49.4rem;

    &__item {
        margin-bottom: 2.4rem;
    }

    & textarea,
    &__input {
        background-color: var(--grey);
    }

    &__label {}

    &__radiobtns {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 1.6rem;
        margin-bottom: 6rem;
    }

    &__radiobtns-info {
        right: 4.5rem;
        bottom: -2rem;
        position: absolute;

        font-size: 1.2rem;
        line-height: 1;
    }

    &__radiobtns.payment-methods {
        grid-template-columns: 1fr;
        grid-gap: 0;
    }

    &__radiobtns .form-item {
        margin-bottom: 0;
    }

    &__radiobtns .form-check-label {
        display: flex;
        height: 6.4rem;
        align-items: center;
        padding: 0 2.4rem 0 5.8rem;
        border: 1px solid transparent;
        background-color: rgba(247, 247, 247, 0.2);
        border-radius: 2rem;
        overflow: hidden;
        transition: background-color 0.3s ease-out;
    }

    &__radiobtns ._checked .form-check-label {
        background-color: var(--grey);
        border: 1px solid #57575766;
        transition: all 0.3s ease-out;
    }

    @media (hover: hover) and (pointer: fine) {
        &__radiobtns .form-check-label:hover {
            background-color: var(--grey);
            border: 1px solid #57575766;
        }

        &__radiobtns .form-check-label_disabled:hover {
            background-color: rgba(247, 247, 247, 0.2);
            border: 1px solid transparent;
        }
    }

    &__radiobtns .form-check-label::before,
    &__radiobtns .form-check-label::after {
        top: 50%;
        left: 2.4rem;
        transform: translateY(-50%);
    }

    &__select {
        max-width: 34.8rem;
        width: 100%;
    }

    &__select .select-box__head {
        background-color: var(--grey);
        height: 4.8rem;
    }

    .maker-order-date {
        max-width: 34.8rem;
        width: 100%;
    }

    .input-flat,
    .input-floor {
        max-width: 16.6rem;
        width: 100%;
    }

    &__radiobtns.payment-methods label {
        padding-left: 5rem;
        flex-wrap: wrap;
        gap: 1.6rem;
    }

    &__radiobtns.payment-methods label::before,
    &__radiobtns.payment-methods label::after {
        left: 1.6rem;
    }

    &__radiobtns.payment-methods label svg {
        height: 2.4rem;
        width: auto;
    }

    &__radiobtns.payment-methods label img {
        height: 2.4rem;

    }

    &__last-row {
        display: grid;
        grid-template-columns: 34.6rem 1fr;
        grid-gap: 2.4rem;
        align-items: center;
        max-width: 71.2rem;
    }

    &__btn {}

    &__politics {
        max-width: 100%;
    }

    &__politics a {
        text-decoration: none;
    }

    &__politics a:hover {
        text-decoration: underline;
    }

    @media screen and (orientation: portrait) {
        grid-template-areas: unset;
        display: block;

        &__radiobtns {
            grid-template-columns: 1fr;
            gap: .8rem;
        }

        &__radiobtns-info {
            position: static;
        }

        &__last-row {
            grid-template-columns: 1fr;
        }

        .input-flat,
        .input-floor {
            max-width: calc(50% - .8rem);
            width: 100%;
        }

        &__select {
            max-width: 100%;
        }

        &__radiobtns.payment-methods label {
            padding-top: 2.4rem;
            padding-bottom: 2.4rem;
            // height: 9.6rem;
            height: max-content;
            gap: 1rem 1.6rem;
        }

        &__radiobtns.payment-methods label span {
            flex-grow: 1;
            width: 100%;
        }

        &__last-row {
            grid-area: unset;
            display: flex;
            flex-direction: column-reverse;
            align-items: unset;
            gap: 2.7rem;
            margin-bottom: 0;
        }

        &__politics {
            text-align: left;
        }
    }
}

.make-order-form-block {
    &:not(:last-child) {
        margin-bottom: 6rem;
    }

    &__title {
        font-size: 2.4rem;
        line-height: 100%;
        font-weight: 600;
        margin-bottom: 4rem;
    }

    @media screen and (orientation: portrait) {
        &__title {
            font-size: 2rem;
            line-height: 100%;
            margin-bottom: 4rem;
        }
    }
}

.order-form-subblock {

    &__block {}

    &__title {
        font-size: 1.8rem;
        line-height: 100%;
        font-weight: 600;
        margin: 0 0 2.4rem;
    }

    &__row {
        display: flex;
        align-items: start;
        flex-wrap: wrap;
        gap: 1.6rem;
        margin-bottom: 2.4rem;
    }

    &__row.a-items-end {
        align-items: end;
    }

    &__row .form-item {
        margin-bottom: 0;
    }

    &__address {
        width: 37.3rem;
        display: flex;
        gap: .8rem;
        line-height: 150%;
    }

    &__address span {
        max-width: 31.6rem;
    }

    &__address svg {
        width: 2.4rem;
        height: 2.4rem;
    }

    &__checkboxes.checkbox-house {
        display: flex;
        align-items: center;
        margin-bottom: 2.4rem;
    }

    &__btn {
        padding: 0 2rem;
        height: 4.8rem;
    }

    @media screen and (orientation: portrait) {
        &__row {
            flex-direction: column;
            gap: 2.4rem;
            margin-bottom: 4rem;
        }

        &__row.details-delivery {
            flex-direction: row;
            gap: 1.6rem;
        }

        &__radiobtns {
            font-size: 1.6rem;
            line-height: 100%;
        }

        &__address {
            max-width: 100%;
        }

        &__btn {
            align-self: start;
            padding: 0 2.4rem;
            height: 4.8rem;
        }

        &__checkboxes.checkbox-house {
            height: unset;
            margin-top: .8rem;
        }

        .maker-order-date {
            max-width: 100%;
        }

        &__row.date-time-delivery {
            margin-bottom: 2.4rem;
        }
    }
}

.your-order {
    &__title {
        font-size: 2.4rem;
        line-height: 100%;
        font-weight: 600;
        margin-bottom: 4rem;
    }

    &__list {
        margin-bottom: 4rem;
    }

    &__block {}

    &__date {
        margin-bottom: 2.4rem;
    }

    @media screen and (orientation: portrait) {
        &__title {
            font-size: 2rem;
            line-height: 100%;
        }

        &__date {
            font-size: 1.4rem;
            line-height: 100%;
            margin-bottom: 2.4rem;
        }
    }
}

.your-order-item {
    margin-bottom: 2.4rem;

    &__body {
        display: grid;
        grid-template-columns: 7.6rem 1fr;
        align-items: start;
        grid-gap: 2.4rem;
    }

    &__img {
        border-radius: 1.6rem;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &__img img {
        max-width: 100%;
        max-height: 8.6rem;
    }

    &__name {
        font-weight: 600;
        font-size: 1.8rem;
        line-height: 120%;
        margin-bottom: 1.6rem;
    }

    @media screen and (orientation: portrait) {
        &__name {
            font-size: 1.6rem;
            line-height: 150%;
        }
    }
}

.your-order-info {
    border-top: 0.5px solid var(--text-gray, #8C8C8C);
    padding-top: 4rem;

    &__count {
        margin-bottom: 1.6rem;
    }

    &__items {}
}

.your-order-info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.6rem;

    &__label {}

    &__value.old {
        text-decoration: line-through;
        color: var(--text-grey);
    }
}

.your-order-info-total {
    display: flex;
    justify-content: space-between;
    align-items: end;
    font-weight: 600;

    &__label {}

    &__value {
        font-size: 2.4rem;
        line-height: 100%;
    }
}

.your-order-item-price {
    align-items: center;

    &__count {
        flex-grow: 1;
        text-align: right;
        font-weight: 600;
        font-size: 1.8rem;
        line-height: 100%;
    }

    @media screen and (orientation: portrait) {
        &__value.new {
            font-size: 1.6rem;
            line-height: 100%;
        }

        &__value.old {
            font-size: 1.4rem;
            line-height: 100%;
        }

        &__count {
            font-size: 1.6rem;
            line-height: 100%;
        }
    }
}
</style>
<style scoped lang="scss">
.order-form-subblock.block-delivery {
    display: flex;
    flex-flow: column;
    gap: 2.4rem;
}

.order-form-delivery .order-form-subblock__title {
    margin-top: 4rem;
}

svg.playt-icon {
    width: 8.6rem !important;
    height: 1.4rem !important;
}

svg.halva-icon {
    width: 3.9rem !important;
    height: .7rem !important;
}

.sticky-top {
    top: 0% !important;
    position: sticky !important;
}
</style>
