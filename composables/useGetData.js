export default async function useGetData(url, options) {
  // Пытаемся получить кэшированные данные по указанному ключу
  const { data: cachedData } = useNuxtData(options.key);

  if (cachedData.value) {
    // Если данные уже есть – возвращаем их
    return { data: cachedData };
  } else {
    // Если данных нет – выполняем API запрос через useAPI
    const { data: seoData } = await useAPI(url, options);
    return { data: seoData };
  }
}