import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')

  const userData = ref({});

  const isAuthenticated = computed(() => !isTokenExpired(token.value));

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const getToken = () =>{
    token.value = localStorage.getItem('token') || '';
  }

  const clearToken = () => {
    token.value = '';
    localStorage.removeItem('token');
  };

  const logout = () => {
    clearToken();
    window.location.href = `/`;
  };

  const getUserData = async () => {
    if (isAuthenticated.value) {
      const response = await useNuxtApp().$apiFetch<{ user: any }>(`/user-data`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
      })
      userData.value = response.user;
    }
  }

  return {
    token,
    userData,
    getUserData,
    isAuthenticated,
    setToken,
    getToken,
    clearToken,
    logout,
  }
})


function isTokenExpired(token: string) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const exp = payload.exp;

  return Date.now() >= exp * 1000;
}