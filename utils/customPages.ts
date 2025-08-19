import type { NuxtPage } from "nuxt/schema"

// Создаем конфиг с кастомными урлами под страницы
export function extendPages(pages: NuxtPage[]) {
  const customPages = [
    // простые страницы
    { name: 'about', path: '/o-kompanii', file: '~/pages/(static)/about.vue' },
    { name: 'giftCard', path: '/podarochnye-karty', file: '~/pages/(static)/giftCard.vue' },
    { name: 'customerCard', path: '/karta-lybov-pokupatelya', file: '~/pages/(static)/customerCard.vue' },
    { name: 'suppliersInfo', path: '/postavshikam', file: '~/pages/(static)/suppliersInfo.vue' },
    { name: 'paymentSecurity', path: '/payment-security', file: '~/pages/(static)/paymentSecurity.vue' },
    { name: 'publicOffer', path: '/oferta', file: '~/pages/(static)/publicOffer.vue' },
    { name: 'discount', path: '/discounts/:discountName/', file: '~/pages/discount.vue' },
    { name: 'discounts', path: '/discounts/', file: '~/pages/discounts.vue' },
    { name: 'vacancies', path: '/vakansii/', file: '~/pages/vacancies.vue' },

    // Страницы связанные с ЛК
    { name: 'myOrder', path: '/my-order/:orderId', file: '~/pages/(auth)/my-order.vue' },
    
    { name: 'passReset', path: '/password/reset/:token/:email', file: '~/pages/(auth)/pass-change.vue'},

    // Страницы каталога
    { name: 'product', path: '/products/:product', file: '~/pages/product.vue' },
    { name: 'category', path: '/catalog/:category(.*)*', file: '~/pages/category.vue' },
    { name: 'catalog', path: '/catalog/', file: '~/pages/catalog.vue' },

    // Страницы спасибо
    { name: 'thanksVacancy', path: '/thanks-vacancy/', file: '~/pages/(thanks)/thanksVacancy.vue' },
    { name: 'thanks', path: '/thanks/', file: '~/pages/(thanks)/thanks.vue' },
    { name: 'thanksAuth', path: '/thanks-auth/', file: '~/pages/(thanks)/thanksAuth.vue' },
    { name: 'thanksPassword', path: '/thanks-password/', file: '~/pages/(thanks)/thanksCreatePassword.vue' },
    { name: 'thanksPasswordSend', path: '/thanks-password-send/', file: '~/pages/(thanks)/thanksSendPassword.vue' }
  ]

  customPages.forEach(page => pages.push(page))
}
