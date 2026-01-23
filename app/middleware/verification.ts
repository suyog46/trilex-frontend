export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated || !authStore.user) {
    return navigateTo('/login')
  }

  // Check if route is for lawyer dashboard
  if (to.path.startsWith('/lawyer/dashboard')) {
    // Don't check verification if already on verification-status page
    if (to.path === '/lawyer/verification-status') {
      return
    }

    // Fetch current verification status if not already cached
    if (!authStore.lawyerVerificationStatus) {
      try {
        await authStore.getLawyerVerificationStatus()
      } catch (error) {
        console.error('Error fetching lawyer verification status:', error)
        return navigateTo('/lawyer/verification-status')
      }
    }

    // If not verified, redirect to verification-status page
    if (authStore.lawyerVerificationStatus?.status !== 'VERIFIED') {
      return navigateTo('/lawyer/verification-status')
    }
  }

  // Check if route is for firm dashboard
  if (to.path.startsWith('/firm/dashboard')) {
    // Don't check verification if already on verification-status page
    if (to.path === '/firm/verification-status') {
      return
    }

    // Fetch current verification status if not already cached
    if (!authStore.firmVerificationStatus) {
      try {
        await authStore.getFirmVerificationStatus()
      } catch (error) {
        console.error('Error fetching firm verification status:', error)
        return navigateTo('/firm/verification-status')
      }
    }

    // If not verified, redirect to verification-status page
    if (authStore.firmVerificationStatus?.status !== 'VERIFIED') {
      return navigateTo('/firm/verification-status')
    }
  }
})
