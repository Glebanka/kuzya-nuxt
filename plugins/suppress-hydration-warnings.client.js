export default defineNuxtPlugin((nuxtApp) => {
    const originalWarn = console.warn

    console.warn = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Hydration text mismatch')) {
            return // Игнорируем предупреждение о гидратации
        }
        originalWarn(...args) // Показываем другие предупреждения
    }
})