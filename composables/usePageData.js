export default async function usePageData({ urlPage, cacheKey }) {
  // Пытаемся получить кэшированные данные по указанному ключу
  const { data: cachedData } = useNuxtData(cacheKey);

  if (cachedData.value) {
    // Если данные уже есть – возвращаем их
    return { data: cachedData };
  } else {
    // Если данных нет – выполняем API запрос через useAPI
    const { data: seoData } = await useAPI('/pages', {
      params: { url_page: urlPage },
      key: cacheKey
    });
    return { data: seoData };
  }
}