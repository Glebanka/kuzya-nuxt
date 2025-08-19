import { extendPages } from "./utils/customPages"
import { fetchSitemap } from "./utils/sitemap"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // debug: true,

  app: {
    head: {
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
      apiBaseURL: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      imgBaseURL: process.env.NUXT_PUBLIC_IMG_BASE_URL || '',
    }
  },

  modules: ['@pinia/nuxt', '@nuxtjs/sitemap', '@nuxtjs/robots', '@nuxt/image'],

  hooks: {
    'pages:extend'(pages) {
      extendPages(pages);
    }
  },

  // делаем сайтмап только если мы в проде
  sitemap: {
    urls: process.env.NODE_ENV == 'development' ? fetchSitemap : async () => []
  },

  devtools: {
    enabled: true,
  },
})