
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!authStore.isLawyer) {
    return navigateTo('/')
  }
})
