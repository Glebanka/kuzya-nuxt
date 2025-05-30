
import type { UseFetchOptions } from 'nuxt/app'

/**
 * Функция `useAPI` используется для выполнения запросов к API с использованием указанного URL.
 * Она позволяет передавать дополнительные параметры запроса и обрабатывать ошибки.
 *
 * @template T Тип данных, ожидаемых в ответе от API.
 * @param {string | (() => string)} url - URL для выполнения запроса. Может быть строкой
 * или функцией, возвращающей строку.
 * @param {UseFetchOptions<T>} [options] - Дополнительные параметры для настройки запроса.
 * @returns {ReturnType<typeof useFetch>} Результат выполнения запроса, содержащий данные
 * или информацию об ошибке.
 *
 * @example
 * ```typescript
 * const { data, error } = await useAPI('/example', { method: 'GET' });
 * products.value = data.value
 * ```
 */
export function useAPI<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
): ReturnType<typeof useFetch> {
  const result = useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$apiFetch as typeof $fetch,
  })

  if (result.error.value) {
    console.error(`Ошибка при загрузке данных с ${typeof url === 'function' ? url() : url}:`, result.error.value);
  }

  return result;
}