import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err, vm, info) => {
    // vm — это Vue ComponentInstance или undefined
    const name = (vm as any)?.$options?.name || (vm as any)?.type?.name || 'Unknown'
    console.error(`❌ [Vue Error] Component: ${name}\nInfo: ${info}`, err)
    console.error(vm, err, info)
  }

  nuxtApp.hook('vue:error', (err) => {
    console.error(err)
  })
})
