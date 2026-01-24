/**
 * Pinia Auth Store (Setup Style)
 * Centralized authentication state management
 * Handles login, logout, token refresh, and user state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthResponse, LoginInput, AuthError, LawyerRegisterInput, UserRegisterInput, LawyerSignupInput, LawFirmSignupInput,
  ForgotPasswordInput, ResetPasswordInput, VerifyForgotPasswordOtpInput, LawyerVerificationStatus, FirmVerificationStatus, ClientVerificationStatus } from '~/types/auth'
import { authApi } from '~/composables/api/auth.api'
import { verificationApi } from '~/composables/api/verification.api'

// Helper function to extract user_id from JWT token
const extractUserIdFromToken = (token: string | undefined): string | null => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    
    // Decode the payload (second part)
    const decodedPayload = atob(parts[1])
    const payload = JSON.parse(decodedPayload)
    return payload.user_id || null
  } catch (err) {
    console.error('Error extracting user_id from token:', err)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<AuthError | null>(null)
  const isInitialized = ref(false)
  const lawyerVerificationStatus = ref<LawyerVerificationStatus | null>(null)
  const firmVerificationStatus = ref<FirmVerificationStatus | null>(null)
  const clientVerificationStatus = ref<ClientVerificationStatus | null>(null)

  const accessToken = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24 * 7,
    secure: true,
    httpOnly: false,
    sameSite: 'strict',
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: false,
    sameSite: 'strict',
  })

  const userRole = useCookie<string | null>('user_role', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: true,
    httpOnly: false,
    sameSite: 'strict',
  })

  // Computed
  const isAuthenticated = computed(() => {
    // Check if we have an access token in the cookie
    const hasToken = accessToken.value !== null && accessToken.value !== undefined && accessToken.value !== ''
    console.log('isAuthenticated check:', { hasToken, tokenValue: accessToken.value })
    return hasToken
  }) 

  const isLawyer = computed(() => user.value?.role === 'lawyer')
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Error handler
  const handleError = (err: any): AuthError => {
    // Extract error message from different Django response formats
    const errorData = err?.data || err?.response?.data || err
    
    let message = 'An error occurred'
    
    // Try to extract message from common Django error response formats
    if (typeof errorData === 'object' && errorData !== null) {
      if (errorData.error && typeof errorData.error === 'string') {
        message = errorData.error
      } else if (errorData.message && typeof errorData.message === 'string') {
        message = errorData.message
      } else if (errorData.detail && typeof errorData.detail === 'string') {
        message = errorData.detail
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        message = errorData.non_field_errors[0] || message
      }
    } else if (typeof errorData === 'string') {
      message = errorData
    } else if (err?.message) {
      message = err.message
    }

    const authError: AuthError = {
      code: err?.data?.code || 'UNKNOWN_ERROR',
      message,
      statusCode: err?.status || 500,
    }

    error.value = authError
    console.error('Auth Error:', authError)
    return authError
  }

  // Initialize auth state (on app startup / SSR)
  const initializeAuth = async () => {
    if (isInitialized.value) {
      console.log('initializeAuth: Already initialized, skipping')
      return
    }

    isLoading.value = true
    try {
      // Check if we have a token from cookie
      const tokenValue = accessToken.value
      const role = userRole.value
      
      console.log('initializeAuth starting:', { 
        tokenValue: tokenValue ? `Token exists (${tokenValue.substring(0, 20)}...)` : 'NO TOKEN',
        role: role || 'NONE',
        isInitialized: isInitialized.value
      })
      
      if (tokenValue && tokenValue.length > 0) {
        console.log('✅ initializeAuth: Token found, user IS authenticated')
        // Restore user object with stored role
        if (role) {
          user.value = {
            id: extractUserIdFromToken(tokenValue) || '',
            role: role as any,
            email: '', // Email will be populated on next request or remain empty
            isEmailVerified: true, // Assume verified if token exists
          } as User
          console.log('✅ User role restored from cookie:', role)
        }
      } else {
        console.log('❌ initializeAuth: No token found, user NOT authenticated')
      }
    } catch (err) {
      console.error('initializeAuth: Unexpected error:', err)
      accessToken.value = null
      refreshToken.value = null
      userRole.value = null
      user.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
      console.log('initializeAuth complete. Current state:', {
        isAuthenticated: isAuthenticated.value,
        hasAccessToken: !!accessToken.value,
        userRole: user.value?.role || 'NONE'
      })
    }
  }

  // Login
  const login = async (payload: LoginInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(payload)

      // Handle new API response format
      const accessTokenValue = response.access || response.accessToken
      const refreshTokenValue = response.refresh || response.refreshToken

      // Store tokens in cookies
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (refreshTokenValue) {
        refreshToken.value = refreshTokenValue
      }

      // Store role in cookie for persistence across reloads
      if (response.role) {
        userRole.value = response.role
      }

      // Create user object from response - extract what's available
      user.value = {
        id: extractUserIdFromToken(accessTokenValue) || '',
        email: response.email,
        role: response.role,
        isEmailVerified: response.is_email_verified,
      } as User

      return {
        success: true,
        email: response.email,
        role: response.role,
        is_email_verified: response.is_email_verified,
      }
    } catch (err: any) {
      // Handle not verified error (404 with email_not_verified message)
      if (err?.status === 404 && err?.data?.message === 'Email not verified') {
        return {
          success: false,
          statusCode: 404,
          email: err?.data?.email,
          role: err?.data?.role,
          is_email_verified: false,
          message: err?.data?.message,
        }
      }
      
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
      const response = await authApi.registerUser(payload)
      const accessTokenValue = response.access || response.accessToken
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (response.refresh || response.refreshToken) {
        refreshToken.value = response.refresh || response.refreshToken || null
      }

      if (response.user) {
        user.value = response.user
      }

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

      const accessTokenValue = response.access || response.accessToken
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (response.refresh || response.refreshToken) {
        refreshToken.value = response.refresh || response.refreshToken || null
      }

      if (response.user) {
        user.value = response.user
      }

      return { success: true }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Lawyer Signup (new flow with address and services)
  const registerLawyerSignup = async (payload: LawyerSignupInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.registerLawyerSignup(payload)

      const accessTokenValue = response.access || response.accessToken
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (response.refresh || response.refreshToken) {
        refreshToken.value = response.refresh || response.refreshToken || null
      }

      if (response.user) {
        user.value = response.user
        userRole.value = response.user.role
      }

      return { success: true, role: response.user?.role || 'lawyer' }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Law Firm Signup (new flow with address and services)
  const registerLawFirmSignup = async (payload: LawFirmSignupInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.registerLawFirmSignup(payload)

      const accessTokenValue = response.access || response.accessToken
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (response.refresh || response.refreshToken) {
        refreshToken.value = response.refresh || response.refreshToken || null
      }

      if (response.user) {
        user.value = response.user
        userRole.value = response.user.role
      }

      return { success: true, role: response.user?.role || 'firm' }
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
      accessToken.value = null
      refreshToken.value = null
      userRole.value = null
      user.value = null
      isLoading.value = false
      isInitialized.value = false
      // Call logout endpoint to invalidate token on server
      // await authApi.logout()
    } catch (err) {
      console.warn('Logout API call failed, clearing local state anyway')
    } 

  } 

  // Forgot Password
  const forgotPassword = async (payload: ForgotPasswordInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.forgotPassword(payload)
      return { success: true, message: response.message }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Verify Forgot Password OTP
  const verifyForgotPasswordOtp = async (payload: VerifyForgotPasswordOtpInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.verifyForgotPasswordOtp(payload)
      return { success: true, message: response.message, reset_token : response.reset_token }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Reset Password
  const resetPassword = async (payload: ResetPasswordInput & { token: string }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.resetPassword({
        token: payload.token,
        new_password: payload.new_password,
      })
      return { success: true, message: response.message }
    } catch (err) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
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
      const accessTokenValue = response.access || response.accessToken
      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (response.refresh || response.refreshToken) {
        refreshToken.value = response.refresh || response.refreshToken || null
      }
      if (response.user) {
        user.value = response.user
      }
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

  // Get lawyer verification status
  const getLawyerVerificationStatus = async () => {
    try {
      const status = await verificationApi.getLawyerVerificationStatus()
      console.log('🔍 Raw Lawyer Verification Status from API:', status)
      lawyerVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch lawyer verification status:', err)
      return null
    }
  }

  // Submit lawyer verification
  const submitLawyerVerification = async (data: any) => {
    isLoading.value = true
    try {
      const status = await verificationApi.submitLawyerVerification(data)
      lawyerVerificationStatus.value = status
      return { success: true }
    } catch (err: any) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Get firm verification status
  const getFirmVerificationStatus = async () => {
    try {
      const status = await verificationApi.getFirmVerificationStatus()
      console.log('🔍 Raw Firm Verification Status from API:', status)
      firmVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch firm verification status:', err)
      return null
    }
  }

  // Submit firm verification
  const submitFirmVerification = async (data: any) => {
    isLoading.value = true
    try {
      const status = await verificationApi.submitFirmVerification(data)
      firmVerificationStatus.value = status
      return { success: true }
    } catch (err: any) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Get client verification status
  const getClientVerificationStatus = async () => {
    try {
      const status = await verificationApi.getClientVerificationStatus()
      console.log('🔍 Raw Client Verification Status from API:', status)
      clientVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch client verification status:', err)
      return null
    }
  }

  // Submit client verification
  const submitClientVerification = async (data: any) => {
    isLoading.value = true
    try {
      const status = await verificationApi.submitClientVerification(data)
      clientVerificationStatus.value = status
      return { success: true }
    } catch (err: any) {
      handleError(err)
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    accessToken,
    refreshToken,
    lawyerVerificationStatus,
    firmVerificationStatus,
    clientVerificationStatus,

    // Computed
    isAuthenticated,
    isLawyer,
    isAdmin,

    // Methods
    initializeAuth,
    login,
    registerUser,
    registerLawyer,
    registerLawyerSignup,
    registerLawFirmSignup,
    logout,
    refreshAccessToken,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    clearError,
    getLawyerVerificationStatus,
    submitLawyerVerification,
    getFirmVerificationStatus,
    submitFirmVerification,
    getClientVerificationStatus,
    submitClientVerification,
  }
})
