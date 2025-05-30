<script setup>
const shops = ref([]);
const cities = ref([]);
const address = ref(null);

const { data } = await useAPI('/shops/')

let objs = data.value.shops;
let keys = Object.keys(objs);
keys.forEach((key) => {
    cities.value.push({ id: key, name: objs[key].city });
    let keysShops = Object.keys(objs[key].info);
    keysShops.forEach((keyShops) => {
        shops.value.push({ filter: key, ...objs[key].info[keyShops] })
    })
});

onMounted(() => {
    initMap()
    getUserAddress()
})

function initMap() {
    function setSelectShopSession(_coords, _address, _from, _phone) {
        let obj = { coords: _coords, address: _address, from: _from, phone: _phone };
        localStorage.setItem('selectedShop', JSON.stringify(obj));
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'selectedShop'
        }));
    }

    let init = () => {
        const $selectShopPopup = selectElement('.select-shop');
        if (localStorage.getItem('selectedShop') === null) {
            if (address.value === null) {
                $selectShopPopup.classList.add('_active');
                const { $body } = useVars();
                $body.value.classList.add('_overflow');
                if (shops.value[0]) {
                    setSelectShopSession(shops.value[0].coords.split(',').reverse(), shops.value[0].address, shops.value[0].from, shops.value[0].phone);
                }
            }
        }

        // Создание карты.
        let pos;
        let _center;
        if (Array.isArray(JSON.parse(localStorage.getItem('selectedShop')).coords)) {
            _center = localStorage.getItem('selectedShop') ? JSON.parse(localStorage.getItem('selectedShop')).coords : [54.920729, 71.266576].reverse()
        } else {
            _center = localStorage.getItem('selectedShop') ? JSON.parse(localStorage.getItem('selectedShop')).coords.split(',') : [54.920729, 71.266576].reverse()
        }
        let _zoom = 8;
        var myPlacemark,
            myMap = new ymaps.Map("map", {
                center: _center,
                zoom: _zoom,
                controls: [],
            }, {
                searchControlProvider: 'yandex#search',
                yandexMapDisablePoiInteractivity: true
            });
        myMap.controls.remove('routeEditor');
        myMap.controls.add('zoomControl');
        myMap.behaviors.disable('multiTouch');

        function createPlacemark(coords) {
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
                // Необходимо указать данный тип макета.
                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                iconImageHref: (metkaSelected[1] === coords[0] && metkaSelected[0] === coords[1]) ? `${useRuntimeConfig().public.imgBaseURL}/storage/svg/metka-selected.svg` : `${useRuntimeConfig().public.imgBaseURL}/storage/svg/metka.svg`,
                // iconImageHref: '/metka.svg',
                // Размеры метки.
                iconImageSize: [40, 44],
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                iconImageOffset: [-20, -60],
            });
        }

        let placemarks = [];
        let idPlacemark = 0;


        const getPos = (pos, metka, index, element) => {
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
                metka.events.add('click', function (e) {
                    let cardCity = document.querySelector(`.select-shop-region__list .select-shop-region-item[data-coords="${metka.geometry._coordinates[1]}, ${metka.geometry._coordinates[0]}"`);
                    let cardCityPopup = document.querySelector('.select-shop-region__list-popup .select-shop-region-item__body');
                    if (cardCity && cardCity.querySelector('.select-shop-region-item__body')) {
                        cardCityPopup.innerHTML = cardCity.querySelector('.select-shop-region-item__body').innerHTML;
                        document.querySelector('.select-shop-region__list-popup .select-shop-region-item').setAttribute('data-coords', `${metka.geometry._coordinates[1]}, ${metka.geometry._coordinates[0]}`)
                        document.querySelector('.select-shop-region__list-popup .select-shop-region-item').classList.add('_active')

                    }
                    if (cardCityPopup && cardCityPopup.querySelector('.select-shop__js')) {
                        cardCityPopup.querySelector('.select-shop__js').addEventListener('click', () => {
                            placemarks.forEach(placemark => {
                                placemark.options.set('iconImageHref', '/storage/svg/metka.svg');
                            })
                            metka.options.set('iconImageHref', '/storage/svg/metka-selected.svg');
                            myMap.setZoom(13);
                            myMap.setCenter(metka.geometry._coordinates);

                            setSelectShopSession(coords, cardCityPopup.querySelector('.select-shop-region-item__city').textContent.trim(), shops.value[index].from, shops.value[index].phone);
                        });
                    }

                })


                element.querySelector('.select-shop__js').addEventListener('click', () => {
                    let parseCoords = element.dataset.coords.split(',').reverse().map(item => {
                        return parseFloat(item);
                    })

                    setSelectShopSession(parseCoords, element.querySelector('.select-shop-region-item__city').textContent.trim(), shops.value[index].from, shops.value[index].phone);


                    placemarks.forEach(placemark => {
                        if ((placemark.geometry._coordinates[0] === parseCoords[0]) && (placemark.geometry._coordinates[1] === parseCoords[1])) {
                            placemark.options.set('iconImageHref', '/storage/svg/metka-selected.svg');
                            myMap.setCenter(placemark.geometry._coordinates);
                            myMap.setZoom(13);

                        } else {
                            placemark.options.set('iconImageHref', '/storage/svg/metka.svg');
                        }
                    })
                });
            });
        }

        let shopElems = document.querySelectorAll('.select-shop-region__list .select-shop-region-item[data-coords]');
        for (let index = 0; index < shopElems.length; index++) {
            const element = shopElems[index];
            let shop = 'placemark' + index;
            let res = element.getAttribute('data-coords').split(',').reverse().map(parseFloat)
            getPos(res, shop, index, element);
        }

        let popupCity = document.querySelector('.select-shop-region__list-popup .select-shop-region-item');
        document.addEventListener('mouseup', (e) => {
            if (popupCity.contains(e.target) === false && popupCity.classList.contains('_active')) {
                popupCity.classList.remove('_active');
            }
        })

        popupCity.querySelector('.close-popup-shop__js').addEventListener('click', () => {
            popupCity.classList.remove('_active');
        });

        function geocode() {
            setTimeout(() => {
                let request = document.querySelector('.select-shop-region-item._active .select-shop-region-item__city') ? document.querySelector('.select-shop-region-item._active .select-shop-region-item__city').textContent : 'Омская область';
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
                    if (error) {
                    } else {
                        myMap.setCenter(obj.geometry._coordinates)
                    }
                }, function (e) {
                })

            }, 10);

        }

        const selectRegion = document.querySelector('.select-region__js');
        if (selectRegion) {
            selectRegion.addEventListener('click', e => {
                let $this = e.target.closest('.select-box-item__js');
                if ($this) {
                    geocode();
                    if ($this.classList.contains('all')) {
                        myMap.setZoom(8);
                    } else {
                        setTimeout(() => {
                            if (document.querySelector('.select-shop-region__list .select-shop-region-item._active')) {
                                myMap.setCenter(document.querySelector('.select-shop-region__list .select-shop-region-item._active').dataset.coords.split(',').reverse());
                            }
                            myMap.setZoom(12);
                        }, 20)
                    }
                } else {
                    return;
                }
            });
        }
    }
    ymaps.ready(init);
}

