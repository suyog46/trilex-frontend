/**
 * Auth Middleware
 * Protects routes that require authentication
 * Redirects unauthenticated users to login
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
