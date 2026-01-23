/**
 * Admin-Only Middleware
 * Protects routes that require admin role
 * Redirects non-admins to home page
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

  // Check if user is an admin
  if (!authStore.isAdmin) {
    console.warn('User is not an admin, redirecting to home')
    return navigateTo('/')
  }
})
