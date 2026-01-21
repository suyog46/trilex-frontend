/**
 * Lawyer-Only Middleware
 * Protects routes that require lawyer role
 * Redirects non-lawyers to home page
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Check if authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check if user is a lawyer
  if (!authStore.isLawyer) {
    return navigateTo('/')
  }
})
