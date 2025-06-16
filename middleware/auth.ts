export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)
  
  authStore.$onAction(({name, after})=>{
    if(name == 'getToken'){
      after(()=>{
        if(!isAuthenticated.value){
          return navigateTo('/')
        }
      })
    }
  })
})