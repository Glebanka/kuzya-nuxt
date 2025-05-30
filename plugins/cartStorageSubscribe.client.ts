export default defineNuxtPlugin((nuxtApp) => {
    const cartStore = useCartStore()

    cartStore.$subscribe(() => {
        cartStore.saveCartToStorage()
    })
})
