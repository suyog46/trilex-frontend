/**
 * Pinia Auth Store (Setup Style)
 * Centralized authentication state management
 * Handles login, logout, token refresh, and user state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthResponse, LoginInput, AuthError, LawyerRegisterInput, UserRegisterInput } from '~/types/auth'
import { authApi } from '~/composables/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<AuthError | null>(null)
  const isInitialized = ref(false)

  // Cookies for token persistence (SSR-safe)
  const accessToken = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  })

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const isLawyer = computed(() => user.value?.role === 'lawyer')
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Error handler
  const handleError = (err: any): AuthError => {
    const authError: AuthError = {
      code: err?.data?.code || 'UNKNOWN_ERROR',
      message: err?.data?.message || err?.message || 'An error occurred',
      statusCode: err?.status || 500,
    }

    error.value = authError
    console.error('Auth Error:', authError)
    return authError
  }

  // Initialize auth state (on app startup / SSR)
  const initializeAuth = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    try {
      // Check if we have a token from cookie
      if (accessToken.value) {
        // Fetch current user info
        const currentUser = await authApi.me()
        user.value = currentUser
      }
    } catch (err) {
      // Token invalid or expired, clear it
      accessToken.value = null
      refreshToken.value = null
      user.value = null
      console.warn('Auth initialization failed, tokens cleared')
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  // Login
  const login = async (payload: LoginInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(payload)

      // Store tokens in cookies
      accessToken.value = response.accessToken
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }

      // Store user
      user.value = response.user

      return { success: true }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }


  const registerUser = async (payload: UserRegisterInput) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('Registering user with payload:', payload)
      const response = await authApi.registerUser(payload)

      console.log('Registration response:', response)
      accessToken.value = response.accessToken
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }

      user.value = response.user

      return { success: true }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Lawyer Registration (with file uploads)
  const registerLawyer = async (payload: LawyerRegisterInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.registerLawyer(payload)

      accessToken.value = response.accessToken
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }

      user.value = response.user

      return { success: true }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Call logout endpoint to invalidate token on server
      await authApi.logout()
    } catch (err) {
      console.warn('Logout API call failed, clearing local state anyway')
    } finally {
      // Clear local state regardless of API call result
      accessToken.value = null
      refreshToken.value = null
      user.value = null
      isLoading.value = false
      isInitialized.value = false
    }
  }

  // Refresh token
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      await logout()
      return false
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value)
      accessToken.value = response.accessToken
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }
      user.value = response.user
      return true
    } catch (err) {
      await logout()
      return false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    accessToken,
    refreshToken,

    // Computed
    isAuthenticated,
    isLawyer,
    isAdmin,

    // Methods
    initializeAuth,
    login,
    registerUser,
    registerLawyer,
    logout,
    refreshAccessToken,
    clearError,
  }
})
