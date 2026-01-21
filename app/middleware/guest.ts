/**
 * Guest Middleware
 * Protects guest-only routes (login, register)
 * Redirects authenticated users to dashboard
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
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
