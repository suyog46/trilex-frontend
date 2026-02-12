
import { toast } from 'vue-sonner'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    console.log(' Client Middleware: User not authenticated, redirecting to login')
    return navigateTo('/login')
  }

  if (authStore.user?.role !== 'client') {
    console.log(' Client Middleware: User role is not "client". Current role:', authStore.user?.role)
    toast.error('Access denied. Only clients can access this page.')
    return navigateTo('/')
  }

  console.log(' Client Middleware: User is authenticated client, proceeding...')

  if (!authStore.clientVerificationStatus) {
    try {
      await authStore.getClientVerificationStatus()
    } catch (error) {
      console.error('Error fetching verification status:', error)
    }
  }

  const verificationStatus = authStore.clientVerificationStatus?.status

  const unprotectedRoutes = [
    // '/client/dashboard',
    '/client/verification-status',
    '/client/profile',
    '/client/help',
  ]

  const requiresVerification = !unprotectedRoutes.some(route => to.path.startsWith(route))

  if (requiresVerification && verificationStatus !== 'VERIFIED') {
    console.log('Client Middleware: User not verified, access to', to.path, 'is restricted')
    console.log('Current verification status:', verificationStatus)

    if (to.path === '/client/verification-status') {
      return
    }

    toast.error('Please verify your profile to access this feature')

    return navigateTo('/client/verification-status')
  }

  console.log('Client Middleware: Access allowed to', to.path)
})
