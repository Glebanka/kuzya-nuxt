import { VueReCaptcha } from 'vue-recaptcha-v3'

export default defineNuxtPlugin((nuxtApp) => {
  const siteKey = '6LdydDgrAAAAAKwbEmxDnPnmCj5R6RePsrAkymSL'

  nuxtApp.vueApp.use(VueReCaptcha, {
    siteKey,
    loaderOptions: {
      useRecaptchaNet: true
    }
  })
})
