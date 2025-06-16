
export const useTokenReady = (callback: Function) => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)
  if (!isAuthenticated.value) {
    authStore.$onAction(({ name, after }) => {
      if (name === 'getToken') {
        after(() => {
          callback()
        })
      }
    })
  } else{
    callback()
  }
}