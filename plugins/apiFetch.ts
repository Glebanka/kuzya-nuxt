export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBaseURL,

    async onResponseError({ response }) {
      // Handle 401 Unauthorized error and 422 Unvalidation error
      if(response.status === 401 || response.status === 422) {
        return
      }
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
