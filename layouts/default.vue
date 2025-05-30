<script>
import { mapState } from 'pinia'
import "~/utils/vanilla-calendar.min";
import "~/utils/nouislider.min.js";
export default {
  data() {
    return {
      configs: [],
    }
  },
  provide() {
    return {
      openPopUpMenu: this.openPopUpMenu,
      openAuthPopUp: this.openAuthPopUp,
      closeAuthPopUp: this.closeAuthPopUp,
      isActivePopups: false,
    }
  },
  methods: {
    openAuthPopUp() {
      this.$refs.authPopUp.open()
    },
    closeAuthPopUp() {
      this.$refs.authPopUp.close()
    },
    openPopUpMenu(menuType) {
      if (menuType == 'default') {
        this.$refs.popUpMenu.openMenu('default');
      } else if (menuType == 'person') {
        if (this.isAuthenticated) {
          this.$refs.popUpMenu.openMenu('person');
        }
      }
    },
    clickScrollTo(id, _offset = 120) {
      let minMarginTop = _offset;
      if (id) {
        let el = document.querySelector(`#${id}`);
        if (el) {
          let offset = getCoords(el).top;
          gsap.to(window, { duration: 1, scrollTo: (offset - minMarginTop) });
        }
      }
    },
    setSearchProducts(products) {
      this.searchProducts = products;
    },
    nativeJs() {
      const { $body, isDesktop } = useVars();
      const $selectShopPopup = selectElement('.select-shop');
      const $header = selectElement('.header');
      const $popupShare = selectElement('.popup-share');
      const $popupFilters = selectElement('.popup-filters');

      let allPages = () => {
        const $popups = selectElements('.popup');

        let selectbox = new SelectBox('.select-box__js');

        function popups() {
          const $closePopups = selectElements('.close-popup__js');
          if ($closePopups.length) {
            $closePopups.forEach(($close, indx) => {
              $close.addEventListener('click', () => {
                $close.closest('.popup').classList.remove('_active');
                $body.value.classList.remove('_overflow');
              });
            });
          }

          const $shareBtns = selectElements('.open-share-popup__js');
          if ($shareBtns.length) {
            $shareBtns.forEach(($shareBtn, indx) => {
              $shareBtn.addEventListener('click', () => {
                $body.value.classList.add('_overflow');
                $popupShare.classList.add('_active');
                $popupShare.querySelector('.popup-share__title').textContent = $shareBtn.dataset.title;
                $popupShare.querySelector('.copy-link__js').setAttribute('data-link', $shareBtn.dataset.link)
              });
            })
          }


        }

        function copyLink() {
          const $items = selectElements('.copy-link__js');
          if ($items.length) {
            $items.forEach(($item, indx) => {
              $item.addEventListener('click', function (e) {
                if (!this.classList.contains('no_click')) {
                  var tmpInput = document.createElement('input');
                  document.body.appendChild(tmpInput);
                  tmpInput.value = this.dataset.link;
                  tmpInput.select();
                  document.execCommand('copy');
                  document.body.removeChild(tmpInput);
                }

                this.classList.add('no_click');

                e.preventDefault();
              });
            });
          }
        }

        const $selectShopPopup = selectElement('.select-shop');

        function selectCity() {
          const $changeCity = selectElements('.change-shop__js');
          if ($changeCity.length) {
            $changeCity.forEach(($item, indx) => {
              $item.addEventListener('click', () => {
                $selectShopPopup.classList.add('_active');
                $body.value.classList.add('_overflow');
              });
            })

          }

          // const $selectShop = selectElement('.select-shop__js');
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

        selectCity();
        copyLink();
        popups();
        copyLink();


        const stickyElements = selectElements('.sticky__js');
        if (stickyElements.length && isDesktop.value) {
          stickyElements.forEach(($item, indx) => {

            stickyScroll($item, $item.querySelector('.sticky-body'));
          });
        }

        function stickyScroll(sidebar, sidebarContent) {
          let scrollPos = 0;
          let scrollEl = 0;
          document.addEventListener('scroll', () => {
            let scrollTop = window.scrollY;
            let viewportHeigt = window.innerHeight;
            let contentHeight = sidebarContent.getBoundingClientRect().height;
            let top = parseFloat(getComputedStyle(sidebarContent).top);


            if (scrollPos > getCoords(sidebar).top) {
              if (scrollTop >= contentHeight - viewportHeigt) {
                sidebarContent.style.position = 'sticky';
                if (scrollTop > scrollPos++) {
                  if (scrollEl < contentHeight + top + 20 - viewportHeigt) {
                    sidebarContent.style.transform = `translateY(-${scrollEl}px)`;
                    scrollEl += 10;
                    sidebarContent.style.marginBottom = -(contentHeight + top + 20 - viewportHeigt) + 'px';

                  }
                } else if (scrollTop < scrollPos--) {
                  if (scrollEl > 1) {
                    sidebarContent.style.transform = `translateY(-${scrollEl}px)`;
                    scrollEl -= 10;
                    sidebarContent.style.marginBottom = -(contentHeight + top + 20 - viewportHeigt) + 'px';
                  }
                }
              } else {
                sidebarContent.style.transform = '';
                sidebarContent.style.position = '';
                sidebarContent.style.marginBottom = '';
              }

            }


            scrollPos = scrollTop;
          });
        }

        document.addEventListener('mouseup', (e) => {
          if ($popupFilters && $popupFilters.classList.contains('_active')) {
            if ($popupFilters.querySelector('.popup-filters__container').contains(e.target) === false) {
              this.isActivePopups = true;
              $popupFilters.classList.remove('_active');
            } else {
              this.isActivePopups = false;
            }
          }

          const $menuBody = selectElement('.menu-body');
          if ($menuBody && $menuBody.classList.contains('_active')) {

            if ($menuBody.querySelector('.menu-body__container').contains(e.target) === false) {
              this.$refs.popUpMenu.closeMenu();
              this.isActivePopups = true;
            } else {
              this.isActivePopups = false;
            }
          }

          // если на странице активен confirm-popup то мы не закрываем popup-basket
          if (!document.querySelector('.confirm-popup')) {
            const $popupBasket = selectElement('.popup-basket');
            if ($popupBasket && $popupBasket.classList.contains('_active')) {
              if ($popupBasket.querySelector('.popup__container').contains(e.target) === false) {
                this.isActivePopups = true;
                $popupBasket.classList.remove('_active');
              } else {
                this.isActivePopups = false;
              }
            }
          }

          const $characteristicsPopup = selectElement('.popup-all-characteristics');
          if ($characteristicsPopup && $characteristicsPopup.classList.contains('_active')) {
            if ($characteristicsPopup.querySelector('.popup-all-characteristics__container').contains(e.target) === false) {
              this.isActivePopups = true;
              $characteristicsPopup.classList.remove('_active');
            } else {
              this.isActivePopups = false;
            }
          }

          if (this.isActivePopups) {
            $body.value.classList.remove('_overflow');
          }

          let calendar = selectElement('.calendar');
          // if (calendar.contains(e.target))
          if (calendar && calendar.contains(e.target) === false) {
            calendar.querySelector('.vanilla-calendar').classList.remove('_active');
          }

          let selects = selectElements('.select-box__js');
          if (selects.length) {
            selects.forEach(($select, indx) => {
              // if (select.contains(e.target))
              if ($select.contains(e.target) === false) {
                $select.classList.remove('_active');
              }
            })
          }
          // closePopupsOrTooltips(document.querySelectorAll('.tooltip__body'), '.tooltip', '.tooltip__head');

        });

        let ESC = 27;
        document.addEventListener('keydown', function (e) {
          if (e.keyCode === ESC) {
            if (selectElement('.select-shop-region-item._active')) {
              selectElement('.select-shop-region-item._active').classList.remove('_active');
            }
            if ($popups.length) {
              setClass($popups, { remove: '_active' });
            }
            selectbox.close();
            if (selectElements('.vanilla-calendar').length) {
              setClass(selectElements('.vanilla-calendar'), { remove: '_active' });
            }
            if ($selectShopPopup) {
              $selectShopPopup.classList.remove('_active');
            }
            if ($popupFilters) {
              $popupFilters.classList.remove('_active');
            }
            $body.value.classList.remove('_overflow');
          }
        });
      }
      allPages();

    },
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'isAuthenticated']),
  },
  watch: {
    $route: {
      handler: function (newRouteValue) {
        this.$nextTick(() => {
          this.nativeJs();
        })
      },
      deep: true,
    }
  },
  mounted() {
    this.nativeJs();    
  },
}
</script>

