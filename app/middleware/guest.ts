

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Redirect authenticated users
  if (authStore.isAuthenticated) {
    // Redirect to role-based dashboard
    if (authStore.isLawyer) {
      return navigateTo('/lawyer/dashboard')
    }
    return navigateTo('/')
  }
})
