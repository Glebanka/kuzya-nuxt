// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // debug: true,

  app: {
    head: {
      link: [{
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css'
      }, {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
      }],
      script: [{
        src: 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=767f9059-7d48-4017-bf97-e4424f659bb7&amp;coordorder=longlat&amp;&suggest_apikey=c826b850-05b5-4f3e-983e-c1620586e47a',
        type: "text/javascript",
      },
      {
        src: '/js/vanilla-calendar.min.js',
        type: "text/javascript",
      },
      {
        src: '/js/nouislider.min.js',
        type: "text/javascript",
      }],
    }
  },

  css: [
    '~/assets/scss/app.scss'
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    public: {
      // apiBaseURL: 'http://kuzya.loc/api',
      apiBaseURL: 'https://xn--80aaaldvhd1agchd1a2o.xn--p1ai/api',
      // imgBaseURL: 'http://kuzya.loc',
      imgBaseURL: 'https://xn--80aaaldvhd1agchd1a2o.xn--p1ai/',
    }
  },

  modules: [
    '@pinia/nuxt',
  ],

  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'about',
        path: '/o-kompanii',
        file: '~/pages/(static)/about.vue'
      })

      pages.push({
        name: 'giftCard',
        path: '/podarochnye-karty',
        file: '~/pages/(static)/giftCard.vue'
      })

      pages.push({
        name: 'customerCard',
        path: '/karta-lybov-pokupatelya',
        file: '~/pages/(static)/customerCard.vue'
      })

      pages.push({
        name: 'suppliersInfo',
        path: '/postavshikam',
        file: '~/pages/(static)/suppliersInfo.vue'
      })

      pages.push({
        name: 'paymentSecurity',
        path: '/payment-security',
        file: '~/pages/(static)/paymentSecurity.vue'
      })

      pages.push({
        name: 'publicOffer',
        path: '/oferta',
        file: '~/pages/(static)/publicOffer.vue'
      })

      pages.push({
        name: 'product',
        path: '/products/:product',
        file: '~/pages/product.vue'
      })

      pages.push({
        name: 'category',
        path: '/catalog/:category(.*)*',
        file: '~/pages/category.vue'
      })

      pages.push({
        name: 'catalog',
        path: '/catalog/',
        file: '~/pages/catalog.vue'
      })
      
      pages.push({
        name: 'discountsItem',
        path: '/discounts/:discountName/',
        file: '~/pages/discountsItem.vue'
      })

      pages.push({
        name: 'discounts',
        path: '/discounts/',
        file: '~/pages/discounts.vue'
      })

      pages.push({
        name: 'myOrder',
        path: '/my-order/:orderId',
        file: '~/pages/(auth)/my-order.vue'
      })
    }
  },

})
