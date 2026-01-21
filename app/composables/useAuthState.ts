/**
 * useAuthState Composable
 * Simple helper for checking auth status across components
 */

import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { UserRole } from '~/types/auth'

export const useAuthState = () => {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const isLawyer = computed(() => authStore.isLawyer)
  const isAdmin = computed(() => authStore.isAdmin)

  const hasRole = (role: UserRole) => authStore.user?.role === role

  const logout = async () => {
    await authStore.logout()
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    isLawyer,
    isAdmin,
    hasRole,
    logout,
  }
}
