
/**
 * Функция `useSEO` используется для получения данных о SEO-странице с сервера.
 * Она выполняет запрос к API с указанным URL страницы и возвращает результат запроса.
 * В случае ошибки выводит сообщение об ошибке в консоль.
 *
 * @param {string | (() => string)} url_page - URL страницы, для которой нужно получить данные.
 * Может быть строкой или функцией, возвращающей строку.
 * @returns {ReturnType<typeof useFetch>} Результат выполнения запроса, содержащий данные или ошибку.
 */
export function useSEO(
  url_page: string | (() => string),
  lazy: false,
): ReturnType<typeof useFetch> {

  interface MetaData {
    SHOW_OPEN_GRAPH?: boolean;
    OG_TYPE?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_status' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other' | '';
    OG_URL?: string;
    OG_TITLE?: string;
    OG_DESCRIPTION?: string;
    OG_IMAGE?: string;
    OG_IMAGE_WIDTH?: string;
    OG_IMAGE_HEIGHT?: string;
  }

  interface PageData {
    title?: string;
    meta_desc?: string;
    meta_key?: string;
    canonical?: string;
    og_type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_status' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other' | '';
    og_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    og_image_width?: string;
    og_image_height?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_card?: string;
  }

  const result = useFetch<{ data: PageData, meta: MetaData }>('/pages', {
    params: { url_page: url_page },
    lazy: lazy,
    $fetch: useNuxtApp().$apiFetch as typeof $fetch
  })


  if (result.error.value) {
    console.error(`Ошибка при загрузке данных с ${typeof url_page === 'function' ? url_page() : url_page}:`, result.error.value);
  }

  return result;
}