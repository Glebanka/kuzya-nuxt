// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      link: [{
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css'
      }, {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
      }],
    }
  },
  css: [
    '~/assets/css/vanilla-calendar.min.css',
    '~/assets/css/nouislider.min.css',
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
      apiBaseURL: 'http://kuzya.loc/api',
      // apiBaseURL: 'https://xn--80aaaldvhd1agchd1a2o.xn--p1ai/api',
      imgBaseURL: 'http://kuzya.loc',
    }
  },
  modules: [
    '@pinia/nuxt',
  ],
})