async function getUserAddress() {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        const response = await useNuxtApp().$apiFetch(`/user-data`, {
            headers: {
                'Authorization': `Bearer ${authStore.token}`
            },
        })
        if (response.success === true) {
            address.value = response.user.address;

            if (address.value) {
                if (shops.value.length > 0) {
                    shops.value.forEach(shop => {
                        if (shop.address === address.value) {
                            function setSelectShopSession(_coords, _address, _from, _phone) {
                                let obj = { coords: _coords, address: _address, from: _from, phone: _phone };
                                localStorage.setItem('selectedShop', JSON.stringify(obj));
                                window.dispatchEvent(new StorageEvent('storage', {
                                    key: 'selectedShop'
                                }));
                            }
                            setSelectShopSession(shop.coords.split(',').reverse(), shop.address, shop.from, shop.phone);
                        }
                    })
                }
            }
        }
    }
}
</script>
<template>
    <div class="select-shop">
        <div class="select-shop__container">
            <div class="tabs" v-tabs>
                <div class="select-shop__row">
                    <div class="select-shop__label">Выберите ваш магазин</div>
                    <div class="select-shop__tab-head tab-head">
                        <div class="tab-item click-tab-item__js btn-2 default-anim _active" v-anim-hover>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M8.40057 7.1999H15.6006M8.40057 10.7999H15.6006M8.40057 14.3999H12.0006M6.60029 2.3999H17.4005C18.726 2.3999 19.8005 3.47445 19.8005 4.79995L19.8002 19.2C19.8002 20.5254 18.7257 21.5999 17.4002 21.5999L6.60019 21.5998C5.2747 21.5998 4.20019 20.5253 4.2002 19.1998L4.20029 4.79989C4.2003 3.47441 5.27481 2.3999 6.60029 2.3999Z"
                                    stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Списком
                        </div>
                        <div class="tab-item click-tab-item__js btn-2 default-anim" v-anim-hover>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M3.22915 5.66667L18.4297 20.5065M3.22915 5.66667C3.7947 5.021 4.63942 4.61111 5.58316 4.61111H10.7218M3.22915 5.66667C2.77429 6.18596 2.5 6.85777 2.5 7.5915V18.5196C2.5 20.1656 3.88038 21.5 5.58316 21.5H16.8881C18.5909 21.5 19.9713 20.1656 19.9713 18.5196V14.049M10.7218 14.049L4.04158 20.5065M18.0057 5.87778V5.81428M21.5 5.80435C21.5 8.00725 18.0057 10.9444 18.0057 10.9444C18.0057 10.9444 14.5115 8.00725 14.5115 5.80435C14.5115 3.97941 16.0759 2.5 18.0057 2.5C19.9356 2.5 21.5 3.97941 21.5 5.80435Z"
                                    stroke="#1D1D1D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            На карте
                        </div>
                    </div>
                    <div class="select-shop__close close-select-shop-popup__js default-anim" v-anim-hover>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
                <div class="select-shop-tab__container">
                    <div class="tab-body">
                        <div class="select-shop__block tab-item-block _active">
                            <div class="tab-item-block__body">
                                <div class="select-shop-region">
                                    <div class="select-shop-region__label">Выберите ваш район</div>
                                    <SelectShopRegion :cities="cities"></SelectShopRegion>
                                    <list-shops :shops="shops"></list-shops>
                                </div>
                            </div>
                        </div>
                        <div class="select-shop__block tab-item-block">
                            <div class="tab-item-block__body">
                                <div class="select-shop__map" id="map">
                                    <div class="select-shop-region__list-popup">
                                        <div class="select-shop-region-item">
                                            <div class="select-shop-region-item__close default-anim close-popup-shop__js"
                                                v-anim-hover>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
                                                        stroke="#1D1D1D" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                            <div class="select-shop-region-item__body"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
