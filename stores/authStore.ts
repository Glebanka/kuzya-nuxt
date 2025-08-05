import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  
  const userData: Ref<UserData | {}> = ref({});

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


interface DeliveryAddress {
  id: number;
  user_id: number;
  address: string;
  flat: string;
  floor: string;
}

interface UserData {
  id: number;
  user_id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string | null;
  gender: number;
  person_type: number;
  date_of_birth: string; // формат: YYYY-MM-DD
  date_of_wedding: string | null;
  children_count: number | null;
  image: string;
  created_at: string; // ISO-строка
  updated_at: string; // ISO-строка
  delivery_addresses: DeliveryAddress[];
}