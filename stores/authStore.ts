import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('bearer_token') || '');

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('bearer_token', newToken);
  };

  const clearToken = () => {
    token.value = '';
    localStorage.removeItem('bearer_token');
  };
  const logout = () => {
    clearToken();
    window.location.href = `/`;
  };

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
    logout,
  }
})
