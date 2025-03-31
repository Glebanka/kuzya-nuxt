import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>,
) {
  const result = useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$apiFetch as typeof $fetch
  })

  if (result.error.value) {
    console.error(`Ошибка при загрузке данных с ${typeof url === 'function' ? url() : url}:`, result.error.value);
  }

  return result;
}