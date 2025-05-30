<script>
import useVuelidate from '@vuelidate/core';
import { required, requiredIf, minLength, email, sameAs } from '@vuelidate/validators';

import { mapState } from 'pinia';
export default {
  async setup() {
    const { phoneInput } = usePhoneMask();

    const { data } = await usePageData({
      urlPage: '/order',
      cacheKey: 'order-page-data'
    });
    const breadcrumbs = ref([]);
    breadcrumbs.value = [{ 'Корзина': '/basket' }, { [data.value.data.breadcrumbs]: '' }];
    const aboutPage = ref(data.value?.data || []);
    useSeoMeta(useMetaTags(data.value));

    return {
      v$: useVuelidate(),
      phoneInput,
      breadcrumbs,
      aboutPage,
    }
  },
  data() {
    return {
      form: {
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
            date: '',
            time: '',
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
          'Кредит',
        ],
        selectedPay: 'Картой онлайн',
        privacy_policy: false,
      },
      isFormSend: false,
      isActiveTimeSelect: false,
      deliveryTimes: [],
    }
  },
  computed: {
    ...mapState(useCartStore, {
      products: 'checkedItems',
      checkedTotalPrice: 'checkedTotalPrice',
    })
  },
  validations() {
    return {
      form: {
        name: {
          required,
          minLength: minLength(2)
        },
        surname: {
          required,
          minLength: minLength(2)
        },
        phone: {
          required,
          minLength: minLength(16)
        },
        email: {
          required,
          email,
        },
        comment: {
          minLength: minLength(2)
        },
        delivery: {
          detailAddress: {
            flat: { required: requiredIf(this.getIsDeliveryAndPrivateHome) },
            floor: { required: requiredIf(this.getIsDeliveryAndPrivateHome) },
            date: { required: requiredIf(this.getIsDelivery) },
            time: { required: requiredIf(this.getIsDelivery) },
          }
        },
        privacy_policy: {
          required,
          sameAs: sameAs(true),
        }
      }
    }
  },
  methods: {
    ...mapActions(useCartStore, [
      'removeItemsFromCart',
      'updatePrices'
    ]),
    formSubmit(e) {
      e.preventDefault();
      if (this.isFormSend === false) {
        let isDelivery = this.form.delivery.isDelivery ? true : false;
        let detailAddress;
        if (!isDelivery) {
          detailAddress = {
            date: '',
            time: '',
            flat: '',
            floor: '',
            needMovers: false,
            privateHome: false,
          }
        } else {
          detailAddress = this.form.delivery.detailAddress;
        }
        let userId = this.getUserIdFromToken(this.token);
        let newFormDate = {
          user_id: userId,
          name: this.form.name,
          surname: this.form.surname,
          phone: this.form.phone,
          email: this.form.email,
          isDelivery: isDelivery,
          address: (isDelivery) ? this.form.delivery.address : this.form.noDelivery.address,
          detailAddress: detailAddress,
          comment: this.form.comment,
          selectedPay: this.form.selectedPay,
          products: this.products,
        };

        if (!this.v$.$invalid) {
          if (this.products.length <= 0) {
            this.$router.push('/')
            return;
          }
          this.isFormSend = true;
          this.v$.$touch();
          axios.post('/api/basket-form', { 'basket': JSON.stringify(newFormDate) })
            .then(response => {
              if (response.data.success) {
                this.removeItemsFromCart(this.products)
                window.location.href = `${response.data.redirect}`;
              }
              this.isFormSend = false;
            })
            .catch(error => {
              console.log(error);
              setTimeout(() => {
                this.isFormSend = false;
              }, 50);
            })
        } else {
          this.v$.$touch();
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
    },
    selectDelivery() {
      this.form.delivery.isDelivery = true;
      this.form.noDelivery.isNoDelivery = false;
    },
    selectNoDelivery() {
      this.form.noDelivery.isNoDelivery = true;
      this.form.delivery.isDelivery = false;
    },
    init() {
      this.updatePrices();
      // this.getUserData();
      this.initMeta();
      let userAddress = localStorage.getItem('userAddress');
      if (userAddress) {
        this.form.delivery.address = userAddress;
      }
      let shopAddress = JSON.parse(localStorage.getItem('selectedShop'));
      if (shopAddress) {
        this.form.noDelivery.address = shopAddress.address;
      }
      this.sidebarInit()
      this.imgCheck()

      this.initGetParameters()

      // яндекс карта
      setTimeout(() => {
        if (selectElement('.popup-map__map ymaps')) {
          selectElement('.popup-map__map ymaps').remove();
        }
        ymaps.ready(init);

        const setAddress = (address) => {
          this.form.delivery.address = address;
          localStorage.setItem('userAddress', address);
        }

        const setAddressCity = (address) => {
          this.form.noDelivery.address = address;
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

        function init() {
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

          const $selectAddressUser = document.querySelector('.change-address__js');
          if ($selectAddressUser) {
            $selectAddressUser.addEventListener('click', () => {
              document.querySelector('.popup-map').classList.add('_active');
              document.body.classList.add('_overflow');
              document.querySelector('.popup-map .popup-map__address input').value = document.querySelector('.map-address__js input').value;
              geocode();
            });
          }

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

        const setDate = (date) => {
          this.form.delivery.detailAddress.date = date;
        }

        let orderPage = () => {
          // const $selectDelivery = selectElement('.select-delivery__js');
          // if ($selectDelivery) {
          //     $selectDelivery.addEventListener('change', () => {
          //         if ($selectDelivery.checked) {
          //             selectElement('.block-delivery').classList.remove('hidden');
          //             selectElement('.block-no-delivery').classList.add('hidden');
          //             selectElement('.info-item-delivery').classList.remove('hidden');
          //         } else {
          //             selectElement('.block-delivery').classList.add('hidden');
          //             selectElement('.block-no-delivery').classList.remove('hidden');

          //         }
          //     })
          // }
          // const $selectNoDelivery = selectElement('.select-no-delivery__js');

          // if ($selectNoDelivery) {
          //     $selectNoDelivery.addEventListener('change', () => {
          //         if ($selectNoDelivery.checked) {
          //             selectElement('.block-no-delivery').classList.remove('hidden');
          //             selectElement('.block-delivery').classList.add('hidden');
          //             selectElement('.info-item-delivery').classList.add('hidden');
          //         } else {
          //             selectElement('.block-no-delivery').classList.add('hidden');
          //             selectElement('.block-delivery').classList.remove('hidden');
          //         }
          //     })
          // }

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
                this.deliveryTimes.push({ time: `${newTime.getHours()}:${newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes()}`, isHidden: new Date() > newTime ? '' : '' });
                // $times.innerHTML = `<span>${newTime.getHours()}:${newTime.getMinutes() < 10 ? '0' + newTime.getMinutes() : newTime.getMinutes()}</span>`
              }
            }

            document.addEventListener('mouseup', (e) => {
              if ($dateTime.contains(e.target) === false) {
                this.isActiveTimeSelect = false;
              }
            });

            let ESC = 27;
            document.addEventListener('keydown', (e) => {
              if (e.keyCode === ESC) {
                this.isActiveTimeSelect = false;
              }
            });
          }

        }
        orderPage();
      }, 100)
    },
    initGetParameters() {
      if (this.$route.query.installment && this.checkedTotalPrice > 3000 && this.checkedTotalPrice < 50000) {
        this.form.selectedPay = this.form.pay[2];
      }
    },
    toggleSelectTime() {
      this.isActiveTimeSelect = !this.isActiveTimeSelect;
    },
    selectTime(time) {
      this.form.delivery.detailAddress.time = time;
      this.isActiveTimeSelect = false;
    },
    getIsDelivery() {
      return (this.form.delivery.isDelivery) ? true : false;
    },
    getIsDeliveryAndPrivateHome() {
      if (this.form.delivery.isDelivery) {
        if (this.form.delivery.detailAddress.privateHome) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    getUserData() {
      this.token = localStorage.getItem('token');

      axios.get('/api/user-data', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
        .then(res => {
          if (res.data.success === true) {
            this.form.name = res.data.user.name;
            this.form.surname = res.data.user.surname;
            this.form.email = res.data.user.email;
            this.form.phone = res.data.user.phone;
          }
        })
        .catch(err => {
          // console.log(err);
        })
    },
    sidebarInit() {
      if (isDesktop) {
        setTimeout(() => {
          let elem = document.querySelector('.block-2')
          const childElem = elem.querySelector('.make-order__block-body')
          if (this.products.length > 2) {

            childElem.style.bottom = 0
            elem.style.height = 'unset'
            // elem.style.height = remToPixels(16) + elem.getBoundingClientRect().height - (remToPixels(9.3) * this.products.length - 3) + 'px'
          }
        }, 200)
      }
    },
    imgCheck() {
      let imgs = selectElements('.your-order-item__img img');

      imgs.forEach((img, index) => {
        img.addEventListener('error', (e) => {
          this.products[index].json_imgs = null
        });
      });
    },
  },
  watch: {
    'form.name'(val) {
      this.form.name = this.form.name.replace(/\d/ig, '');
    },
    'form.surname'(val) {
      this.form.surname = this.form.surname.replace(/\d/ig, '');
    }
  },
  mounted() {
    this.init();
  },
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
                  :class="{ 'has-success': (!v$.form.name.$error && !v$.form.name.required.$invalid && !v$.form.name.minLength.$invalid), 'has-error': (v$.form.name.$error) || (v$.form.name.minLength.$invalid) }">
                  <label for="" class="form-label">Имя *</label>
                  <div class="form-item__body">
                    <input type="text" class="make-order-form__input form-input" v-model.trim="form.name"
                      placeholder="Ваше имя">
                    <div class="helper-block" v-if="v$.form.name.minLength.$invalid">
                      Минимальное количетсво символов 2
                    </div>
                    <div class="helper-block" v-if="(v$.form.name.$error && v$.form.name.required.$invalid)">
                      Это обязательное поле для заполнения
                    </div>
                  </div>
                </div>
                <div class="make-order-form__item form-item input"
                  :class="{ 'has-success': (!v$.form.surname.$error && !v$.form.surname.required.$invalid && !v$.form.surname.minLength.$invalid), 'has-error': (v$.form.surname.$error) || (v$.form.surname.minLength.$invalid) }">
                  <label for="" class="form-label">Фамилия *</label>
                  <div class="form-item__body">
                    <input type="text" class="make-order-form__input form-input" v-model.trim="form.surname"
                      placeholder="Ваша фамилия">
                    <div class="helper-block" v-if="v$.form.surname.minLength.$invalid">
                      Минимальное количетсво символов 2
                    </div>
                    <div class="helper-block" v-if="(v$.form.surname.$error && v$.form.surname.required.$invalid)">
                      Это обязательное поле для заполнения
                    </div>
                  </div>
                </div>
                <div class="make-order-form__item form-item input"
                  :class="{ 'has-success': (!v$.form.phone.$error && !v$.form.phone.required.$invalid && !v$.form.phone.minLength.$invalid), 'has-error': (v$.form.phone.$error) || (v$.form.phone.minLength.$invalid) }">
                  <label for="" class="make-order-form__label form-label">Телефон *</label>
                  <div class="form-item__body">
                    <input ref="phoneInput" type="text" class="make-order-form__input form-input phone"
                      v-model.trim="form.phone" inputmode="tel" placeholder="+7_" data-tel-input data-min="16"
                      data-max="16" maxlength="16">
                    <div class="helper-block" v-if="v$.form.phone.minLength.$invalid">
                      Минимальное количетсво символов 16
                    </div>
                    <div class="helper-block" v-if="(v$.form.phone.$error && v$.form.phone.required.$invalid)">
                      Это обязательное поле для заполнения
                    </div>
                  </div>
                </div>
                <div class="make-order-form__item form-item input"
                  :class="{ 'has-success': (!v$.form.email.$error && !v$.form.email.required.$invalid && !v$.form.email.email.$invalid), 'has-error': (v$.form.email.$error) || (v$.form.email.email.$invalid && !v$.form.email.required.$invalid) }">
                  <label for="" class="make-order-form__label form-label">Email *</label>
                  <div class="form-item__body">
                    <input type="email" name="email" v-model.trim="form.email" autocapitalize="off" autocorrect="off"
                      autocomplete="email" class="make-order-form__input form-input email " inputmode="email"
                      placeholder="email">
                    <div class="helper-block"
                      v-if="(v$.form.email.$error && form.email.length !== 0) || (v$.form.email.required.$invalid && v$.form.email.email.$invalid)">
                      Email введен не корректно
                    </div>
                    <div class="helper-block" v-if="(v$.form.email.$error && v$.form.email.required.$invalid)">
                      Это обязательное поле для заполнения
                    </div>
                  </div>
                </div>
              </div>
              <div class="make-order-form-block">
                <div class="make-order-form-block__title">Способ получения</div>
                <div class="make-order-form__radiobtns form-radiobtns">
                  <div class="form-item" :class="{ '_checked': form.noDelivery.isNoDelivery }">
                    <input id="radio-4" name="btns2[]" type="radio" :checked="form.noDelivery.isNoDelivery"
                      v-model="form.noDelivery.isNoDelivery" @click="selectNoDelivery"
                      class="form-radiobtn select-no-delivery__js">
                    <label for="radio-4" class="form-check-label">Самовывоз из магазина</label>
                  </div>
                  <div class="form-item" :class="{ '_checked': form.delivery.isDelivery }">
                    <input id="radio-3" name="btns2[]" type="radio" disabled :checked="form.delivery.isDelivery"
                      v-model="form.delivery.isDelivery" @click="selectDelivery"
                      class="form-radiobtn select-delivery__js">
                    <label for="radio-3" class="form-check-label form-check-label_disabled">Доставку
                      вы сможете оформить только в магазине</label>
                  </div>

                </div>
                <div class="order-form-subblock block-delivery hidden">
                  <div class="order-form-subblock__block">
                    <div class="order-form-subblock__title">Адрес доставки</div>
                    <div class="order-form-subblock__row grid">
                      <div class="order-form-subblock__address map-address__js"
                        :class="{ 'hidden': form.delivery.address.length === 0 }">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21 11.8235C21 17.8239 14.1961 21.8392 12.42 22.7852C12.1547 22.9265 11.8453 22.9265 11.58 22.7852C9.80387 21.8392 3 17.8239 3 11.8235C3 6.52941 7.36081 3 12 3C16.8 3 21 6.52941 21 11.8235Z"
                            stroke="#3A3A3A" />
                          <circle cx="12" cy="12" r="4.5" stroke="#3A3A3A" />
                        </svg>
                        <input type="hidden" class="hidden" v-model.trim="form.delivery.address">
                        <span v-html="form.delivery.address"></span>
                      </div>
                      <div class="order-form-subblock__btn btn-border default-anim change-address__js" v-anim-hover>
                        <span v-if="form.delivery.address.length === 0">Укажите адрес
                          доставки</span>
                        <span v-else>Измените адрес доставки</span>
                      </div>
                    </div>
                    <div class="order-form-subblock__checkboxes form-checkboxes form-checkboxes__js"
                      :class="{ 'hidden': form.delivery.address.length === 0 }">
                      <div class="form-item" :class="{ '_checked': form.delivery.detailAddress.needMovers }">
                        <input type="checkbox" id="delivery-1" v-model="form.delivery.detailAddress.needMovers"
                          class="form-checkbox instock__js">
                        <label for="delivery-1" class="form-check-label">Требуются
                          грузчики</label>
                      </div>
                    </div>
                  </div>
                  <div class="order-form-subblock__block order-form-delivery"
                    :class="{ 'hidden': form.delivery.address.length === 0 }">
                    <div class="order-form-subblock__title">Укажите детали доставки</div>
                    <div class="order-form-subblock__row details-delivery a-items-end">
                      <div class="make-order-form__item input-flat form-item input"
                        :class="{ 'has-success': (!v$.form.delivery.detailAddress.flat.$error && form.delivery.detailAddress.flat.length > 0), 'has-error': (v$.form.delivery.detailAddress.flat.$error) }">
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
                        :class="{ 'has-success': (!v$.form.delivery.detailAddress.floor.$error && form.delivery.detailAddress.floor.length > 0), 'has-error': (v$.form.delivery.detailAddress.floor.$error) }">
                        <label for="" class="form-label">Этаж <span
                            v-if="form.delivery.detailAddress.privateHome === false">*</span></label>
                        <div class="form-item__body">
                          <input type="text" class="make-order-form__input form-input"
                            v-model.trim="form.delivery.detailAddress.floor" placeholder="0">
                        </div>
                      </div>
                      <div class="order-form-subblock__checkboxes checkbox-house form-checkboxes form-checkboxes__js">
                        <div class="form-item" :class="{ '_checked': form.delivery.detailAddress.privateHome }">
                          <input type="checkbox" id="delivery-2" v-model="form.delivery.detailAddress.privateHome"
                            class="form-checkbox instock__js">
                          <label for="delivery-2" class="form-check-label">Частный дом</label>
                        </div>
                      </div>
                    </div>
                    <div class="order-form-subblock__row date-time-delivery">
                      <div class="make-order-form__item maker-order-date form-item calendar"
                        :class="{ 'has-success': (!v$.form.delivery.detailAddress.date.$error && form.delivery.detailAddress.date.length > 0), 'has-error': (v$.form.delivery.detailAddress.date.$error) }">
                        <label for="" class="form-label">Дата доставки</label>
                        <div class="form-item__body">
                          <input type="text" id="formtask-date_task"
                            class="vanilla-calendar__input make-order-form__input form-input" readonly
                            v-model="form.delivery.detailAddress.date" placeholder="Выберите дату">
                          <div class="vanilla-calendar">
                          </div>
                        </div>
                      </div>
                      <div class="make-order-form__select form-item select-box select-time__js no-hidden-li"
                        :class="{ 'has-success': (!v$.form.delivery.detailAddress.time.$error && form.delivery.detailAddress.time.length > 0), 'has-error': v$.form.delivery.detailAddress.time.$error, '_active': isActiveTimeSelect }"
                        data-time-from="10" data-time-to="22" data-time-step="30">
                        <input type="text" class="hidden select-box-input-hidden"
                          v-model="form.delivery.detailAddress.time">
                        <label for="" class="make-order-form__label form-label">Время
                          доставки</label>
                        <div class="select-box__head" @click="toggleSelectTime">
                          <div class="select-box__label">{{ form.delivery.detailAddress.time ?
                            form.delivery.detailAddress.time : 'Выберите время' }}</div>
                        </div>
                        <div class="select-box__body">
                          <div class="select-box__content">
                            <ul class="list-style-none select-box__list">
                              <template v-for="item in deliveryTimes">
                                <li v-if="item.isHidden !== 'hidden'" @click="selectTime(item.time)"><span>{{ item.time
                                    }}</span></li>
                              </template>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="make-order-form__item form-item textarea"
                      :class="{ 'has-success': (form.comment.length > 0) }">
                      <label for="" class="form-label">Комментарий</label>
                      <textarea class="form-textarea" v-model.trim="form.comment"
                        placeholder="Комментарий к доставке"></textarea>
                    </div>
                  </div>
                </div>
                <div class="order-form-subblock block-no-delivery">
                  <div class="order-form-subblock__block">
                    <div class="order-form-subblock__title">Адрес магазина</div>
                    <div class="order-form-subblock__row grid">
                      <div class="order-form-subblock__address change-shop__js">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21 11.8235C21 17.8239 14.1961 21.8392 12.42 22.7852C12.1547 22.9265 11.8453 22.9265 11.58 22.7852C9.80387 21.8392 3 17.8239 3 11.8235C3 6.52941 7.36081 3 12 3C16.8 3 21 6.52941 21 11.8235Z"
                            stroke="#3A3A3A" />
                          <circle cx="12" cy="12" r="4.5" stroke="#3A3A3A" />
                        </svg>
                        <input type="hidden" class="hidden" v-model.trim="form.noDelivery.address">
                        <span v-html="form.noDelivery.address"></span>
                      </div>
                      <div class="order-form-subblock__btn btn-border default-anim change-shop__js" v-anim-hover>
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
                    <input id="radio-p-1" type="radio" value="Картой онлайн" v-model.trim="form.selectedPay"
                      class="form-radiobtn">
                    <label for="radio-p-1" :checked="(form.pay[0].toLowerCase() === form.selectedPay.toLowerCase())"
                      class="form-check-label">
                      <span>Картой онлайн</span>
                      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M26.6792 10.8135H15.3223V31.2222H26.6792V10.8135Z" fill="#FF5F00" />
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
                      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20.7957 14.431L17.9897 27.5494H14.5957L17.402 14.431H20.7957ZM35.0739 22.9017L36.8602 17.9755L37.8881 22.9017H35.0739ZM38.8618 27.5494H42L39.2584 14.431H36.3636C35.7112 14.431 35.1612 14.8092 34.9178 15.3926L29.8255 27.5494H33.3897L34.0973 25.5902H38.4508L38.8618 27.5494ZM30.0022 23.2667C30.017 19.8045 25.2162 19.6127 25.2483 18.0658C25.2587 17.5957 25.7071 17.095 26.6873 16.967C27.1733 16.9044 28.5143 16.8537 30.0344 17.5541L30.6289 14.7712C29.8125 14.4758 28.7618 14.1914 27.4544 14.1914C24.0994 14.1914 21.7393 15.9735 21.7204 18.5275C21.6988 20.4162 23.4063 21.4692 24.6901 22.0983C26.0137 22.7412 26.4572 23.1534 26.4507 23.7278C26.4415 24.608 25.3953 24.9977 24.421 25.0125C22.7138 25.0391 21.7242 24.551 20.9355 24.1834L20.3195 27.0593C21.1137 27.4228 22.5772 27.7391 24.0926 27.7553C27.6595 27.7553 29.9916 25.9941 30.0022 23.2667ZM15.9462 14.431L10.4473 27.5494H6.86029L4.15406 17.08C3.99001 16.4362 3.84691 16.1995 3.34797 15.9275C2.53186 15.4843 1.18464 15.0698 0 14.8119L0.0802555 14.431H5.85504C6.59061 14.431 7.25242 14.9205 7.42089 15.7679L8.85043 23.3596L12.3807 14.431H15.9462Z"
                          fill="#1434CB" />
                      </svg>
                      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          <linearGradient id="paint0_linear_513_57534" x1="28.1573" y1="19.0584" x2="39.6942"
                            y2="19.0584" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#007940" />
                            <stop offset="0.2285" stop-color="#00873F" />
                            <stop offset="0.7433" stop-color="#40A737" />
                            <stop offset="1" stop-color="#5CB531" />
                          </linearGradient>
                          <linearGradient id="paint1_linear_513_57534" x1="28.1573" y1="19.0584" x2="39.6942"
                            y2="19.0584" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#007940" />
                            <stop offset="0.2285" stop-color="#00873F" />
                            <stop offset="0.7433" stop-color="#40A737" />
                            <stop offset="1" stop-color="#5CB531" />
                          </linearGradient>
                          <linearGradient id="paint2_linear_513_57534" x1="28.1573" y1="19.0584" x2="39.6942"
                            y2="19.0584" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#007940" />
                            <stop offset="0.2285" stop-color="#00873F" />
                            <stop offset="0.7433" stop-color="#40A737" />
                            <stop offset="1" stop-color="#5CB531" />
                          </linearGradient>
                          <linearGradient id="paint3_linear_513_57534" x1="2.33038" y1="21.0146" x2="14.0458"
                            y2="21.0146" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1F286F" />
                            <stop offset="0.4751" stop-color="#004E94" />
                            <stop offset="0.8261" stop-color="#0066B1" />
                            <stop offset="1" stop-color="#006FBC" />
                          </linearGradient>
                          <linearGradient id="paint4_linear_513_57534" x1="15.1823" y1="21.0146" x2="26.5602"
                            y2="21.0146" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6C2C2F" />
                            <stop offset="0.1735" stop-color="#882730" />
                            <stop offset="0.5731" stop-color="#BE1833" />
                            <stop offset="0.8585" stop-color="#DC0436" />
                            <stop offset="1" stop-color="#E60039" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M3.88387 15.2598C4.2591 15.2575 5.37424 15.1571 5.84659 16.7513C6.16477 17.8251 6.67162 19.5842 7.36712 22.0284H7.65038C8.39625 19.4515 8.90862 17.6925 9.1875 16.7513C9.66477 15.1405 10.858 15.2598 11.3352 15.2598L15.0175 15.2598V26.7143H11.2644V19.964H11.0128L8.9206 26.7143H6.0969L4.00474 19.959H3.75307V26.7143H0V15.2598L3.88387 15.2598ZM20.4068 15.2598V22.0152H20.7062L23.2512 16.4603C23.7452 15.3548 24.7981 15.2598 24.7981 15.2598H28.4299V26.7143H24.5985V19.959H24.2991L21.804 25.5139C21.31 26.6143 20.2072 26.7143 20.2072 26.7143H16.5754V15.2598H20.4068ZM41.6731 20.7031C41.1387 22.2176 39.4603 23.3022 37.6021 23.3022H33.5841V26.7143H29.9406V20.7031H41.6731Z"
                          fill="#0F754E" />
                        <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M37.7773 15.2598H29.749C29.9401 17.8099 32.1362 19.993 34.4097 19.993H41.9258C42.3595 17.8736 40.8664 15.2598 37.7773 15.2598Z"
                          fill="url(#paint0_linear_513_57535)" />
                        <defs>
                          <linearGradient id="paint0_linear_513_57535" x1="41.9995" y1="18.2372" x2="29.749"
                            y2="18.2372" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1F5CD7" />
                            <stop offset="1" stop-color="#02AEFF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </label>
                  </div>
                  <div class="form-item"
                    :class="{ '_checked': (form.pay[1].toLowerCase() === form.selectedPay.toLowerCase()) }">
                    <input id="radio-p-2" type="radio" value="Наличными или картой при получении"
                      v-model.trim="form.selectedPay" class="form-radiobtn">
                    <label for="radio-p-2" :checked="(form.pay[1].toLowerCase() === form.selectedPay.toLowerCase())"
                      class="form-check-label"><span>Наличными или картой при
                        получении</span></label>
                  </div>

                  <template v-if="checkedTotalPrice > 3000 && checkedTotalPrice < 50000">
                    <div class="form-item"
                      :class="{ '_checked': (form.pay[2].toLowerCase() === form.selectedPay.toLowerCase()) }">
                      <input id="radio-p-3" type="radio" value="Плайт - оплата частями" v-model.trim="form.selectedPay"
                        class="form-radiobtn">
                      <label for="radio-p-3" :checked="(form.pay[2].toLowerCase() === form.selectedPay.toLowerCase())"
                        class="form-check-label"><span>Оплата частями</span>
                        <svg class="playt-icon" width="86" height="16" viewBox="0 0 86 16" fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M22.8803 15.0852H17.8658C17.8475 13.393 17.1624 11.7764 15.9594 10.5863C14.7563 9.39613 13.1324 8.7286 11.4401 8.7286C9.74787 8.7286 8.12392 9.39613 6.92087 10.5863C5.71782 11.7764 5.03278 13.393 5.0145 15.0852H0C0.024437 12.0671 1.2405 9.18097 3.38329 7.05547C5.52607 4.92996 8.42196 3.7373 11.4401 3.7373C14.4583 3.7373 17.3542 4.92996 19.497 7.05547C21.6398 9.18097 22.8558 12.0671 22.8803 15.0852Z"
                            fill="#6969FF" />
                          <path
                            d="M28.6013 4.73443H37.9246V15.0852H35.7308V6.65368H30.7786V15.0852H28.6021L28.6013 4.73443ZM41.7811 9.70693C41.7953 10.4247 41.7428 11.1424 41.6236 11.8504C41.5193 12.3492 41.3633 12.6927 41.1541 12.8817C40.9094 13.0799 40.6 13.1803 40.2856 13.1637H39.9203V15.0852H40.6291C41.3603 15.0852 41.9603 14.9284 42.4283 14.6149C42.8963 14.3014 43.2496 13.7599 43.4888 12.9882C43.7251 12.2119 43.8436 11.1432 43.8436 9.78343V6.64918H47.8261V15.0807H50.0101V4.73743H41.7811V9.70693ZM62.4173 13.1839H62.8621V15.0852H61.7108C60.9698 15.0852 60.4643 14.9232 60.1951 14.5992C59.9349 14.2642 59.7992 13.8494 59.8111 13.4254C59.5269 13.8539 59.1712 14.2304 58.7596 14.5384C58.1648 14.9832 57.3766 15.2059 56.3933 15.2059C55.7094 15.2191 55.0295 15.0988 54.3916 14.8519C53.8481 14.6451 53.3773 14.2831 53.0378 13.8109C52.7066 13.3304 52.5364 12.7571 52.5518 12.1737C52.5518 11.1087 52.9298 10.2904 53.6851 9.71743C54.4403 9.14518 55.5376 8.85868 56.9761 8.85868H59.5861V8.23243C59.5983 7.97423 59.5507 7.7167 59.4471 7.47992C59.3434 7.24315 59.1864 7.03353 58.9883 6.86743C58.5908 6.53743 58.0343 6.37243 57.3211 6.37243C56.7625 6.34799 56.2094 6.49168 55.7333 6.78493C55.5408 6.90649 55.3757 7.06685 55.2487 7.25577C55.1216 7.4447 55.0353 7.65804 54.9953 7.88218H52.8563C52.9088 7.24618 53.1511 6.64018 53.5538 6.14443C53.9774 5.6457 54.5191 5.261 55.1296 5.02543C55.8607 4.7417 56.6405 4.60435 57.4246 4.62118C58.7986 4.62118 59.8628 4.94143 60.6181 5.58043C61.3733 6.22018 61.7498 7.15093 61.7468 8.37343V12.5164C61.7468 12.7737 61.7993 12.9492 61.9036 13.0429C62.0521 13.1509 62.2343 13.2012 62.4173 13.1839ZM59.5966 10.4764H56.8793C56.2051 10.4764 55.6868 10.6039 55.3223 10.8604C54.9593 11.1162 54.7771 11.5069 54.7756 12.0327C54.772 12.2376 54.8169 12.4404 54.9066 12.6247C54.9963 12.809 55.1282 12.9695 55.2916 13.0932C55.6366 13.3707 56.1031 13.5087 56.7016 13.5087C57.2381 13.5251 57.7701 13.4065 58.2488 13.1637C58.6594 12.948 59.002 12.6227 59.2388 12.2239C59.4811 11.8032 59.6033 11.3247 59.5936 10.8402L59.5966 10.4764ZM67.1191 11.9104V4.73443H64.9876V15.0852H66.8881L72.4876 7.88743V15.0852H74.6101V4.74268H72.6901L67.1191 11.9104ZM69.7658 3.64543C70.7633 3.64543 71.5418 3.39868 72.1006 2.90668C72.6593 2.41468 72.9436 1.71043 72.9533 0.794678H71.2748C71.2976 1.1898 71.1755 1.57966 70.9313 1.89118C70.7011 2.16268 70.3171 2.29618 69.7786 2.29618C69.2386 2.29618 68.8786 2.16268 68.6558 1.89118C68.4208 1.57575 68.3049 1.18732 68.3288 0.794678H66.6458C66.6713 1.71043 66.9511 2.41468 67.4836 2.90668C68.0161 3.39868 68.7751 3.64468 69.7576 3.64468H69.7651L69.7658 3.64543ZM76.6613 4.74193V6.66193H80.1796V15.0934H82.3628V6.66193H85.8811V4.73443L76.6613 4.74193Z"
                            fill="#020202" />
                        </svg></label>
                    </div>

                    <bnplwidget :class="{ 'hidden': (form.pay[2].toLowerCase() !== form.selectedPay.toLowerCase()) }"
                      :key="checkedTotalPrice" :price="checkedTotalPrice"></bnplwidget>
                  </template>


                  <div class="form-item"
                    :class="{ '_checked': (form.pay[3].toLowerCase() === form.selectedPay.toLowerCase()) }">
                    <input id="radio-p-4" type="radio" value="Рассрочка по карте «Халва»"
                      v-model.trim="form.selectedPay" class="form-radiobtn">
                    <label for="radio-p-4" :checked="(form.pay[3].toLowerCase() === form.selectedPay.toLowerCase())"
                      class="form-check-label"><span>Рассрочка по карте «Халва»</span>
                      <svg class='halva-icon' width="39" height="7" viewBox="0 0 39 7" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M11.4228 5.19733C11.0798 5.19812 10.7442 5.09927 10.4583 4.91322C10.1726 4.7278 9.94943 4.46324 9.8171 4.1531C9.68495 3.84316 9.64988 3.50159 9.71636 3.17199C9.78284 2.84239 9.94785 2.53972 10.1903 2.30263C10.433 2.06454 10.7421 1.90235 11.0785 1.83655C11.4149 1.77074 11.7637 1.80425 12.0808 1.93286C12.3978 2.06133 12.6691 2.27875 12.8599 2.55792C13.0827 2.88381 13.1831 3.27558 13.1441 3.66618C13.1051 4.05677 12.929 4.42191 12.6461 4.6991C12.3214 5.01735 11.8816 5.19648 11.4228 5.19733ZM11.4228 0.000863242C10.8211 -0.000453224 10.2287 0.146806 9.7001 0.429099C9.17225 0.710821 8.72528 1.11869 8.40052 1.61498C7.91079 2.36376 7.73074 3.26789 7.89714 4.14264C8.06355 5.0174 8.56386 5.79675 9.29584 6.32145C9.78133 6.67049 10.3485 6.89394 10.945 6.97123C11.5416 7.04851 12.1483 6.97714 12.7094 6.76369C13.2702 6.55092 13.7673 6.20283 14.1549 5.75157C13.9184 6.18145 13.5766 6.54175 13.1807 6.76822V6.94857H14.9919V3.48275C14.9873 2.55823 14.6094 1.67328 13.941 1.02204C13.2713 0.369292 12.3664 0.00233342 11.4228 0.000863242ZM28.5954 5.23151H26.2399V4.09545H28.5505C28.8395 4.09545 29.1766 4.36145 29.1766 4.66369C29.1766 4.88275 29.0017 5.23151 28.5954 5.23151ZM26.2399 1.77269L28.218 1.77228C28.4323 1.77228 28.7866 1.98886 28.7866 2.33516C28.7866 2.61145 28.5572 2.90916 28.1584 2.90916H26.2399V1.77269ZM30.204 3.29128C30.6339 2.65304 30.6733 1.7801 30.2808 1.12663C30.0862 0.803492 29.8096 0.535369 29.4781 0.348393C29.1459 0.161095 28.77 0.0612419 28.387 0.0585103L24.4287 0.0580985V6.94857L28.8579 6.9461C30.2472 6.9461 31.0226 5.82445 31.0226 4.88316C31.0226 3.97728 30.4959 3.52351 30.204 3.29128ZM22.6376 2.59704C23.2323 4.16586 23.2625 5.58892 23.2625 6.94898H21.424C21.424 5.84586 21.3846 4.84157 21.1485 3.93363C20.8323 2.71645 20.2431 1.83157 19.6958 1.83157C19.1486 1.83157 18.5594 2.71686 18.2428 3.93363C18.0067 4.84157 17.9677 5.81951 17.9677 6.94898H16.1292C16.1292 5.71122 16.1594 4.16586 16.7541 2.59704C17.3072 1.13569 18.3426 0.000863242 19.6954 0.000863242C21.0483 0.000863242 22.0836 1.13569 22.6376 2.59704ZM5.29939 0.0576868H7.13826V0.783628C7.13872 1.30502 7.02007 1.81988 6.79103 2.29028C6.56193 2.76101 6.22852 3.17548 5.81519 3.50333C6.22857 3.83131 6.56199 4.24592 6.79103 4.7168C7.01999 5.18708 7.13865 5.70179 7.13826 6.22304V6.94898H5.29939V6.04145C5.29939 5.59263 5.11697 5.16192 4.79239 4.84486C4.46754 4.52709 4.02768 4.34866 3.56913 4.34866C3.11058 4.34866 2.67072 4.52709 2.34587 4.84486C2.18537 5.00175 2.058 5.18822 1.97106 5.39356C1.88413 5.5989 1.83935 5.81908 1.83929 6.04145V6.94857H1.27562e-06V6.22304C-0.00043455 5.70165 0.118219 5.1868 0.347227 4.71639C0.576485 4.24564 0.910041 3.83117 1.32349 3.50333C0.909982 3.17539 0.57642 2.76077 0.347227 2.28986C0.118205 1.81946 -0.000448798 1.30461 1.27562e-06 0.783216V0.0576868H1.83929V0.965216C1.83929 1.41404 2.02171 1.84433 2.34587 2.1618C2.67072 2.47958 3.11058 2.65801 3.56913 2.65801C4.02768 2.65801 4.46754 2.47958 4.79239 2.1618C4.95297 2.00495 5.08042 1.8185 5.16742 1.61316C5.25443 1.40781 5.29927 1.18762 5.29939 0.965216V0.0576868ZM35.2841 5.19733C34.9411 5.19827 34.6055 5.09956 34.3196 4.91363C34.1059 4.77537 33.9262 4.59208 33.7937 4.3771C33.6612 4.16212 33.5792 3.92084 33.5535 3.67081C33.5279 3.42078 33.5594 3.16829 33.6456 2.93169C33.7318 2.69509 33.8707 2.48034 34.052 2.30304C34.295 2.06537 34.604 1.90348 34.9404 1.83769C35.2767 1.77191 35.6253 1.80516 35.9425 1.93328C36.2595 2.06133 36.5304 2.27916 36.7212 2.55792C36.9441 2.88372 37.0447 3.27543 37.0058 3.66603C36.9669 4.05662 36.791 4.42181 36.5082 4.6991C36.1833 5.01756 35.7432 5.1967 35.2841 5.19733ZM38.8528 3.48275C38.8476 2.66088 38.5472 1.86719 38.0045 1.24151C37.4605 0.614329 36.7095 0.194736 35.8825 0.0560397C35.0552 -0.082978 34.2045 0.0672472 33.4784 0.480569C32.7534 0.893081 32.1996 1.54313 31.9142 2.31663C31.6292 3.08903 31.6312 3.93547 31.92 4.70651C32.2096 5.47858 32.7668 6.12586 33.4939 6.53475C34.2219 6.94418 35.0731 7.09003 35.8994 6.94694C36.7257 6.80385 37.4747 6.38086 38.0162 5.75157C37.7797 6.18145 37.4379 6.54216 37.0424 6.76822V6.94898H38.8532L38.8528 3.48275Z"
                          fill="black" />
                      </svg>
                    </label>
                  </div>

                  <div v-if="false">
                    <!-- код отключен -->
                    <div class="form-item"
                      :class="{ '_checked': (form.pay[2].toLowerCase() === form.selectedPay.toLowerCase()) }">
                      <input id="radio-p-3" name="btns1[]"
                        :checked="(form.pay[2].toLowerCase() === form.selectedPay.toLowerCase())"
                        v-model.trim="form.selectedPay" value="Долями - оплата частями в два клика" type="radio"
                        class="form-radiobtn">
                      <label for="radio-p-3" class="form-check-label">
                        <span>Долями - оплата частями в два клика</span>
                        <svg width="28" height="42" viewBox="0 0 28 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M27 11H23.5083V28.7066H27V11Z" fill="black" />
                          <path d="M19.4972 11.9908H16.0055V29.6971H19.4972V11.9908Z" fill="black" />
                          <path d="M11.9945 13.0969H8.50275V30.8066H11.9945V13.0969Z" fill="black" />
                          <path d="M4.49174 14.2154H1L1.00001 31.9271H4.49175L4.49174 14.2154Z" fill="black" />
                        </svg>
                      </label>
                    </div>
                    <div class="form-item"
                      :class="{ '_checked': (form.pay[3].toLowerCase() === form.selectedPay.toLowerCase()) }">
                      <input id="radio-p-4" name="btns1[]" type="radio"
                        :checked="(form.pay[3].toLowerCase() === form.selectedPay.toLowerCase())"
                        v-model.trim="form.selectedPay" value="Сплит - оплата частями" class="form-radiobtn">
                      <label for="radio-p-4" class="form-check-label">
                        <span>Сплит - оплата частями</span>

                        <svg width="69" height="42" viewBox="0 0 69 42" fill="none" xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink">
                          <g clip-path="url(#clip0_513_57539)">
                            <mask id="mask0_513_57539" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="8"
                              y="19" width="13" height="12">
                              <path
                                d="M15.3536 19.1553C19.41 23.5753 21.3625 28.3729 19.7219 29.9445C18.055 31.5397 13.3137 29.2073 9.13192 24.7342C9.01244 24.6074 8.89588 24.4806 8.78223 24.3508C10.9678 22.5286 13.168 20.9422 15.3565 19.1553H15.3536Z"
                                fill="white" />
                            </mask>
                            <g mask="url(#mask0_513_57539)">
                              <mask id="mask1_513_57539" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="8"
                                y="19" width="14" height="13">
                                <path d="M21.3654 19.1553H8.78223V31.5397H21.3654V19.1553Z" fill="white" />
                              </mask>
                              <g mask="url(#mask1_513_57539)">
                                <rect width="13.4283" height="13.0214" transform="matrix(1 0 0 -1 8.78223 31.8496)"
                                  fill="url(#pattern0_513_57539)" />
                              </g>
                            </g>
                            <mask id="mask2_513_57539" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="1"
                              y="10" width="20" height="23">
                              <path
                                d="M12.2586 10.2695C15.5399 10.2695 18.4861 11.7203 20.5056 14.0232C18.8445 15.8455 17.1573 17.3464 15.4642 18.7293C14.4384 19.5667 13.4097 20.3599 12.381 21.1531L12.279 21.2327L12.177 21.3123L12.075 21.392H12.0721L11.973 21.4716L11.871 21.5512L11.8623 21.56L11.769 21.6308L11.6671 21.7104L11.6525 21.7222L11.5651 21.79L11.4631 21.8696L11.3669 21.9463L11.3611 21.9522L11.2591 22.0318L11.2328 22.0525L11.1571 22.1114L11.0551 22.191C10.6792 22.4859 10.3003 22.7837 9.92441 23.0845L9.82241 23.1671C9.65922 23.2968 9.49894 23.4295 9.33867 23.5622C9.19296 23.6831 9.05017 23.804 8.90446 23.9249C9.02103 24.0517 9.13759 24.1814 9.25416 24.3082C13.4272 28.7725 18.1539 31.1049 19.8324 29.5303C17.8596 31.4145 15.199 32.5675 12.2732 32.5675C6.1885 32.5675 1.25488 27.5753 1.25488 21.4185C1.25488 15.2616 6.1885 10.2695 12.2732 10.2695H12.2586Z"
                                fill="white" />
                            </mask>
                            <g mask="url(#mask2_513_57539)">
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M1.25488 10.2695H20.5173V32.5704H1.25488V10.2695Z" fill="#199554" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.1854 14.2993C14.1854 14.1754 14.1009 14.0781 13.9931 14.0781C13.8853 14.0781 13.8008 14.1784 13.8008 14.2993C13.8008 14.4202 13.8853 14.5204 13.9931 14.5204C14.1009 14.5204 14.1854 14.4202 14.1854 14.2993Z"
                                fill="#2CDE85" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.2496 14.4497C14.2496 14.5322 14.1913 14.5971 14.1213 14.5971C14.0514 14.5971 13.9931 14.5322 13.9931 14.4497C13.9931 14.3671 14.0514 14.3022 14.1213 14.3022C14.1913 14.3022 14.2496 14.37 14.2496 14.4497ZM14.4419 14.4497C14.4419 14.2462 14.2991 14.0781 14.1213 14.0781C13.9436 14.0781 13.8008 14.2433 13.8008 14.4497C13.8008 14.6561 13.9436 14.8212 14.1213 14.8212C14.2991 14.8212 14.4419 14.6561 14.4419 14.4497Z"
                                fill="#50B36F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.506 14.5971C14.506 14.7593 14.3923 14.892 14.2496 14.892C14.1068 14.892 13.9931 14.7593 13.9931 14.5971C13.9931 14.4349 14.1068 14.3022 14.2496 14.3022C14.3923 14.3022 14.506 14.4349 14.506 14.5971ZM14.6983 14.5971C14.6983 14.3111 14.4973 14.0781 14.2496 14.0781C14.0019 14.0781 13.8008 14.3111 13.8008 14.5971C13.8008 14.8831 14.0019 15.1161 14.2496 15.1161C14.4973 15.1161 14.6983 14.8831 14.6983 14.5971Z"
                                fill="#4EB26E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.7624 13.475C14.7624 13.7197 14.5905 13.9202 14.3778 13.9202C14.165 13.9202 13.9931 13.7227 13.9931 13.475C13.9931 13.2273 14.165 13.0297 14.3778 13.0297C14.5905 13.0297 14.7624 13.2273 14.7624 13.475ZM14.9548 13.475C14.9548 13.1064 14.6983 12.8086 14.3778 12.8086C14.0572 12.8086 13.8008 13.1064 13.8008 13.475C13.8008 13.8436 14.0572 14.1414 14.3778 14.1414C14.6983 14.1414 14.9548 13.8436 14.9548 13.475Z"
                                fill="#4EB16E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M13.7582 13.6224C13.7582 13.9497 13.528 14.2151 13.2453 14.2151C12.9626 14.2151 12.7324 13.9497 12.7324 13.6224C12.7324 13.2951 12.9626 13.0297 13.2453 13.0297C13.528 13.0297 13.7582 13.2951 13.7582 13.6224ZM13.9505 13.6224C13.9505 13.1713 13.6358 12.8086 13.2482 12.8086C12.8606 12.8086 12.5459 13.1742 12.5459 13.6224C12.5459 14.0706 12.8606 14.4363 13.2482 14.4363C13.6358 14.4363 13.9505 14.0706 13.9505 13.6224Z"
                                fill="#4EB16D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.0146 13.7699C14.0146 14.1797 13.729 14.51 13.3764 14.51C13.0238 14.51 12.7382 14.1797 12.7382 13.7699C12.7382 13.36 13.0238 13.0297 13.3764 13.0297C13.729 13.0297 14.0146 13.36 14.0146 13.7699ZM14.2069 13.7699C14.2069 13.2391 13.8339 12.8086 13.3764 12.8086C12.9189 12.8086 12.5459 13.2391 12.5459 13.7699C12.5459 14.3006 12.9189 14.7311 13.3764 14.7311C13.8339 14.7311 14.2069 14.3006 14.2069 13.7699Z"
                                fill="#4CB06D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.2711 13.9202C14.2711 14.4097 13.9272 14.8078 13.5046 14.8078C13.0821 14.8078 12.7382 14.4097 12.7382 13.9202C12.7382 13.4308 13.0821 13.0327 13.5046 13.0327C13.9272 13.0327 14.2711 13.4308 14.2711 13.9202ZM14.4634 13.9202C14.4634 13.3069 14.035 12.8086 13.5046 12.8086C12.9743 12.8086 12.5459 13.3069 12.5459 13.9202C12.5459 14.5336 12.9743 15.0319 13.5046 15.0319C14.035 15.0319 14.4634 14.5336 14.4634 13.9202Z"
                                fill="#4CB06C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.5275 14.0677C14.5275 14.6397 14.1254 15.1056 13.6329 15.1056C13.1404 15.1056 12.7382 14.6427 12.7382 14.0677C12.7382 13.4927 13.1404 13.0297 13.6329 13.0297C14.1254 13.0297 14.5275 13.4927 14.5275 14.0677ZM14.7198 14.0677C14.7198 13.3718 14.2332 12.8086 13.6329 12.8086C13.0326 12.8086 12.5459 13.3718 12.5459 14.0677C12.5459 14.7636 13.0326 15.3268 13.6329 15.3268C14.2332 15.3268 14.7198 14.7636 14.7198 14.0677Z"
                                fill="#4CB06C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M14.7839 14.2151C14.7839 14.8697 14.3264 15.4005 13.7611 15.4005C13.1957 15.4005 12.7382 14.8697 12.7382 14.2151C12.7382 13.5605 13.1957 13.0297 13.7611 13.0297C14.3264 13.0297 14.7839 13.5605 14.7839 14.2151ZM14.9763 14.2151C14.9763 13.4396 14.4313 12.8086 13.7611 12.8086C13.0908 12.8086 12.5459 13.4396 12.5459 14.2151C12.5459 14.9906 13.0908 15.6216 13.7611 15.6216C14.4313 15.6216 14.9763 14.9906 14.9763 14.2151Z"
                                fill="#4AAF6B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.0404 14.3625C15.0404 15.0997 14.5246 15.6954 13.8893 15.6954C13.254 15.6954 12.7382 15.0997 12.7382 14.3625C12.7382 13.6254 13.254 13.0297 13.8893 13.0297C14.5246 13.0297 15.0404 13.6254 15.0404 14.3625ZM15.2327 14.3625C15.2327 13.5045 14.6324 12.8086 13.8893 12.8086C13.1462 12.8086 12.5459 13.5045 12.5459 14.3625C12.5459 15.2206 13.1462 15.9165 13.8893 15.9165C14.6324 15.9165 15.2327 15.2206 15.2327 14.3625Z"
                                fill="#4AAF6B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.2968 14.5129C15.2968 15.3297 14.7227 15.9932 14.0175 15.9932C13.3123 15.9932 12.7382 15.3297 12.7382 14.5129C12.7382 13.6961 13.3123 13.0327 14.0175 13.0327C14.7227 13.0327 15.2968 13.6961 15.2968 14.5129ZM15.4892 14.5129C15.4892 13.5723 14.8306 12.8086 14.0175 12.8086C13.2045 12.8086 12.5459 13.5723 12.5459 14.5129C12.5459 15.4536 13.2045 16.2173 14.0175 16.2173C14.8306 16.2173 15.4892 15.4536 15.4892 14.5129Z"
                                fill="#4AAE6B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.5533 13.3908C15.5533 14.2902 14.9238 15.0185 14.1458 15.0185C13.3677 15.0185 12.7382 14.2902 12.7382 13.3908C12.7382 12.4915 13.3677 11.7632 14.1458 11.7632C14.9238 11.7632 15.5533 12.4915 15.5533 13.3908ZM15.7456 13.3908C15.7456 12.3676 15.0287 11.5391 14.1458 11.5391C13.2628 11.5391 12.5459 12.3676 12.5459 13.3908C12.5459 14.414 13.2628 15.2426 14.1458 15.2426C15.0287 15.2426 15.7456 14.414 15.7456 13.3908Z"
                                fill="#48AE6A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.8097 13.5383C15.8097 14.5202 15.122 15.3163 14.274 15.3163C13.426 15.3163 12.7382 14.5202 12.7382 13.5383C12.7382 12.5564 13.426 11.7602 14.274 11.7602C15.122 11.7602 15.8097 12.5564 15.8097 13.5383ZM16.0021 13.5383C16.0021 12.4355 15.2298 11.5391 14.274 11.5391C13.3181 11.5391 12.5459 12.4355 12.5459 13.5383C12.5459 14.6411 13.3181 15.5375 14.274 15.5375C15.2298 15.5375 16.0021 14.6411 16.0021 13.5383Z"
                                fill="#48AD6A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.0662 13.6857C16.0662 14.7502 15.3201 15.6112 14.4022 15.6112C13.4842 15.6112 12.7382 14.7502 12.7382 13.6857C12.7382 12.6212 13.4842 11.7602 14.4022 11.7602C15.3201 11.7602 16.0662 12.6212 16.0662 13.6857ZM16.2585 13.6857C16.2585 12.5003 15.428 11.5391 14.4022 11.5391C13.3764 11.5391 12.5459 12.5003 12.5459 13.6857C12.5459 14.8711 13.3764 15.8323 14.4022 15.8323C15.428 15.8323 16.2585 14.8711 16.2585 13.6857Z"
                                fill="#48AD6A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.0619 13.8331C15.0619 14.9772 14.2605 15.9061 13.2697 15.9061C12.2789 15.9061 11.4775 14.9772 11.4775 13.8331C11.4775 12.689 12.2789 11.7602 13.2697 11.7602C14.2605 11.7602 15.0619 12.689 15.0619 13.8331ZM15.2542 13.8331C15.2542 12.5652 14.3654 11.5391 13.2726 11.5391C12.1798 11.5391 11.291 12.5652 11.291 13.8331C11.291 15.1011 12.1798 16.1272 13.2726 16.1272C14.3654 16.1272 15.2542 15.1011 15.2542 13.8331Z"
                                fill="#47AC69" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.3183 13.9835C15.3183 15.2102 14.4587 16.2039 13.4008 16.2039C12.343 16.2039 11.4833 15.2102 11.4833 13.9835C11.4833 12.7569 12.343 11.7632 13.4008 11.7632C14.4587 11.7632 15.3183 12.7569 15.3183 13.9835ZM15.5107 13.9835C15.5107 12.633 14.5665 11.5391 13.4008 11.5391C12.2352 11.5391 11.291 12.633 11.291 13.9835C11.291 15.334 12.2352 16.428 13.4008 16.428C14.5665 16.428 15.5107 15.334 15.5107 13.9835Z"
                                fill="#47AC69" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.5748 14.131C15.5748 15.4402 14.6597 16.4987 13.5291 16.4987C12.3984 16.4987 11.4833 15.4372 11.4833 14.131C11.4833 12.8247 12.3984 11.7632 13.5291 11.7632C14.6597 11.7632 15.5748 12.8247 15.5748 14.131ZM15.7671 14.131C15.7671 12.7008 14.7647 11.5391 13.5291 11.5391C12.2935 11.5391 11.291 12.6979 11.291 14.131C11.291 15.564 12.2935 16.7228 13.5291 16.7228C14.7647 16.7228 15.7671 15.564 15.7671 14.131Z"
                                fill="#47AC69" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M15.8312 14.2784C15.8312 15.6672 14.8579 16.7966 13.6573 16.7966C12.4567 16.7966 11.4833 15.6702 11.4833 14.2784C11.4833 12.8866 12.4567 11.7602 13.6573 11.7602C14.8579 11.7602 15.8312 12.8866 15.8312 14.2784ZM16.0236 14.2784C16.0236 12.7657 14.9628 11.5391 13.6573 11.5391C12.3518 11.5391 11.291 12.7657 11.291 14.2784C11.291 15.7911 12.3518 17.0177 13.6573 17.0177C14.9628 17.0177 16.0236 15.7911 16.0236 14.2784Z"
                                fill="#45AB68" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.0877 14.4258C16.0877 15.8972 15.0561 17.0914 13.7855 17.0914C12.5149 17.0914 11.4833 15.8972 11.4833 14.4258C11.4833 12.9544 12.5149 11.7602 13.7855 11.7602C15.0561 11.7602 16.0877 12.9544 16.0877 14.4258ZM16.28 14.4258C16.28 12.8306 15.1639 11.5391 13.7855 11.5391C12.4071 11.5391 11.291 12.8306 11.291 14.4258C11.291 16.0211 12.4071 17.3126 13.7855 17.3126C15.1639 17.3126 16.28 16.0211 16.28 14.4258Z"
                                fill="#45AB68" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.3441 14.5733C16.3441 16.1272 15.2571 17.3863 13.9137 17.3863C12.5703 17.3863 11.4833 16.1272 11.4833 14.5733C11.4833 13.0193 12.5703 11.7602 13.9137 11.7602C15.2571 11.7602 16.3441 13.0193 16.3441 14.5733ZM16.5364 14.5733C16.5364 12.8955 15.362 11.5391 13.9137 11.5391C12.4654 11.5391 11.291 12.8984 11.291 14.5733C11.291 16.2481 12.4654 17.6074 13.9137 17.6074C15.362 17.6074 16.5364 16.2481 16.5364 14.5733Z"
                                fill="#45AA67" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.6006 13.4541C16.6006 15.0906 15.4553 16.4146 14.0419 16.4146C12.6286 16.4146 11.4833 15.0877 11.4833 13.4541C11.4833 11.8205 12.6286 10.4936 14.0419 10.4936C15.4553 10.4936 16.6006 11.8205 16.6006 13.4541ZM16.7929 13.4541C16.7929 11.6967 15.5602 10.2695 14.0419 10.2695C12.5237 10.2695 11.291 11.6937 11.291 13.4541C11.291 15.2145 12.5237 16.6387 14.0419 16.6387C15.5602 16.6387 16.7929 15.2145 16.7929 13.4541Z"
                                fill="#43AA67" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.857 13.6015C16.857 15.3177 15.6535 16.7124 14.1702 16.7124C12.6869 16.7124 11.4833 15.3206 11.4833 13.6015C11.4833 11.8825 12.6869 10.4907 14.1702 10.4907C15.6535 10.4907 16.857 11.8825 16.857 13.6015ZM17.0493 13.6015C17.0493 11.7616 15.7613 10.2695 14.1702 10.2695C12.5791 10.2695 11.291 11.7616 11.291 13.6015C11.291 15.4415 12.5791 16.9335 14.1702 16.9335C15.7613 16.9335 17.0493 15.4415 17.0493 13.6015Z"
                                fill="#43A966" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.1134 13.749C17.1134 15.5477 15.8545 17.0073 14.2984 17.0073C12.7422 17.0073 11.4833 15.5477 11.4833 13.749C11.4833 11.9503 12.7422 10.4907 14.2984 10.4907C15.8545 10.4907 17.1134 11.9503 17.1134 13.749ZM17.3058 13.749C17.3058 11.8264 15.9594 10.2695 14.2984 10.2695C12.6373 10.2695 11.291 11.8264 11.291 13.749C11.291 15.6715 12.6373 17.2284 14.2984 17.2284C15.9594 17.2284 17.3058 15.6715 17.3058 13.749Z"
                                fill="#44A965" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.367 13.8964C17.367 15.7777 16.0498 17.3021 14.4237 17.3021C12.7976 17.3021 11.4804 15.7777 11.4804 13.8964C11.4804 12.0151 12.7976 10.4907 14.4237 10.4907C16.0498 10.4907 17.367 12.0151 17.367 13.8964ZM17.5593 13.8964C17.5593 11.8943 16.1547 10.2695 14.4266 10.2695C12.6985 10.2695 11.291 11.8943 11.291 13.8964C11.291 15.8986 12.6956 17.5233 14.4266 17.5233C16.1576 17.5233 17.5593 15.8986 17.5593 13.8964Z"
                                fill="#43A865" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.3666 14.0468C16.3666 16.0106 14.9911 17.6 13.2951 17.6C11.5991 17.6 10.2236 16.0077 10.2236 14.0468C10.2236 12.0859 11.5991 10.4936 13.2951 10.4936C14.9911 10.4936 16.3666 12.0859 16.3666 14.0468ZM16.5589 14.0468C16.5589 11.9621 15.0989 10.2695 13.298 10.2695C11.4971 10.2695 10.0371 11.9591 10.0371 14.0468C10.0371 16.1345 11.4971 17.8241 13.298 17.8241C15.0989 17.8241 16.5589 16.1345 16.5589 14.0468Z"
                                fill="#42A865" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.623 14.1942C16.623 16.2377 15.1922 17.8948 13.4262 17.8948C11.6603 17.8948 10.2294 16.2377 10.2294 14.1942C10.2294 12.1508 11.6603 10.4936 13.4262 10.4936C15.1922 10.4936 16.623 12.1508 16.623 14.1942ZM16.8154 14.1942C16.8154 12.0269 15.2971 10.2695 13.4262 10.2695C11.5554 10.2695 10.0371 12.0269 10.0371 14.1942C10.0371 16.3615 11.5554 18.1189 13.4262 18.1189C15.2971 18.1189 16.8154 16.3615 16.8154 14.1942Z"
                                fill="#42A764" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.8795 14.3417C16.8795 16.4677 15.3904 18.1926 13.5545 18.1926C11.7186 18.1926 10.2294 16.4677 10.2294 14.3417C10.2294 12.2157 11.7186 10.4907 13.5545 10.4907C15.3904 10.4907 16.8795 12.2157 16.8795 14.3417ZM17.0718 14.3417C17.0718 12.0918 15.4982 10.2695 13.5545 10.2695C11.6107 10.2695 10.0371 12.0918 10.0371 14.3417C10.0371 16.5915 11.6107 18.4138 13.5545 18.4138C15.4982 18.4138 17.0718 16.5915 17.0718 14.3417Z"
                                fill="#42A764" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.1359 14.4891C17.1359 16.6977 15.5885 18.4875 13.6827 18.4875C11.7768 18.4875 10.2294 16.6977 10.2294 14.4891C10.2294 12.2805 11.7768 10.4907 13.6827 10.4907C15.5885 10.4907 17.1359 12.2805 17.1359 14.4891ZM17.3283 14.4891C17.3283 12.1596 15.6963 10.2695 13.6827 10.2695C11.669 10.2695 10.0371 12.1596 10.0371 14.4891C10.0371 16.8186 11.669 18.7087 13.6827 18.7087C15.6963 18.7087 17.3283 16.8186 17.3283 14.4891Z"
                                fill="#40A764" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.3924 13.3675C17.3924 15.6586 15.7896 17.5133 13.8109 17.5133C11.8322 17.5133 10.2294 15.6557 10.2294 13.3675C10.2294 11.0793 11.8322 9.22164 13.8109 9.22164C15.7896 9.22164 17.3924 11.0793 17.3924 13.3675ZM17.5847 13.3675C17.5847 10.9555 15.8945 9.00049 13.8109 9.00049C11.7273 9.00049 10.0371 10.9555 10.0371 13.3675C10.0371 15.7795 11.7273 17.7345 13.8109 17.7345C15.8945 17.7345 17.5847 15.7795 17.5847 13.3675Z"
                                fill="#40A663" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.6488 13.5179C17.6488 15.8886 15.9878 17.8111 13.9391 17.8111C11.8905 17.8111 10.2294 15.8886 10.2294 13.5179C10.2294 11.1471 11.8905 9.22459 13.9391 9.22459C15.9878 9.22459 17.6488 11.1471 17.6488 13.5179ZM17.8411 13.5179C17.8411 11.0233 16.0956 9.00049 13.9391 9.00049C11.7827 9.00049 10.0371 11.0233 10.0371 13.5179C10.0371 16.0125 11.7827 18.0352 13.9391 18.0352C16.0956 18.0352 17.8411 16.0125 17.8411 13.5179Z"
                                fill="#40A663" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.9053 13.6653C17.9053 16.1186 16.1859 18.109 14.0673 18.109C11.9488 18.109 10.2294 16.1216 10.2294 13.6653C10.2294 11.2091 11.9488 9.22164 14.0673 9.22164C16.1859 9.22164 17.9053 11.212 17.9053 13.6653ZM18.0976 13.6653C18.0976 11.0882 16.2937 9.00049 14.0673 9.00049C11.841 9.00049 10.0371 11.0882 10.0371 13.6653C10.0371 16.2424 11.841 18.3301 14.0673 18.3301C16.2937 18.3301 18.0976 16.2424 18.0976 13.6653Z"
                                fill="#3EA563" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.1617 13.8127C18.1617 16.3486 16.387 18.4038 14.1956 18.4038C12.0041 18.4038 10.2294 16.3486 10.2294 13.8127C10.2294 11.2769 12.0041 9.22164 14.1956 9.22164C16.387 9.22164 18.1617 11.2769 18.1617 13.8127ZM18.354 13.8127C18.354 11.156 16.4919 9.00049 14.1956 9.00049C11.8992 9.00049 10.0371 11.156 10.0371 13.8127C10.0371 16.4695 11.8992 18.625 14.1956 18.625C16.4919 18.625 18.354 16.4695 18.354 13.8127Z"
                                fill="#3FA562" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.4181 13.9602C18.4181 16.5786 16.5851 18.6987 14.3238 18.6987C12.0624 18.6987 10.2294 16.5786 10.2294 13.9602C10.2294 11.3417 12.0624 9.22164 14.3238 9.22164C16.5851 9.22164 18.4181 11.3417 18.4181 13.9602ZM18.6105 13.9602C18.6105 11.2208 16.693 9.00049 14.3238 9.00049C11.9546 9.00049 10.0371 11.2208 10.0371 13.9602C10.0371 16.6995 11.9546 18.9199 14.3238 18.9199C16.693 18.9199 18.6105 16.6995 18.6105 13.9602Z"
                                fill="#3EA562" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.6688 14.1106C18.6688 16.8086 16.7775 18.9965 14.4462 18.9965C12.1149 18.9965 10.2236 16.8086 10.2236 14.1106C10.2236 11.4125 12.1149 9.22459 14.4462 9.22459C16.7775 9.22459 18.6688 11.4125 18.6688 14.1106ZM18.8611 14.1106C18.8611 11.2887 16.8853 9.00049 14.4491 9.00049C12.0129 9.00049 10.0371 11.2887 10.0371 14.1106C10.0371 16.9324 12.0129 19.2177 14.4491 19.2177C16.8853 19.2177 18.8611 16.9295 18.8611 14.1106Z"
                                fill="#3DA462" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.6703 14.258C17.6703 17.0386 15.7237 19.2914 13.3195 19.2914C10.9154 19.2914 8.96873 17.0386 8.96873 14.258C8.96873 11.4774 10.9154 9.22459 13.3195 9.22459C15.7237 9.22459 17.6703 11.4774 17.6703 14.258ZM17.8626 14.258C17.8626 11.3535 15.8286 9.00049 13.3224 9.00049C10.8163 9.00049 8.78223 11.3535 8.78223 14.258C8.78223 17.1624 10.8163 19.5155 13.3224 19.5155C15.8286 19.5155 17.8626 17.1624 17.8626 14.258Z"
                                fill="#3DA360" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M17.9268 14.4054C17.9268 17.2686 15.9218 19.5892 13.4507 19.5892C10.9795 19.5892 8.97456 17.2686 8.97456 14.4054C8.97456 11.5423 10.9795 9.22164 13.4507 9.22164C15.9218 9.22164 17.9268 11.5423 17.9268 14.4054ZM18.1191 14.4054C18.1191 11.4214 16.0297 9.00049 13.4507 9.00049C10.8717 9.00049 8.78223 11.4214 8.78223 14.4054C8.78223 17.3895 10.8717 19.8104 13.4507 19.8104C16.0297 19.8104 18.1191 17.3895 18.1191 14.4054Z"
                                fill="#3DA360" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.1832 14.5529C18.1832 17.4956 16.12 19.8841 13.5789 19.8841C11.0378 19.8841 8.97456 17.4986 8.97456 14.5529C8.97456 11.6071 11.0378 9.22164 13.5789 9.22164C16.12 9.22164 18.1832 11.6071 18.1832 14.5529ZM18.3755 14.5529C18.3755 11.4862 16.2278 9.00049 13.5789 9.00049C10.9299 9.00049 8.78223 11.4862 8.78223 14.5529C8.78223 17.6195 10.9299 20.1052 13.5789 20.1052C16.2278 20.1052 18.3755 17.6195 18.3755 14.5529Z"
                                fill="#3BA360" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.4396 13.4308C18.4396 16.4561 16.3211 18.9094 13.7071 18.9094C11.0931 18.9094 8.97456 16.4561 8.97456 13.4308C8.97456 10.4054 11.0931 7.95211 13.7071 7.95211C16.3211 7.95211 18.4396 10.4054 18.4396 13.4308ZM18.632 13.4308C18.632 10.2816 16.426 7.73096 13.7071 7.73096C10.9882 7.73096 8.78223 10.2845 8.78223 13.4308C8.78223 16.577 10.9882 19.1306 13.7071 19.1306C16.426 19.1306 18.632 16.577 18.632 13.4308Z"
                                fill="#3BA35F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.6961 13.5811C18.6961 16.689 16.5192 19.2072 13.8353 19.2072C11.1514 19.2072 8.97456 16.689 8.97456 13.5811C8.97456 10.4732 11.1514 7.95506 13.8353 7.95506C16.5192 7.95506 18.6961 10.4732 18.6961 13.5811ZM18.8884 13.5811C18.8884 10.3494 16.6271 7.73096 13.8353 7.73096C11.0436 7.73096 8.78223 10.3494 8.78223 13.5811C8.78223 16.8129 11.0436 19.4313 13.8353 19.4313C16.6271 19.4313 18.8884 16.8129 18.8884 13.5811Z"
                                fill="#3BA25F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.9525 13.7286C18.9525 16.919 16.7174 19.5021 13.9635 19.5021C11.2097 19.5021 8.97456 16.9161 8.97456 13.7286C8.97456 10.541 11.2068 7.95506 13.9635 7.95506C16.7203 7.95506 18.9525 10.541 18.9525 13.7286ZM19.1449 13.7286C19.1449 10.4172 16.8252 7.73096 13.9635 7.73096C11.1019 7.73096 8.78223 10.4172 8.78223 13.7286C8.78223 17.0399 11.1019 19.7262 13.9635 19.7262C16.8252 19.7262 19.1449 17.0399 19.1449 13.7286Z"
                                fill="#39A15F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.209 13.876C19.209 17.1461 16.9185 19.7999 14.0918 19.7999C11.2651 19.7999 8.97456 17.149 8.97456 13.876C8.97456 10.603 11.2651 7.95211 14.0918 7.95211C16.9185 7.95211 19.209 10.603 19.209 13.876ZM19.4013 13.876C19.4013 10.4821 17.0234 7.73096 14.0918 7.73096C11.1602 7.73096 8.78223 10.4821 8.78223 13.876C8.78223 17.2699 11.1602 20.0211 14.0918 20.0211C17.0234 20.0211 19.4013 17.2699 19.4013 13.876Z"
                                fill="#39A15E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.4654 14.0234C19.4654 17.3761 17.1166 20.0948 14.22 20.0948C11.3233 20.0948 8.97456 17.3761 8.97456 14.0234C8.97456 10.6708 11.3233 7.95211 14.22 7.95211C17.1166 7.95211 19.4654 10.6708 19.4654 14.0234ZM19.6577 14.0234C19.6577 10.5469 17.2244 7.73096 14.22 7.73096C11.2155 7.73096 8.78223 10.5499 8.78223 14.0234C8.78223 17.497 11.2155 20.3159 14.22 20.3159C17.2244 20.3159 19.6577 17.497 19.6577 14.0234Z"
                                fill="#39A15E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.7219 14.1709C19.7219 17.6061 17.3177 20.3896 14.3482 20.3896C11.3787 20.3896 8.97456 17.6061 8.97456 14.1709C8.97456 10.7357 11.3787 7.95211 14.3482 7.95211C17.3177 7.95211 19.7219 10.7357 19.7219 14.1709ZM19.9142 14.1709C19.9142 10.6148 17.4226 7.73096 14.3482 7.73096C11.2738 7.73096 8.78223 10.6148 8.78223 14.1709C8.78223 17.727 11.2738 20.6108 14.3482 20.6108C17.4226 20.6108 19.9142 17.727 19.9142 14.1709Z"
                                fill="#37A05E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.9725 14.3213C19.9725 17.839 17.51 20.6875 14.4706 20.6875C11.4312 20.6875 8.96873 17.8361 8.96873 14.3213C8.96873 10.8064 11.4312 7.95506 14.4706 7.95506C17.51 7.95506 19.9725 10.8064 19.9725 14.3213ZM20.1648 14.3213C20.1648 10.6826 17.6149 7.73096 14.4735 7.73096C11.3321 7.73096 8.78223 10.6796 8.78223 14.3213C8.78223 17.9629 11.3321 20.9116 14.4735 20.9116C17.6149 20.9116 20.1648 17.9629 20.1648 14.3213Z"
                                fill="#38A05D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M18.974 14.4687C18.974 18.0661 16.4533 20.9853 13.3439 20.9853C10.2346 20.9853 7.71385 18.069 7.71385 14.4687C7.71385 10.8684 10.2346 7.95211 13.3439 7.95211C16.4533 7.95211 18.974 10.8684 18.974 14.4687ZM19.1664 14.4687C19.1664 10.7475 16.5611 7.73096 13.3469 7.73096C10.1326 7.73096 7.52734 10.7475 7.52734 14.4687C7.52734 18.1899 10.1326 21.2064 13.3469 21.2064C16.5611 21.2064 19.1664 18.1899 19.1664 14.4687Z"
                                fill="#38A05D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.2305 14.6161C19.2305 18.2961 16.6544 21.2801 13.4751 21.2801C10.2958 21.2801 7.71968 18.2961 7.71968 14.6161C7.71968 10.9362 10.2958 7.95211 13.4751 7.95211C16.6544 7.95211 19.2305 10.9362 19.2305 14.6161ZM19.4228 14.6161C19.4228 10.8123 16.7593 7.73096 13.4751 7.73096C10.1909 7.73096 7.52734 10.8123 7.52734 14.6161C7.52734 18.4199 10.1909 21.5013 13.4751 21.5013C16.7593 21.5013 19.4228 18.4199 19.4228 14.6161Z"
                                fill="#369F5D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.4869 13.494C19.4869 17.2565 16.8525 20.3055 13.6033 20.3055C10.354 20.3055 7.71967 17.2565 7.71967 13.494C7.71967 9.73151 10.354 6.68258 13.6033 6.68258C16.8525 6.68258 19.4869 9.73151 19.4869 13.494ZM19.6792 13.494C19.6792 9.61062 16.9575 6.46143 13.6033 6.46143C10.2491 6.46143 7.52734 9.61062 7.52734 13.494C7.52734 17.3774 10.2491 20.5266 13.6033 20.5266C16.9575 20.5266 19.6792 17.3774 19.6792 13.494Z"
                                fill="#369F5C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.7434 13.6444C19.7434 17.4895 17.0507 20.6033 13.7315 20.6033C10.4123 20.6033 7.71967 17.4865 7.71967 13.6444C7.71967 9.80228 10.4123 6.68553 13.7315 6.68553C17.0507 6.68553 19.7434 9.80228 19.7434 13.6444ZM19.9357 13.6444C19.9357 9.67844 17.1585 6.46143 13.7315 6.46143C10.3045 6.46143 7.52734 9.67549 7.52734 13.6444C7.52734 17.6133 10.3045 20.8274 13.7315 20.8274C17.1585 20.8274 19.9357 17.6133 19.9357 13.6444Z"
                                fill="#369E5C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M19.9998 13.7918C19.9998 17.7165 17.2518 20.8982 13.8597 20.8982C10.4677 20.8982 7.71968 17.7165 7.71968 13.7918C7.71968 9.86715 10.4677 6.68553 13.8597 6.68553C17.2518 6.68553 19.9998 9.86715 19.9998 13.7918ZM20.1921 13.7918C20.1921 9.74331 17.3567 6.46143 13.8597 6.46143C10.3628 6.46143 7.52734 9.74331 7.52734 13.7918C7.52734 17.8404 10.3628 21.1223 13.8597 21.1223C17.3567 21.1223 20.1921 17.8404 20.1921 13.7918Z"
                                fill="#349E5C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.2562 13.9393C20.2562 17.9465 17.4499 21.196 13.988 21.196C10.526 21.196 7.71967 17.9465 7.71967 13.9393C7.71967 9.93202 10.526 6.68258 13.988 6.68258C17.4499 6.68258 20.2562 9.93202 20.2562 13.9393ZM20.4486 13.9393C20.4486 9.80818 17.5548 6.46143 13.988 6.46143C10.4211 6.46143 7.52734 9.80818 7.52734 13.9393C7.52734 18.0704 10.4211 21.4171 13.988 21.4171C17.5548 21.4171 20.4486 18.0704 20.4486 13.9393Z"
                                fill="#349D5B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.5127 14.0867C20.5127 18.1765 17.6481 21.4909 14.1162 21.4909C10.5843 21.4909 7.71967 18.1765 7.71967 14.0867C7.71967 9.99689 10.5843 6.68258 14.1162 6.68258C17.6481 6.68258 20.5127 9.99689 20.5127 14.0867ZM20.705 14.0867C20.705 9.876 17.7559 6.46143 14.1162 6.46143C10.4764 6.46143 7.52734 9.876 7.52734 14.0867C7.52734 18.2974 10.4764 21.712 14.1162 21.712C17.7559 21.712 20.705 18.2974 20.705 14.0867Z"
                                fill="#349D5B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.7691 14.2341C20.7691 18.4036 17.8492 21.7857 14.2444 21.7857C10.6396 21.7857 7.71968 18.4036 7.71968 14.2341C7.71968 10.0647 10.6396 6.68258 14.2444 6.68258C17.8492 6.68258 20.7691 10.0647 20.7691 14.2341ZM20.9615 14.2341C20.9615 9.94087 17.9541 6.46143 14.2444 6.46143C10.5347 6.46143 7.52734 9.94087 7.52734 14.2341C7.52734 18.5274 10.5347 22.0069 14.2444 22.0069C17.9541 22.0069 20.9615 18.5274 20.9615 14.2341Z"
                                fill="#329C5B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.0256 14.3845C21.0256 18.6365 18.0473 22.0835 14.3726 22.0835C10.6979 22.0835 7.71967 18.6365 7.71967 14.3845C7.71967 10.1325 10.6979 6.68553 14.3726 6.68553C18.0473 6.68553 21.0256 10.1325 21.0256 14.3845ZM21.2179 14.3845C21.2179 10.0087 18.1552 6.46143 14.3726 6.46143C10.5901 6.46143 7.52734 10.0087 7.52734 14.3845C7.52734 18.7604 10.593 22.3076 14.3726 22.3076C18.1522 22.3076 21.2179 18.7604 21.2179 14.3845Z"
                                fill="#339C5A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.0223 14.532C20.0223 18.8665 16.9858 22.3814 13.2411 22.3814C9.49646 22.3814 6.45994 18.8665 6.45994 14.532C6.45994 10.1974 9.49646 6.68258 13.2411 6.68258C16.9858 6.68258 20.0223 10.1974 20.0223 14.532ZM20.2146 14.532C20.2146 10.0736 17.0936 6.46143 13.244 6.46143C9.39447 6.46143 6.27344 10.0736 6.27344 14.532C6.27344 18.9904 9.39447 22.6025 13.244 22.6025C17.0936 22.6025 20.2146 18.9904 20.2146 14.532Z"
                                fill="#339C5A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.2787 13.4099C20.2787 17.827 17.1868 21.4067 13.3693 21.4067C9.55183 21.4067 6.45994 17.827 6.45994 13.4099C6.45994 8.99274 9.55183 5.41305 13.3693 5.41305C17.1868 5.41305 20.2787 8.99274 20.2787 13.4099ZM20.4711 13.4099C20.4711 8.87185 17.2917 5.19189 13.3722 5.19189C9.45275 5.19189 6.27344 8.87185 6.27344 13.4099C6.27344 17.9479 9.45275 21.6278 13.3722 21.6278C17.2917 21.6278 20.4711 17.9479 20.4711 13.4099Z"
                                fill="#309B59" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.5352 13.5573C20.5352 18.054 17.385 21.7016 13.5005 21.7016C9.61594 21.7016 6.46577 18.054 6.46577 13.5573C6.46577 9.06056 9.61594 5.41305 13.5005 5.41305C17.385 5.41305 20.5352 9.06056 20.5352 13.5573ZM20.7275 13.5573C20.7275 8.93672 17.4928 5.19189 13.5005 5.19189C9.50812 5.19189 6.27344 8.93672 6.27344 13.5573C6.27344 18.1779 9.50812 21.9227 13.5005 21.9227C17.4928 21.9227 20.7275 18.1779 20.7275 13.5573Z"
                                fill="#319B59" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M20.7916 13.7047C20.7916 18.284 17.5832 21.9964 13.6287 21.9964C9.67422 21.9964 6.46577 18.284 6.46577 13.7047C6.46577 9.12543 9.67422 5.41305 13.6287 5.41305C17.5832 5.41305 20.7916 9.12543 20.7916 13.7047ZM20.9839 13.7047C20.9839 9.00159 17.691 5.19189 13.6287 5.19189C9.5664 5.19189 6.27344 9.00454 6.27344 13.7047C6.27344 18.4049 9.5664 22.2176 13.6287 22.2176C17.691 22.2176 20.9839 18.4049 20.9839 13.7047Z"
                                fill="#309B58" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.0481 13.8551C21.0481 18.517 17.7842 22.2942 13.7569 22.2942C9.72959 22.2942 6.46577 18.514 6.46577 13.8551C6.46577 9.1962 9.72959 5.41599 13.7569 5.41599C17.7842 5.41599 21.0481 9.1962 21.0481 13.8551ZM21.2404 13.8551C21.2404 9.07236 17.8891 5.19189 13.7569 5.19189C9.62468 5.19189 6.27344 9.06941 6.27344 13.8551C6.27344 18.6408 9.62468 22.5183 13.7569 22.5183C17.8891 22.5183 21.2404 18.6408 21.2404 13.8551Z"
                                fill="#2F9A58" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.3045 14.0026C21.3045 18.747 17.9824 22.5921 13.8851 22.5921C9.78787 22.5921 6.46577 18.747 6.46577 14.0026C6.46577 9.25812 9.78787 5.41305 13.8851 5.41305C17.9824 5.41305 21.3045 9.25812 21.3045 14.0026ZM21.4968 14.0026C21.4968 9.13723 18.0902 5.19189 13.8851 5.19189C9.68005 5.19189 6.27344 9.13723 6.27344 14.0026C6.27344 18.8679 9.68005 22.8132 13.8851 22.8132C18.0902 22.8132 21.4968 18.8679 21.4968 14.0026Z"
                                fill="#2F9957" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.5609 14.15C21.5609 18.974 18.1806 22.8869 14.0134 22.8869C9.84616 22.8869 6.46577 18.977 6.46577 14.15C6.46577 9.32299 9.84616 5.41305 14.0134 5.41305C18.1806 5.41305 21.5609 9.32299 21.5609 14.15ZM21.7533 14.15C21.7533 9.2021 18.2884 5.19189 14.0134 5.19189C9.73833 5.19189 6.27344 9.2021 6.27344 14.15C6.27344 19.0979 9.73833 23.1081 14.0134 23.1081C18.2884 23.1081 21.7533 19.0979 21.7533 14.15Z"
                                fill="#2F9957" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.8174 14.2974C21.8174 19.204 18.3816 23.1818 14.1416 23.1818C9.90152 23.1818 6.46577 19.204 6.46577 14.2974C6.46577 9.39081 9.90152 5.41305 14.1416 5.41305C18.3816 5.41305 21.8174 9.39081 21.8174 14.2974ZM22.0097 14.2974C22.0097 9.26697 18.4865 5.19189 14.1416 5.19189C9.79661 5.19189 6.27344 9.26992 6.27344 14.2974C6.27344 19.3249 9.79661 23.4029 14.1416 23.4029C18.4865 23.4029 22.0097 19.3249 22.0097 14.2974Z"
                                fill="#2D9956" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.0738 14.4478C22.0738 19.437 18.5798 23.4796 14.2698 23.4796C9.95981 23.4796 6.46577 19.437 6.46577 14.4478C6.46577 9.45864 9.95981 5.41599 14.2698 5.41599C18.5798 5.41599 22.0738 9.45864 22.0738 14.4478ZM22.2662 14.4478C22.2662 9.33774 18.6876 5.19189 14.2698 5.19189C9.85198 5.19189 6.27344 9.33479 6.27344 14.4478C6.27344 19.5608 9.85198 23.7037 14.2698 23.7037C18.6876 23.7037 22.2662 19.5608 22.2662 14.4478Z"
                                fill="#2D9856" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.3303 14.5952C22.3303 19.667 18.778 23.7745 14.398 23.7745C10.0181 23.7745 6.46577 19.664 6.46577 14.5952C6.46577 9.52646 10.0181 5.41599 14.398 5.41599C18.778 5.41599 22.3303 9.52646 22.3303 14.5952ZM22.5226 14.5952C22.5226 9.40261 18.8858 5.19189 14.398 5.19189C9.91027 5.19189 6.27344 9.40261 6.27344 14.5952C6.27344 19.7879 9.91027 23.9986 14.398 23.9986C18.8858 23.9986 22.5226 19.7879 22.5226 14.5952Z"
                                fill="#2D9855" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.326 13.4731C21.326 18.6245 17.7183 22.8028 13.2655 22.8028C8.81275 22.8028 5.20506 18.6274 5.20506 13.4731C5.20506 8.31885 8.81275 4.14351 13.2655 4.14351C17.7183 4.14351 21.326 8.31885 21.326 13.4731ZM21.5183 13.4731C21.5183 8.19795 17.8232 3.92236 13.2684 3.92236C8.71367 3.92236 5.01855 8.19795 5.01855 13.4731C5.01855 18.7483 8.71367 23.0239 13.2684 23.0239C17.8232 23.0239 21.5183 18.7483 21.5183 13.4731Z"
                                fill="#2B9755" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.5824 13.6206C21.5824 18.8545 17.9165 23.0976 13.3938 23.0976C8.87103 23.0976 5.20506 18.8545 5.20506 13.6206C5.20506 8.38667 8.87103 4.14351 13.3938 4.14351C17.9165 4.14351 21.5824 8.38667 21.5824 13.6206ZM21.7748 13.6206C21.7748 8.26282 18.0243 3.92236 13.3967 3.92236C8.76903 3.92236 5.01855 8.26577 5.01855 13.6206C5.01855 18.9754 8.76903 23.3188 13.3967 23.3188C18.0243 23.3188 21.7748 18.9754 21.7748 13.6206Z"
                                fill="#2B9755" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M21.8389 13.768C21.8389 19.0845 18.1175 23.3925 13.5249 23.3925C8.93222 23.3925 5.21089 19.0845 5.21089 13.768C5.21089 8.45154 8.93514 4.14351 13.5249 4.14351C18.1146 4.14351 21.8389 8.45154 21.8389 13.768ZM22.0312 13.768C22.0312 8.33064 18.2225 3.92236 13.5249 3.92236C8.82732 3.92236 5.01855 8.33064 5.01855 13.768C5.01855 19.2054 8.82732 23.6137 13.5249 23.6137C18.2225 23.6137 22.0312 19.2054 22.0312 13.768Z"
                                fill="#2B9654" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.0953 13.9184C22.0953 19.3145 18.3157 23.6903 13.6531 23.6903C8.99051 23.6903 5.21089 19.3145 5.21089 13.9184C5.21089 8.52231 8.99051 4.14646 13.6531 4.14646C18.3157 4.14646 22.0953 8.52231 22.0953 13.9184ZM22.2877 13.9184C22.2877 8.39846 18.4206 3.92236 13.6531 3.92236C8.8856 3.92236 5.01855 8.39846 5.01855 13.9184C5.01855 19.4383 8.8856 23.9144 13.6531 23.9144C18.4206 23.9144 22.2877 19.4383 22.2877 13.9184Z"
                                fill="#299654" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.3518 14.0658C22.3518 19.5445 18.5139 23.9881 13.7813 23.9881C9.04879 23.9881 5.21089 19.5474 5.21089 14.0658C5.21089 8.58423 9.04879 4.14351 13.7813 4.14351C18.5139 4.14351 22.3518 8.58423 22.3518 14.0658ZM22.5441 14.0658C22.5441 8.46333 18.6217 3.92236 13.7813 3.92236C8.94097 3.92236 5.01855 8.46333 5.01855 14.0658C5.01855 19.6683 8.94097 24.2093 13.7813 24.2093C18.6217 24.2093 22.5441 19.6683 22.5441 14.0658Z"
                                fill="#299653" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.6082 14.2133C22.6082 19.7745 18.7149 24.283 13.9096 24.283C9.10416 24.283 5.21089 19.7745 5.21089 14.2133C5.21089 8.65205 9.10416 4.14351 13.9096 4.14351C18.7149 4.14351 22.6082 8.65205 22.6082 14.2133ZM22.8006 14.2133C22.8006 8.5282 18.8199 3.92236 13.9096 3.92236C8.99925 3.92236 5.01855 8.53115 5.01855 14.2133C5.01855 19.8954 8.99925 24.5042 13.9096 24.5042C18.8199 24.5042 22.8006 19.8954 22.8006 14.2133Z"
                                fill="#279453" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.8647 14.3607C22.8647 20.0045 18.9131 24.5779 14.0378 24.5779C9.16244 24.5779 5.21089 20.0045 5.21089 14.3607C5.21089 8.71692 9.16244 4.14351 14.0378 4.14351C18.9131 4.14351 22.8647 8.71692 22.8647 14.3607ZM23.057 14.3607C23.057 8.59602 19.018 3.92236 14.0378 3.92236C9.05753 3.92236 5.01855 8.59602 5.01855 14.3607C5.01855 20.1254 9.05753 24.799 14.0378 24.799C19.018 24.799 23.057 20.1254 23.057 14.3607Z"
                                fill="#279452" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.1211 14.5111C23.1211 20.2345 19.1113 24.8757 14.166 24.8757C9.22072 24.8757 5.21089 20.2345 5.21089 14.5111C5.21089 8.78769 9.22072 4.14646 14.166 4.14646C19.1113 4.14646 23.1211 8.78769 23.1211 14.5111ZM23.3134 14.5111C23.3134 8.66384 19.2191 3.92236 14.166 3.92236C9.1129 3.92236 5.01855 8.66384 5.01855 14.5111C5.01855 20.3583 9.1129 25.0998 14.166 25.0998C19.2191 25.0998 23.3134 20.3583 23.3134 14.5111Z"
                                fill="#279452" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.3776 13.3895C23.3776 19.1954 19.3123 23.9015 14.2942 23.9015C9.27609 23.9015 5.21089 19.1954 5.21089 13.3895C5.21089 7.58351 9.27609 2.87742 14.2942 2.87742C19.3123 2.87742 23.3776 7.58351 23.3776 13.3895ZM23.5699 13.3895C23.5699 7.45967 19.4172 2.65332 14.2942 2.65332C9.17118 2.65332 5.01855 7.45967 5.01855 13.3895C5.01855 19.3193 9.17118 24.1256 14.2942 24.1256C19.4172 24.1256 23.5699 19.3193 23.5699 13.3895Z"
                                fill="#259451" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.634 13.5369C23.634 19.4254 19.5105 24.1993 14.4224 24.1993C9.33437 24.1993 5.21089 19.4254 5.21089 13.5369C5.21089 7.64838 9.33437 2.87447 14.4224 2.87447C19.5105 2.87447 23.634 7.64838 23.634 13.5369ZM23.8263 13.5369C23.8263 7.52749 19.6154 2.65332 14.4224 2.65332C9.22947 2.65332 5.01855 7.52749 5.01855 13.5369C5.01855 19.5463 9.22947 24.4205 14.4224 24.4205C19.6154 24.4205 23.8263 19.5463 23.8263 13.5369Z"
                                fill="#259351" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.6297 13.6843C22.6297 19.6554 18.448 24.4942 13.29 24.4942C8.13195 24.4942 3.95018 19.6554 3.95018 13.6843C3.95018 7.71326 8.13195 2.87447 13.29 2.87447C18.448 2.87447 22.6297 7.71326 22.6297 13.6843ZM22.8221 13.6843C22.8221 7.59236 18.5558 2.65332 13.2929 2.65332C8.02995 2.65332 3.76367 7.59236 3.76367 13.6843C3.76367 19.7763 8.02995 24.7153 13.2929 24.7153C18.5558 24.7153 22.8221 19.7763 22.8221 13.6843Z"
                                fill="#259351" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.8862 13.8318C22.8862 19.8825 18.649 24.7891 13.4211 24.7891C8.19314 24.7891 3.95309 19.8825 3.95309 13.8318C3.95309 7.78108 8.19023 2.87447 13.4211 2.87447C18.6519 2.87447 22.8862 7.78108 22.8862 13.8318ZM23.0785 13.8318C23.0785 7.65723 18.7539 2.65332 13.4211 2.65332C8.08823 2.65332 3.76367 7.65723 3.76367 13.8318C3.76367 20.0063 8.08823 25.0102 13.4211 25.0102C18.7539 25.0102 23.0785 20.0063 23.0785 13.8318Z"
                                fill="#239250" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.1426 13.9822C23.1426 20.1154 18.8472 25.0869 13.5493 25.0869C8.25142 25.0869 3.95601 20.1154 3.95601 13.9822C3.95601 7.8489 8.25142 2.87742 13.5493 2.87742C18.8472 2.87742 23.1426 7.8489 23.1426 13.9822ZM23.3349 13.9822C23.3349 7.72505 18.9521 2.65332 13.5493 2.65332C8.14651 2.65332 3.76367 7.72505 3.76367 13.9822C3.76367 20.2393 8.14651 25.311 13.5493 25.311C18.9521 25.311 23.3349 20.2393 23.3349 13.9822Z"
                                fill="#239250" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.3991 14.1296C23.3991 20.3454 19.0453 25.3847 13.6775 25.3847C8.30971 25.3847 3.95601 20.3454 3.95601 14.1296C3.95601 7.91377 8.30971 2.87447 13.6775 2.87447C19.0453 2.87447 23.3991 7.91377 23.3991 14.1296ZM23.5914 14.1296C23.5914 7.79287 19.1532 2.65332 13.6775 2.65332C8.20188 2.65332 3.76367 7.78992 3.76367 14.1296C3.76367 20.4692 8.20188 25.6059 13.6775 25.6059C19.1532 25.6059 23.5914 20.4692 23.5914 14.1296Z"
                                fill="#23924F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.6555 14.277C23.6555 20.5754 19.2464 25.6796 13.8057 25.6796C8.36507 25.6796 3.956 20.5754 3.956 14.277C3.956 7.97864 8.36507 2.87447 13.8057 2.87447C19.2464 2.87447 23.6555 7.97864 23.6555 14.277ZM23.8478 14.277C23.8478 7.85774 19.3513 2.65332 13.8057 2.65332C8.26017 2.65332 3.76367 7.85774 3.76367 14.277C3.76367 20.6963 8.26017 25.9007 13.8057 25.9007C19.3513 25.9007 23.8478 20.6963 23.8478 14.277Z"
                                fill="#20914F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.9119 14.4245C23.9119 20.8025 19.4446 25.9744 13.934 25.9744C8.42336 25.9744 3.95601 20.8025 3.95601 14.4245C3.95601 8.04646 8.42336 2.87447 13.934 2.87447C19.4446 2.87447 23.9119 8.04646 23.9119 14.4245ZM24.1043 14.4245C24.1043 7.92261 19.5495 2.65332 13.934 2.65332C8.31845 2.65332 3.76367 7.92261 3.76367 14.4245C3.76367 20.9263 8.31553 26.1956 13.934 26.1956C19.5524 26.1956 24.1043 20.9263 24.1043 14.4245Z"
                                fill="#21914F" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.1684 14.5719C24.1684 21.0324 19.6427 26.2693 14.0622 26.2693C8.48164 26.2693 3.95601 21.0324 3.95601 14.5719C3.95601 8.11133 8.48164 2.87447 14.0622 2.87447C19.6427 2.87447 24.1684 8.11133 24.1684 14.5719ZM24.3607 14.5719C24.3607 7.98748 19.7506 2.65332 14.0622 2.65332C8.37382 2.65332 3.76367 7.99043 3.76367 14.5719C3.76367 21.1533 8.37382 26.4905 14.0622 26.4905C19.7506 26.4905 24.3607 21.1533 24.3607 14.5719Z"
                                fill="#1E904E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.4248 13.4527C24.4248 19.9959 19.8438 25.2976 14.1904 25.2976C8.53701 25.2976 3.956 19.9929 3.956 13.4527C3.956 6.91257 8.53701 1.60789 14.1904 1.60789C19.8438 1.60789 24.4248 6.91257 24.4248 13.4527ZM24.6172 13.4527C24.6172 6.78872 19.9487 1.38379 14.1904 1.38379C8.4321 1.38379 3.76367 6.78577 3.76367 13.4527C3.76367 20.1197 8.4321 25.5217 14.1904 25.5217C19.9487 25.5217 24.6172 20.1197 24.6172 13.4527Z"
                                fill="#1E8F4E" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.6813 13.6002C24.6813 20.2229 20.042 25.5954 14.3186 25.5954C8.59529 25.5954 3.956 20.2259 3.956 13.6002C3.956 6.97449 8.59529 1.60494 14.3186 1.60494C20.042 1.60494 24.6813 6.97449 24.6813 13.6002ZM24.8736 13.6002C24.8736 6.85359 20.1498 1.38379 14.3186 1.38379C8.48747 1.38379 3.76367 6.85359 3.76367 13.6002C3.76367 20.3468 8.48747 25.8166 14.3186 25.8166C20.1498 25.8166 24.8736 20.3468 24.8736 13.6002Z"
                                fill="#1E8F4D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.9377 13.7476C24.9377 20.4529 20.2401 25.8903 14.4469 25.8903C8.65357 25.8903 3.95601 20.4529 3.95601 13.7476C3.95601 7.04231 8.65357 1.60494 14.4469 1.60494C20.2401 1.60494 24.9377 7.04231 24.9377 13.7476ZM25.13 13.7476C25.13 6.91846 20.348 1.38379 14.4469 1.38379C8.54575 1.38379 3.76367 6.91846 3.76367 13.7476C3.76367 20.5768 8.54575 26.1114 14.4469 26.1114C20.348 26.1114 25.13 20.5768 25.13 13.7476Z"
                                fill="#1B8F4D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M23.9344 13.895C23.9344 20.6829 19.1815 26.1851 13.3153 26.1851C7.44921 26.1851 2.69627 20.6829 2.69627 13.895C2.69627 7.10718 7.44921 1.60494 13.3153 1.60494C19.1815 1.60494 23.9344 7.10718 23.9344 13.895ZM24.1268 13.895C24.1268 6.98333 19.2864 1.38379 13.3183 1.38379C7.35013 1.38379 2.50977 6.98628 2.50977 13.895C2.50977 20.8038 7.35013 26.4063 13.3183 26.4063C19.2864 26.4063 24.1268 20.8038 24.1268 13.895Z"
                                fill="#1C8F4D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.1909 14.0454C24.1909 20.9158 19.3796 26.483 13.4465 26.483C7.51332 26.483 2.7021 20.9129 2.7021 14.0454C2.7021 7.17795 7.51332 1.60789 13.4465 1.60789C19.3796 1.60789 24.1909 7.17795 24.1909 14.0454ZM24.3832 14.0454C24.3832 7.0541 19.4875 1.38379 13.4465 1.38379C7.4055 1.38379 2.50977 7.05115 2.50977 14.0454C2.50977 21.0397 7.4055 26.7071 13.4465 26.7071C19.4875 26.7071 24.3832 21.0397 24.3832 14.0454Z"
                                fill="#1C8E4C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.4473 14.1929C24.4473 21.1429 19.5778 26.7778 13.5747 26.7778C7.5716 26.7778 2.7021 21.1429 2.7021 14.1929C2.7021 7.24282 7.5716 1.60789 13.5747 1.60789C19.5778 1.60789 24.4473 7.24282 24.4473 14.1929ZM24.6396 14.1929C24.6396 7.11897 19.6856 1.38379 13.5747 1.38379C7.46378 1.38379 2.50977 7.11897 2.50977 14.1929C2.50977 21.2667 7.46378 27.0019 13.5747 27.0019C19.6856 27.0019 24.6396 21.2667 24.6396 14.1929Z"
                                fill="#198D4B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.7037 14.3403C24.7037 21.3729 19.7789 27.0756 13.7029 27.0756C7.62697 27.0756 2.7021 21.3729 2.7021 14.3403C2.7021 7.30769 7.62697 1.60494 13.7029 1.60494C19.7789 1.60494 24.7037 7.30769 24.7037 14.3403ZM24.8961 14.3403C24.8961 7.18384 19.8838 1.38379 13.7029 1.38379C7.52206 1.38379 2.50977 7.18384 2.50977 14.3403C2.50977 21.4967 7.52206 27.2968 13.7029 27.2968C19.8838 27.2968 24.8961 21.4967 24.8961 14.3403Z"
                                fill="#198D4B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M24.9602 14.4877C24.9602 21.6029 19.977 27.3705 13.8311 27.3705C7.68525 27.3705 2.7021 21.6029 2.7021 14.4877C2.7021 7.37256 7.68525 1.60494 13.8311 1.60494C19.977 1.60494 24.9602 7.37256 24.9602 14.4877ZM25.1525 14.4877C25.1525 7.25166 20.0849 1.38379 13.8311 1.38379C7.57743 1.38379 2.50977 7.25166 2.50977 14.4877C2.50977 21.7238 7.57743 27.5917 13.8311 27.5917C20.0849 27.5917 25.1525 21.7238 25.1525 14.4877Z"
                                fill="#1A8D4B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.2166 13.3656C25.2166 20.5634 20.1752 26.3959 13.9594 26.3959C7.74353 26.3959 2.7021 20.5634 2.7021 13.3656C2.7021 6.1679 7.74353 0.335409 13.9594 0.335409C20.1752 0.335409 25.2166 6.1679 25.2166 13.3656ZM25.409 13.3656C25.409 6.047 20.283 0.114258 13.9594 0.114258C7.63571 0.114258 2.50977 6.047 2.50977 13.3656C2.50977 20.6843 7.63571 26.617 13.9594 26.617C20.283 26.617 25.409 20.6843 25.409 13.3656Z"
                                fill="#168C4B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.4731 13.516C25.4731 20.7934 20.3763 26.6937 14.0876 26.6937C7.7989 26.6937 2.7021 20.7934 2.7021 13.516C2.7021 6.23867 7.7989 0.338358 14.0876 0.338358C20.3763 0.338358 25.4731 6.23867 25.4731 13.516ZM25.6654 13.516C25.6654 6.11482 20.4812 0.114258 14.0876 0.114258C7.69399 0.114258 2.50977 6.11482 2.50977 13.516C2.50977 20.9172 7.69399 26.9178 14.0876 26.9178C20.4812 26.9178 25.6654 20.9172 25.6654 13.516Z"
                                fill="#168C4A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.7295 13.6634C25.7295 21.0234 20.5744 26.9915 14.2158 26.9915C7.85718 26.9915 2.7021 21.0263 2.7021 13.6634C2.7021 6.30059 7.85718 0.335409 14.2158 0.335409C20.5744 0.335409 25.7295 6.30059 25.7295 13.6634ZM25.9219 13.6634C25.9219 6.17969 20.6823 0.114258 14.2158 0.114258C7.74936 0.114258 2.50977 6.17969 2.50977 13.6634C2.50977 21.1472 7.74936 27.2126 14.2158 27.2126C20.6823 27.2126 25.9219 21.1472 25.9219 13.6634Z"
                                fill="#138B4A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.986 13.8109C25.986 21.2533 20.7726 27.2864 14.344 27.2864C7.91547 27.2864 2.7021 21.2533 2.7021 13.8109C2.7021 6.36841 7.91547 0.335409 14.344 0.335409C20.7726 0.335409 25.986 6.36841 25.986 13.8109ZM26.1783 13.8109C26.1783 6.24751 20.8804 0.114258 14.344 0.114258C7.80764 0.114258 2.50977 6.24751 2.50977 13.8109C2.50977 21.3742 7.80764 27.5075 14.344 27.5075C20.8804 27.5075 26.1783 21.3742 26.1783 13.8109Z"
                                fill="#138B4A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.2424 13.9583C26.2424 21.4834 20.9737 27.5812 14.4723 27.5812C7.97084 27.5812 2.7021 21.4834 2.7021 13.9583C2.7021 6.43328 7.97084 0.335409 14.4723 0.335409C20.9737 0.335409 26.2424 6.43328 26.2424 13.9583ZM26.4347 13.9583C26.4347 6.31239 21.0786 0.114258 14.4723 0.114258C7.86593 0.114258 2.50977 6.31239 2.50977 13.9583C2.50977 21.6042 7.86593 27.8024 14.4723 27.8024C21.0786 27.8024 26.4347 21.6042 26.4347 13.9583Z"
                                fill="#148A49" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.2381 14.1087C25.2381 21.7133 19.9111 27.879 13.3398 27.879C6.76841 27.879 1.44139 21.7133 1.44139 14.1087C1.44139 6.50405 6.76841 0.338358 13.3398 0.338358C19.9111 0.338358 25.2381 6.50405 25.2381 14.1087ZM25.4305 14.1087C25.4305 6.38021 20.0189 0.114258 13.3427 0.114258C6.66641 0.114258 1.25488 6.38021 1.25488 14.1087C1.25488 21.8372 6.66641 28.1031 13.3427 28.1031C20.0189 28.1031 25.4305 21.8372 25.4305 14.1087Z"
                                fill="#108A49" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.4946 14.2561C25.4946 21.9433 20.1122 28.1739 13.4709 28.1739C6.8296 28.1739 1.44721 21.9433 1.44721 14.2561C1.44721 6.56892 6.8296 0.338358 13.4709 0.338358C20.1122 0.338358 25.4946 6.56892 25.4946 14.2561ZM25.6869 14.2561C25.6869 6.44508 20.2171 0.114258 13.4709 0.114258C6.72469 0.114258 1.25488 6.44508 1.25488 14.2561C1.25488 22.0672 6.72469 28.398 13.4709 28.398C20.2171 28.398 25.6869 22.0672 25.6869 14.2561Z"
                                fill="#108A48" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M25.751 14.4036C25.751 22.1733 20.3104 28.4717 13.5991 28.4717C6.88789 28.4717 1.44721 22.1733 1.44721 14.4036C1.44721 6.63379 6.88789 0.335409 13.5991 0.335409C20.3104 0.335409 25.751 6.63379 25.751 14.4036ZM25.9434 14.4036C25.9434 6.51289 20.4153 0.114258 13.5991 0.114258C6.78298 0.114258 1.25488 6.51289 1.25488 14.4036C1.25488 22.2942 6.78298 28.6929 13.5991 28.6929C20.4153 28.6929 25.9434 22.2942 25.9434 14.4036Z"
                                fill="#108A48" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.0075 14.551C26.0075 22.4004 20.5085 28.7666 13.7273 28.7666C6.94617 28.7666 1.44722 22.4033 1.44722 14.551C1.44722 6.69866 6.94617 0.335409 13.7273 0.335409C20.5085 0.335409 26.0075 6.69866 26.0075 14.551ZM26.1998 14.551C26.1998 6.57777 20.6163 0.114258 13.7273 0.114258C6.83835 0.114258 1.25488 6.57777 1.25488 14.551C1.25488 22.5242 6.83835 28.9877 13.7273 28.9877C20.6163 28.9877 26.1998 22.5242 26.1998 14.551Z"
                                fill="#0C8947" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.2639 13.4289C26.2639 21.3609 20.7096 27.7919 13.8556 27.7919C7.00154 27.7919 1.44721 21.3609 1.44721 13.4289C1.44721 5.49695 7.00154 -0.934122 13.8556 -0.934122C20.7096 -0.934122 26.2639 5.49695 26.2639 13.4289ZM26.4562 13.4289C26.4562 5.37311 20.8145 -1.15527 13.8556 -1.15527C6.89663 -1.15527 1.25488 5.37605 1.25488 13.4289C1.25488 21.4817 6.89663 28.0131 13.8556 28.0131C20.8145 28.0131 26.4562 21.4817 26.4562 13.4289Z"
                                fill="#0C8847" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.5204 13.5793C26.5204 21.5938 20.9077 28.0897 13.9838 28.0897C7.05982 28.0897 1.44721 21.5938 1.44721 13.5793C1.44721 5.56477 7.05982 -0.931174 13.9838 -0.931174C20.9077 -0.931174 26.5204 5.56477 26.5204 13.5793ZM26.7127 13.5793C26.7127 5.44092 21.0127 -1.15527 13.9838 -1.15527C6.95491 -1.15527 1.25488 5.44092 1.25488 13.5793C1.25488 21.7176 6.95491 28.3138 13.9838 28.3138C21.0127 28.3138 26.7127 21.7176 26.7127 13.5793Z"
                                fill="#0D8847" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.7768 13.7267C26.7768 21.8238 21.1059 28.3846 14.112 28.3846C7.1181 28.3846 1.44722 21.8208 1.44722 13.7267C1.44722 5.63259 7.1181 -0.934122 14.112 -0.934122C21.1059 -0.934122 26.7768 5.62964 26.7768 13.7267ZM26.9691 13.7267C26.9691 5.50874 21.2137 -1.15527 14.112 -1.15527C7.01028 -1.15527 1.25488 5.50874 1.25488 13.7267C1.25488 21.9447 7.01028 28.6087 14.112 28.6087C21.2137 28.6087 26.9691 21.9447 26.9691 13.7267Z"
                                fill="#088746" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.0332 13.8742C27.0332 22.0508 21.307 28.6824 14.2402 28.6824C7.17347 28.6824 1.44722 22.0538 1.44722 13.8742C1.44722 5.69451 7.17347 -0.934122 14.2402 -0.934122C21.307 -0.934122 27.0332 5.69451 27.0332 13.8742ZM27.2256 13.8742C27.2256 5.57362 21.4119 -1.15527 14.2402 -1.15527C7.06856 -1.15527 1.25488 5.57362 1.25488 13.8742C1.25488 22.1747 7.06856 28.9036 14.2402 28.9036C21.4119 28.9036 27.2256 22.1747 27.2256 13.8742Z"
                                fill="#088746" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.2897 14.0216C27.2897 22.2808 21.5051 28.9773 14.3684 28.9773C7.23175 28.9773 1.44721 22.2808 1.44721 14.0216C1.44721 5.76233 7.23175 -0.934122 14.3684 -0.934122C21.5051 -0.934122 27.2897 5.76233 27.2897 14.0216ZM27.482 14.0216C27.482 5.63849 21.6101 -1.15527 14.3684 -1.15527C7.12684 -1.15527 1.25488 5.64144 1.25488 14.0216C1.25488 22.4017 7.12684 29.1984 14.3684 29.1984C21.6101 29.1984 27.482 22.4017 27.482 14.0216Z"
                                fill="#038745" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.5432 14.169C27.5432 22.5108 21.7004 29.2722 14.4938 29.2722C7.28712 29.2722 1.4443 22.5108 1.4443 14.169C1.4443 5.8272 7.28712 -0.934122 14.4938 -0.934122C21.7004 -0.934122 27.5432 5.8272 27.5432 14.169ZM27.7355 14.169C27.7355 5.70631 21.8082 -1.15527 14.4967 -1.15527C7.18513 -1.15527 1.25488 5.70631 1.25488 14.169C1.25488 22.6317 7.18222 29.4933 14.4967 29.4933C21.8111 29.4933 27.7355 22.6317 27.7355 14.169Z"
                                fill="#038645" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.5419 14.3194C26.5419 22.7438 20.6437 29.57 13.3642 29.57C6.0847 29.57 0.186504 22.7408 0.186504 14.3194C0.186504 5.89797 6.0847 -0.931174 13.3642 -0.931174C20.6437 -0.931174 26.5419 5.89797 26.5419 14.3194ZM26.7342 14.3194C26.7342 5.77413 20.7486 -1.15527 13.3671 -1.15527C5.98561 -1.15527 0 5.77118 0 14.3194C0 22.8676 5.98561 29.7941 13.3671 29.7941C20.7486 29.7941 26.7342 22.8676 26.7342 14.3194Z"
                                fill="#038644" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M26.7983 14.4668C26.7983 22.9708 20.8418 29.8678 13.4953 29.8678C6.14881 29.8678 0.192333 22.9738 0.192333 14.4668C0.192333 5.95989 6.14881 -0.934122 13.4953 -0.934122C20.8418 -0.934122 26.7983 5.95989 26.7983 14.4668ZM26.9906 14.4668C26.9906 5.839 20.9497 -1.15527 13.4953 -1.15527C6.04098 -1.15527 0 5.839 0 14.4668C0 23.0947 6.0439 30.089 13.4953 30.089C20.9467 30.089 26.9906 23.0947 26.9906 14.4668Z"
                                fill="#008544" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.0547 14.6143C27.0547 23.2008 21.04 30.1627 13.6235 30.1627C6.20709 30.1627 0.192331 23.2008 0.192331 14.6143C0.192331 6.02771 6.20709 -0.934122 13.6235 -0.934122C21.04 -0.934122 27.0547 6.02771 27.0547 14.6143ZM27.2471 14.6143C27.2471 5.90387 21.1478 -1.15527 13.6235 -1.15527C6.09926 -1.15527 0 5.90387 0 14.6143C0 23.3247 6.09926 30.3838 13.6235 30.3838C21.1478 30.3838 27.2471 23.3247 27.2471 14.6143Z"
                                fill="#008544" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.3112 13.4927C27.3112 22.1618 21.2411 29.1885 13.7518 29.1885C6.26245 29.1885 0.192333 22.1618 0.192333 13.4927C0.192333 4.82354 6.26245 -2.20317 13.7518 -2.20317C21.2411 -2.20317 27.3112 4.82354 27.3112 13.4927ZM27.5035 13.4927C27.5035 4.70264 21.346 -2.42432 13.7518 -2.42432C6.15755 -2.42432 0 4.70264 0 13.4927C0 22.2827 6.15755 29.4096 13.7518 29.4096C21.346 29.4096 27.5035 22.2827 27.5035 13.4927Z"
                                fill="#008543" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.5676 13.643C27.5676 22.3947 21.4392 29.4863 13.88 29.4863C6.32074 29.4863 0.192333 22.3918 0.192333 13.643C0.192333 4.89431 6.32074 -2.20022 13.88 -2.20022C21.4392 -2.20022 27.5676 4.89431 27.5676 13.643ZM27.76 13.643C27.76 4.77046 21.547 -2.42432 13.88 -2.42432C6.21292 -2.42432 0 4.76752 0 13.643C0 22.5186 6.21292 29.7104 13.88 29.7104C21.547 29.7104 27.76 22.5186 27.76 13.643Z"
                                fill="#008443" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.8241 13.7905C27.8241 22.6218 21.6374 29.7812 14.0082 29.7812C6.37902 29.7812 0.192331 22.6218 0.192331 13.7905C0.192331 4.95918 6.37902 -2.20022 14.0082 -2.20022C21.6374 -2.20022 27.8241 4.95918 27.8241 13.7905ZM28.0164 13.7905C28.0164 4.83533 21.7452 -2.42432 14.0082 -2.42432C6.2712 -2.42432 0 4.83533 0 13.7905C0 22.7456 6.2712 30.0053 14.0082 30.0053C21.7452 30.0053 28.0164 22.7456 28.0164 13.7905Z"
                                fill="#008443" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.0805 13.9379C28.0805 22.8518 21.8385 30.079 14.1364 30.079C6.43439 30.079 0.192333 22.8518 0.192333 13.9379C0.192333 5.02405 6.43439 -2.20317 14.1364 -2.20317C21.8385 -2.20317 28.0805 5.02405 28.0805 13.9379ZM28.2729 13.9379C28.2729 4.90021 21.9434 -2.42432 14.1364 -2.42432C6.32948 -2.42432 0 4.90021 0 13.9379C0 22.9756 6.32948 30.3001 14.1364 30.3001C21.9434 30.3001 28.2729 22.9756 28.2729 13.9379Z"
                                fill="#008342" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.337 14.0853C28.337 23.0818 22.0366 30.3739 14.2646 30.3739C6.49267 30.3739 0.192333 23.0818 0.192333 14.0853C0.192333 5.08892 6.49267 -2.20317 14.2646 -2.20317C22.0366 -2.20317 28.337 5.08892 28.337 14.0853ZM28.5293 14.0853C28.5293 4.96803 22.1444 -2.42432 14.2646 -2.42432C6.38485 -2.42432 0 4.96803 0 14.0853C0 23.2027 6.38485 30.595 14.2646 30.595C22.1444 30.595 28.5293 23.2027 28.5293 14.0853Z"
                                fill="#008342" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.5934 14.2328C28.5934 23.3088 22.2348 30.6687 14.3929 30.6687C6.55095 30.6687 0.192331 23.3088 0.192331 14.2328C0.192331 5.15674 6.55095 -2.20317 14.3929 -2.20317C22.2348 -2.20317 28.5934 5.15674 28.5934 14.2328ZM28.7857 14.2328C28.7857 5.0329 22.3426 -2.42432 14.3929 -2.42432C6.44313 -2.42432 0 5.0329 0 14.2328C0 23.4327 6.44313 30.8899 14.3929 30.8899C22.3426 30.8899 28.7857 23.4327 28.7857 14.2328Z"
                                fill="#008242" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.5901 14.3832C27.5901 23.5418 21.1761 30.9665 13.2614 30.9665C5.34659 30.9665 -1.0674 23.5418 -1.0674 14.3832C-1.0674 5.22456 5.34659 -2.20022 13.2614 -2.20022C21.1761 -2.20022 27.5901 5.22456 27.5901 14.3832ZM27.7824 14.3832C27.7824 5.10072 21.281 -2.42432 13.2643 -2.42432C5.24751 -2.42432 -1.25391 5.10072 -1.25391 14.3832C-1.25391 23.6656 5.24751 31.1906 13.2643 31.1906C21.281 31.1906 27.7824 23.6656 27.7824 14.3832Z"
                                fill="#008241" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M27.8466 14.5306C27.8466 23.7718 21.3743 31.2644 13.3896 31.2644C5.40487 31.2644 -1.0674 23.7718 -1.0674 14.5306C-1.0674 5.28943 5.40778 -2.20317 13.3925 -2.20317C21.3772 -2.20317 27.8495 5.28943 27.8495 14.5306H27.8466ZM28.0389 14.5306C28.0389 5.16559 21.4821 -2.42432 13.3925 -2.42432C5.30288 -2.42432 -1.25391 5.16559 -1.25391 14.5306C-1.25391 23.8956 5.30288 31.4855 13.3925 31.4855C21.4821 31.4855 28.0389 23.8956 28.0389 14.5306Z"
                                fill="#008241" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.103 13.4085C28.103 22.7322 21.5724 30.2897 13.5207 30.2897C5.46898 30.2897 -1.06157 22.7322 -1.06157 13.4085C-1.06157 4.08477 5.46607 -3.4727 13.5207 -3.4727C21.5754 -3.4727 28.103 4.08477 28.103 13.4085ZM28.2953 13.4085C28.2953 3.96388 21.6803 -3.69385 13.5207 -3.69385C5.36116 -3.69385 -1.25391 3.96388 -1.25391 13.4085C-1.25391 22.8531 5.36116 30.5109 13.5207 30.5109C21.6803 30.5109 28.2953 22.8531 28.2953 13.4085Z"
                                fill="#008342" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.3594 13.5559C28.3594 22.9593 21.7735 30.5846 13.6489 30.5846C5.52435 30.5846 -1.06158 22.9593 -1.06158 13.5559C-1.06158 4.15259 5.52435 -3.4727 13.6489 -3.4727C21.7735 -3.4727 28.3594 4.15259 28.3594 13.5559ZM28.5518 13.5559C28.5518 4.02875 21.8784 -3.69385 13.6489 -3.69385C5.41944 -3.69385 -1.25391 4.02875 -1.25391 13.5559C-1.25391 23.0831 5.41944 30.8057 13.6489 30.8057C21.8784 30.8057 28.5518 23.0831 28.5518 13.5559Z"
                                fill="#008442" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.6159 13.7063C28.6159 23.1922 21.9717 30.8824 13.7772 30.8824C5.58263 30.8824 -1.06157 23.1922 -1.06157 13.7063C-1.06157 4.22041 5.58263 -3.46975 13.7772 -3.46975C21.9717 -3.46975 28.6159 4.22041 28.6159 13.7063ZM28.8082 13.7063C28.8082 4.09657 22.0795 -3.69385 13.7772 -3.69385C5.47481 -3.69385 -1.25391 4.09657 -1.25391 13.7063C-1.25391 23.3161 5.47481 31.1065 13.7772 31.1065C22.0795 31.1065 28.8082 23.3161 28.8082 13.7063Z"
                                fill="#008543" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.8723 13.8538C28.8723 23.4222 22.1698 31.1773 13.9054 31.1773C5.64092 31.1773 -1.06157 23.4222 -1.06157 13.8538C-1.06157 4.28528 5.638 -3.4727 13.9054 -3.4727C22.1728 -3.4727 28.8723 4.28233 28.8723 13.8508V13.8538ZM29.0647 13.8538C29.0647 4.16439 22.2777 -3.69385 13.9054 -3.69385C5.53309 -3.69385 -1.25391 4.16144 -1.25391 13.8538C-1.25391 23.5461 5.53309 31.4014 13.9054 31.4014C22.2777 31.4014 29.0647 23.5461 29.0647 13.8538Z"
                                fill="#008745" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.1288 14.0012C29.1288 23.6522 22.3709 31.4751 14.0336 31.4751C5.69628 31.4751 -1.06158 23.6522 -1.06158 14.0012C-1.06158 4.35015 5.69628 -3.4727 14.0336 -3.4727C22.3709 -3.4727 29.1288 4.35015 29.1288 14.0012ZM29.3211 14.0012C29.3211 4.22926 22.4758 -3.69385 14.0336 -3.69385C5.59137 -3.69385 -1.25391 4.22926 -1.25391 14.0012C-1.25391 23.7731 5.59137 31.6962 14.0336 31.6962C22.4758 31.6962 29.3211 23.7731 29.3211 14.0012Z"
                                fill="#008846" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.3852 14.1486C29.3852 23.8793 22.5691 31.7699 14.1618 31.7699C5.75456 31.7699 -1.06157 23.8822 -1.06157 14.1486C-1.06157 4.41502 5.75456 -3.4727 14.1618 -3.4727C22.5691 -3.4727 29.3852 4.41502 29.3852 14.1486ZM29.5775 14.1486C29.5775 4.29413 22.6769 -3.69385 14.1618 -3.69385C5.64674 -3.69385 -1.25391 4.29413 -1.25391 14.1486C-1.25391 24.0031 5.64674 31.9911 14.1618 31.9911C22.6769 31.9911 29.5775 24.0031 29.5775 14.1486Z"
                                fill="#008946" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.6417 14.2961C29.6417 24.1093 22.7701 32.0648 14.29 32.0648C5.80993 32.0648 -1.06157 24.1093 -1.06157 14.2961C-1.06157 4.48284 5.81285 -3.4727 14.29 -3.4727C22.7672 -3.4727 29.6417 4.48284 29.6417 14.2961ZM29.834 14.2961C29.834 4.359 22.875 -3.69385 14.29 -3.69385C5.70502 -3.69385 -1.25391 4.36195 -1.25391 14.2961C-1.25391 24.2302 5.70502 32.286 14.29 32.286C22.875 32.286 29.834 24.2302 29.834 14.2961Z"
                                fill="#008B47" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.8981 14.4464C29.8981 24.3422 22.9683 32.3626 14.4183 32.3626C5.86822 32.3626 -1.06158 24.3422 -1.06158 14.4464C-1.06158 4.55066 5.86822 -3.46975 14.4183 -3.46975C22.9683 -3.46975 29.8981 4.55066 29.8981 14.4464ZM30.0904 14.4464C30.0904 4.42977 23.0732 -3.69385 14.4183 -3.69385C5.76331 -3.69385 -1.25391 4.42682 -1.25391 14.4464C-1.25391 24.4661 5.76331 32.5867 14.4183 32.5867C23.0732 32.5867 30.0904 24.4661 30.0904 14.4464Z"
                                fill="#008C48" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M28.8938 14.5939C28.8938 24.5722 21.9058 32.6575 13.2858 32.6575C4.66579 32.6575 -2.32229 24.5693 -2.32229 14.5939C-2.32229 4.61848 4.66579 -3.4727 13.2858 -3.4727C21.9058 -3.4727 28.8938 4.61553 28.8938 14.5909V14.5939ZM29.0862 14.5939C29.0862 4.49464 22.0136 -3.69385 13.2887 -3.69385C4.5638 -3.69385 -2.50879 4.49464 -2.50879 14.5939C-2.50879 24.6931 4.5638 32.8816 13.2887 32.8816C22.0136 32.8816 29.0862 24.6931 29.0862 14.5939Z"
                                fill="#008D49" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.1503 13.4718C29.1503 23.5297 22.1068 31.6858 13.4169 31.6858C4.72698 31.6858 -2.31937 23.5327 -2.31937 13.4718C-2.31937 3.41088 4.72698 -4.74223 13.4169 -4.74223C22.1068 -4.74223 29.1503 3.41088 29.1503 13.4718ZM29.3426 13.4718C29.3426 3.28998 22.2117 -4.96338 13.4169 -4.96338C4.62208 -4.96338 -2.50879 3.28998 -2.50879 13.4718C-2.50879 23.6536 4.62208 31.9069 13.4169 31.9069C22.2117 31.9069 29.3426 23.6536 29.3426 13.4718Z"
                                fill="#008E4A" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.4067 13.6192C29.4067 23.7597 22.305 31.9806 13.5451 31.9806C4.78527 31.9806 -2.31646 23.7597 -2.31646 13.6192C-2.31646 3.47869 4.78527 -4.74223 13.5451 -4.74223C22.305 -4.74223 29.4067 3.47869 29.4067 13.6192ZM29.5991 13.6192C29.5991 3.35485 22.4099 -4.96338 13.5451 -4.96338C4.68036 -4.96338 -2.50879 3.3578 -2.50879 13.6192C-2.50879 23.8806 4.68036 32.2018 13.5451 32.2018C22.4099 32.2018 29.5991 23.8806 29.5991 13.6192Z"
                                fill="#00904B" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.6632 13.7666C29.6632 23.9897 22.5032 32.2755 13.6734 32.2755C4.84355 32.2755 -2.31646 23.9897 -2.31646 13.7666C-2.31646 3.54357 4.84064 -4.74223 13.6734 -4.74223C22.5061 -4.74223 29.6632 3.54357 29.6632 13.7666ZM29.8555 13.7666C29.8555 3.42267 22.611 -4.96338 13.6734 -4.96338C4.73573 -4.96338 -2.50879 3.42267 -2.50879 13.7666C-2.50879 24.1106 4.73573 32.4967 13.6734 32.4967C22.611 32.4967 29.8555 24.1106 29.8555 13.7666Z"
                                fill="#00914C" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M29.9196 13.917C29.9196 24.2197 22.7042 32.5733 13.8016 32.5733C4.89892 32.5733 -2.31646 24.2197 -2.31646 13.917C-2.31646 3.61433 4.89892 -4.74223 13.8016 -4.74223C22.7042 -4.74223 29.9196 3.61138 29.9196 13.9141V13.917ZM30.1119 13.917C30.1119 3.49049 22.8091 -4.96338 13.8016 -4.96338C4.79401 -4.96338 -2.50879 3.49049 -2.50879 13.917C-2.50879 24.3436 4.79401 32.7974 13.8016 32.7974C22.8091 32.7974 30.1119 24.3436 30.1119 13.917Z"
                                fill="#01924D" />
                              <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M30.1119 13.9907C30.1119 24.376 22.8383 32.7974 13.8657 32.7974C4.89309 32.7974 -2.38057 24.3789 -2.38057 13.9907C-2.38057 3.60254 4.89309 -4.81594 13.8657 -4.81594C22.8383 -4.81594 30.1119 3.60254 30.1119 13.9907ZM30.2402 13.9907C30.2402 3.52292 22.9082 -4.96338 13.8657 -4.96338C4.82315 -4.96338 -2.50879 3.52292 -2.50879 13.9907C-2.50879 24.4586 4.82315 32.9449 13.8657 32.9449C22.9082 32.9449 30.2402 24.4586 30.2402 13.9907Z"
                                fill="#199554" />
                            </g>
                            <mask id="mask3_513_57539" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="8"
                              y="19" width="12" height="11">
                              <path
                                d="M14.8232 19.1553C18.766 23.4633 20.6923 28.2402 19.2469 29.5435C17.7811 30.8704 13.2408 28.6854 9.16106 24.3214C9.03284 24.1857 8.90753 24.0471 8.78223 23.9115C10.7901 22.2573 12.8095 20.7829 14.8203 19.1553H14.8232Z"
                                fill="white" />
                            </mask>
                            <g mask="url(#mask3_513_57539)">
                              <mask id="mask4_513_57539" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="8"
                                y="19" width="13" height="12">
                                <path d="M20.6893 19.1553H8.78223V30.8704H20.6893V19.1553Z" fill="white" />
                              </mask>
                              <g mask="url(#mask4_513_57539)">
                                <rect width="12.8688" height="12.3137" transform="matrix(1 0 0 -1 8.78223 31.8491)"
                                  fill="url(#pattern1_513_57539)" />
                              </g>
                            </g>
                            <path
                              d="M62.04 19.6752C62.075 19.0854 62.0458 18.4927 62.0662 17.903C64.5636 17.9118 67.0611 17.9118 69.5614 17.903C69.573 18.4957 69.5614 19.0913 69.573 19.6869C68.7017 19.6781 67.8304 19.7046 66.9591 19.6722C66.9328 22.2788 66.9561 24.8914 66.9474 27.5009C66.2014 27.4862 65.4583 27.4921 64.7123 27.4951C64.7035 24.8914 64.7123 22.2906 64.7093 19.6869C63.8176 19.681 62.9288 19.6987 62.04 19.6781V19.6752ZM53.1694 17.9118C53.8805 17.903 54.5944 17.9118 55.3084 17.9089C55.3084 19.7194 55.3055 21.5328 55.3084 23.3463C55.3084 23.5792 55.288 23.8121 55.2501 24.0421C55.3375 23.7974 55.4512 23.5615 55.5881 23.3404C56.6547 21.5328 57.6892 19.7076 58.7616 17.903C59.4202 17.9177 60.0846 17.9059 60.7461 17.9089C60.7461 21.1053 60.7461 24.3016 60.7461 27.498C60.0176 27.4862 59.2862 27.498 58.5576 27.4921C58.6159 25.4899 58.5197 23.4848 58.6072 21.4856C57.4794 23.5025 56.305 25.4899 55.1627 27.498C54.4924 27.4951 53.8222 27.4833 53.1519 27.5068C53.1781 24.3105 53.1607 21.1141 53.1607 17.9148L53.1694 17.9118ZM44.87 17.9089H51.2781C51.2898 21.1023 51.2548 24.2957 51.2956 27.4892C50.5409 27.5009 49.7832 27.4774 49.0255 27.5039C49.0634 24.8943 49.008 22.2818 49.0517 19.6693C48.2824 19.6958 47.5131 19.6928 46.7467 19.6693C46.735 20.8517 46.6622 22.0311 46.6214 23.2136C46.5456 24.2545 46.5369 25.3307 46.1493 26.3156C45.9744 26.7372 45.7296 27.1707 45.3129 27.3889C44.6718 27.7162 43.9083 27.7192 43.2322 27.5098C43.2031 26.8581 43.2264 26.2094 43.2118 25.5578C43.477 25.6787 43.7655 25.6846 44.0511 25.6934C44.5349 25.313 44.5407 24.6525 44.6048 24.0893C44.7155 22.0311 44.7826 19.97 44.8641 17.9089H44.87ZM34.7113 17.9089C37.1679 17.9089 39.6275 17.9 42.087 17.9089C42.087 21.1053 42.0695 24.3016 42.0957 27.498C41.341 27.4715 40.5833 27.4892 39.8285 27.4862C39.8664 24.8825 39.8285 22.2759 39.8489 19.6693C38.8814 19.6899 37.914 19.6899 36.9494 19.6693C36.9669 22.2759 36.9348 24.8825 36.9669 27.4921C36.2121 27.4862 35.4544 27.4774 34.7026 27.498C34.7317 24.3016 34.7084 21.1023 34.7142 17.9059L34.7113 17.9089ZM28.7432 14.2938C30.2411 13.8839 31.9138 14.0432 33.2426 14.8894C33.231 15.5205 33.2164 16.1515 33.2543 16.7795C32.3859 16.1869 31.3484 15.7829 30.2877 15.8655C29.5533 15.889 28.8044 16.2046 28.3644 16.8149C27.6999 17.6199 27.5105 18.6932 27.4202 19.7076C27.3415 20.9726 27.4027 22.2582 27.6883 23.4966C27.9185 24.4786 28.5538 25.4575 29.5592 25.7494C30.8355 26.0974 32.2314 25.6934 33.2514 24.8707C33.2222 25.5076 33.2368 26.1475 33.2368 26.7844C31.6165 27.7929 29.4397 27.9993 27.767 27.0056C26.4848 26.289 25.6979 24.915 25.3716 23.5084C24.9548 21.4827 24.9665 19.3243 25.6484 17.3604C26.1467 15.9274 27.292 14.7361 28.7432 14.2938Z"
                              fill="black" />
                          </g>
                          <defs>
                            <pattern id="pattern0_513_57539" patternContentUnits="objectBoundingBox" width="1"
                              height="1">
                              <use xlink:href="#image0_513_57539" transform="scale(0.0103093 0.0107527)" />
                            </pattern>
                            <pattern id="pattern1_513_57539" patternContentUnits="objectBoundingBox" width="1"
                              height="1">
                              <use xlink:href="#image1_513_57539" transform="scale(0.0107527 0.0113636)" />
                            </pattern>
                            <clipPath id="clip0_513_57539">
                              <rect width="69" height="24" fill="white" transform="translate(0 9)" />
                            </clipPath>
                            <image id="image0_513_57539" width="97" height="93"
                              xlink:href="data:image/png;base64,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" />
                            <image id="image1_513_57539" width="93" height="88"
                              xlink:href="data:image/png;base64,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" />
                          </defs>
                        </svg>

                      </label>
                    </div>
                    <div class="form-item"
                      :class="{ '_checked': (form.pay[5].toLowerCase() === form.selectedPay.toLowerCase()) }">
                      <input id="radio-p-6" name="btns1[]" type="radio"
                        :checked="(form.pay[5].toLowerCase() === form.selectedPay.toLowerCase())"
                        v-model.trim="form.selectedPay" value="Кредит" class="form-radiobtn">
                      <label for="radio-p-6" class="form-check-label">
                        <span>Кредит</span>
                        <img src="/storage/pochta-bank.png" alt="">
                        <img src="/storage/otp-bank.svg" alt="">
                        <img src="/storage/rusfinans-bank.png" alt="">
                        <img src="/storage/renesans-bank.png" alt="">
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="make-order-form__last-row" v-if="isDesktop">
                <button type="submit" class="make-order-form__btn btn form-btn default-anim bg-yellow" v-anim-hover>
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
                    <label for="order_privacy_policy" class="form-check-label make-order-form__politics form-politics">Я
                      даю
                      согласие на
                      обработку персональных
                      данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
                        конфиденциальности</router-link>,
                      и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
                    <div class="helper-block"
                      v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
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
                                    <img src="/assets/empty-img.png" alt="empty-img">
                                  </picture>
                                </template>
                              </div>
                            </div>
                            <div class="your-order-item__block">
                              <div class="your-order-item__name">{{ product.title }}</div>
                              <div class="your-order-item-price card-product-price">
                                <div class="your-order-item-price__row card-product-price__row">
                                  <div class="your-order-item-price__value card-product-price__value new">
                                    {{
                                      numberWithSpaces(product.price) }} ₽<template v-if="product.unit">/{{ product.unit
                                      }}</template></div>
                                  <div class="your-order-item-price__value card-product-price__value old"
                                    v-if="product.price.old">{{
                                      numberWithSpaces(product.price.old) }}
                                    ₽<template v-if="item.unit">/{{ product.unit
                                      }}</template></div>
                                  <div class="your-order-item-price__count">{{
                                    product.quantity }} шт.</div>
                                </div>
                                <div class="your-order-item-price__info card-product-price__info hidden">
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
                    <div class="your-order-info-total__value">{{ numberWithSpaces(checkedTotalPrice)
                      }} ₽</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="make-order-form__last-row" v-if="!isDesktop">
            <button type="submit" class="make-order-form__btn btn form-btn default-anim bg-yellow" v-anim-hover>
              <span>Оформить заказ</span>
              <div class="form-btn__dots">
                <div class="dot dot-1"></div>
                <div class="dot dot-2"></div>
                <div class="dot dot-3"></div>
              </div>
            </button>
            <div class="checkbox-house form-checkboxes">
              <div class="form-item" :class="{ '_checked': form.privacy_policy }">
                <input type="checkbox" id="order_privacy_policy" v-model="form.privacy_policy" class="form-checkbox">
                <label for="order_privacy_policy" class="form-check-label make-order-form__politics form-politics">Я даю
                  согласие на
                  обработку персональных
                  данных, в соответствии с <router-link to="/politics/" target="_blank">Политикой
                    конфиденциальности</router-link>,
                  и соглашаюсь с <router-link to="/oferta/" target="_blank">Офертой</router-link>.</label>
                <div class="helper-block"
                  v-if="v$.form.privacy_policy.sameAs.$invalid && v$.form.privacy_policy.$error">
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
              <div class="popup-map-address__btn btn default-anim bg-yellow select-address__js" v-anim-hover>
                Выбрать</div>
              <div class="popup-map-address__close close-popup-address__js default-anim" v-anim-hover>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" stroke="#1D1D1D" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
svg.playt-icon {
  width: 8.6rem !important;
  height: 1.4rem !important;
}

svg.halva-icon {
  width: 3.9rem !important;
  height: .7rem !important;
}
</style>
