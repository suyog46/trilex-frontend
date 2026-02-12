export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated || !authStore.user) {
    return navigateTo('/login')
  }

  if (to.path.startsWith('/lawyer/dashboard')) {
    if (to.path === '/lawyer/verification-status') {
      return
    }

    if (!authStore.lawyerVerificationStatus) {
      try {
        await authStore.getLawyerVerificationStatus()
      } catch (error) {
        console.error('Error fetching lawyer verification status:', error)
        return navigateTo('/lawyer/verification-status')
      }
    }

    if (authStore.lawyerVerificationStatus?.status !== 'VERIFIED') {
      return navigateTo('/lawyer/verification-status')
    }
  }

  if (to.path.startsWith('/firm/dashboard')) {
    if (to.path === '/firm/verification-status') {
      return
    }

    if (!authStore.firmVerificationStatus) {
      try {
        await authStore.getFirmVerificationStatus()
      } catch (error) {
        console.error('Error fetching firm verification status:', error)
        return navigateTo('/firm/verification-status')
      }
    }

    if (authStore.firmVerificationStatus?.status !== 'VERIFIED') {
      return navigateTo('/firm/verification-status')
    }
  }
})
