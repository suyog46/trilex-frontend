import { toast } from 'vue-sonner'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (authStore.user?.role !== 'firm') {
    console.log(' Firm Middleware: User is not a firm. Current role:', authStore.user?.role)
    toast.error('Access denied. This page is only for law firms.')
    return navigateTo('/')
  }

  // Prevent firms from accessing client or lawyer pages
  if (to.path.startsWith('/client/') || to.path.startsWith('/lawyer/')) {
    console.log(' Firm Middleware: Firms cannot access', to.path)
    toast.error('Access denied. This page is not available for law firms.')
    return navigateTo('/law-firm/dashboard')
  }

  console.log(' Firm Middleware: User is authenticated firm, proceeding...')
})