<script setup>
const configs = ref({});

const { data } = await useAPI('/pages', { params: { url_page: '/home' } })
console.log('data: ', data);

const { data: fetchData } = await useFetch('https://xn--80aaaldvhd1agchd1a2o.xn--p1ai/api/pages', { params: { url_page: '/home' } })
console.log('data: ', fetchData);

configs.value = data.value?.metaTag
provide('configs', configs)

onMounted(() => {
  const { getUserData, getToken } = useAuthStore();
  getToken()
  getUserData()
  
  
  const { getCartFromStorage } = useCartStore();
  getCartFromStorage()
  

  const confirmPopUp = useTemplateRef('confirmPopUp')
  nextTick(()=>{
    useState('confirmPopUp').value = confirmPopUp.value?.show
  })
  


  document.addEventListener('keydown', function (e) {
    if (e.key == 'Escape') {
      selectElement('.select-shop').classList.remove('_active');
      const { $body } = useVars()
      $body.value.classList.remove('_overflow');
    }
  })
})
</script>

<template>
  <NuxtLoadingIndicator color="#F7DE00" />
  <Header />
  <slot />
  <ClientOnly>
    <PopUpMenu ref="popUpMenu"></PopUpMenu>
    <AuthPopUp ref="authPopUp"></AuthPopUp>
    <BnplModal></BnplModal>
    <ConfirmPopUp ref="confirmPopUp" />
  </ClientOnly>
  <Footer />
</template>

<style scoped></style>