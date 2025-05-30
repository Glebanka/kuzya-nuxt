export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const userStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(userStore)
  
  userStore.$onAction(({name, after})=>{
    if(name == 'getToken'){      
      after(()=>{
        if(!isAuthenticated.value){
          return navigateTo('/')
        }
      })
    }
  })
})