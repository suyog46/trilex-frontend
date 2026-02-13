
import { toast } from 'vue-sonner'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!authStore.isLawyer) {
    console.log(' Lawyer Middleware: User is not a lawyer. Current role:', authStore.user?.role)
    toast.error('Access denied. This page is only for lawyers.')
    return navigateTo('/')
  }

  // Prevent lawyers from accessing client or law-firm pages
  if (to.path.startsWith('/client/') || to.path.startsWith('/law-firm/')) {
    console.log(' Lawyer Middleware: Lawyers cannot access', to.path)
    toast.error('Access denied. This page is not available for lawyers.')
    return navigateTo('/lawyer/dashboard')
  }

  console.log(' Lawyer Middleware: User is authenticated lawyer, proceeding...')
})
