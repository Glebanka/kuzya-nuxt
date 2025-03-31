export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBaseURL,

    async onResponseError({ response }) {
      console.error('Ошибка ответа сервера:', response);
    },

    async onRequestError({ error }) {
      console.error('Ошибка запроса:', error);
    }
  });


  return {
    provide: {
      apiFetch,
    },
  };
});
