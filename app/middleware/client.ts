/**
 * Client Route Guard Middleware
 * Ensures only authenticated clients can access /client routes
 * Enforces verification gating for certain routes
 */

import { toast } from 'vue-sonner'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Ensure auth is initialized
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    console.log(' Client Middleware: User not authenticated, redirecting to login')
    return navigateTo('/login')
  }

  // STRICT CHECK: Only allow users with role='client'
  if (authStore.user?.role !== 'client') {
    console.log(' Client Middleware: User role is not "client". Current role:', authStore.user?.role)
    toast.error('Access denied. Only clients can access this page.')
    return navigateTo('/')
  }

  console.log(' Client Middleware: User is authenticated client, proceeding...')

  // Fetch verification status if not already fetched
  if (!authStore.clientVerificationStatus) {
    try {
      await authStore.getClientVerificationStatus()
    } catch (error) {
      console.error('Error fetching verification status:', error)
    }
  }

  const verificationStatus = authStore.clientVerificationStatus?.status

  // Routes that don't require verification
  const unprotectedRoutes = [
    // '/client/dashboard',
    '/client/verification-status',
    '/client/profile',
    '/client/help',
  ]

  // Check if route requires verification
  const requiresVerification = !unprotectedRoutes.some(route => to.path.startsWith(route))

  if (requiresVerification && verificationStatus !== 'VERIFIED') {
    console.log('⚠️ Client Middleware: User not verified, access to', to.path, 'is restricted')
    console.log('Current verification status:', verificationStatus)

    // Allow redirect to verification page
    if (to.path === '/client/verification-status') {
      return
    }

    // Show toast and redirect to verification
    toast.error('Please verify your profile to access this feature')

    return navigateTo('/client/verification-status')
  }

  console.log('✅ Client Middleware: Access allowed to', to.path)
})
