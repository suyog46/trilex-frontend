import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthResponse, LoginInput, AuthError, LawyerRegisterInput, UserRegisterInput, LawyerSignupInput, LawFirmSignupInput,
  ForgotPasswordInput, ResetPasswordInput, VerifyForgotPasswordOtpInput, LawyerVerificationStatus, FirmVerificationStatus, ClientVerificationStatus } from '~/types/auth'
import { authApi } from '~/composables/api/auth.api'
import { verificationApi } from '~/composables/api/verification.api'
import { useChatSocket } from '~/composables/useChatSocket'

const extractUserIdFromToken = (token: string | undefined): string | null => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    
    const decodedPayload = atob(parts[1])
    const payload = JSON.parse(decodedPayload)
    return payload.user_id || null
  } catch (err) {
    console.error('Error extracting user_id from token:', err)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<AuthError | null>(null)
  const isInitialized = ref(false)
  const lawyerVerificationStatus = ref<LawyerVerificationStatus | null>(null)
  const firmVerificationStatus = ref<FirmVerificationStatus | null>(null)
  const clientVerificationStatus = ref<ClientVerificationStatus | null>(null)

  const { connect: connectChatSocket, disconnect: disconnectChatSocket } = useChatSocket()

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

  const isAuthenticated = computed(() => {
    const hasToken = accessToken.value !== null && accessToken.value !== undefined && accessToken.value !== ''
    console.log('isAuthenticated check:', { hasToken, tokenValue: accessToken.value })
    return hasToken
  }) 

  const isLawyer = computed(() => user.value?.role === 'lawyer')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userId = computed(() => user.value?.id || null)

  const handleError = (err: any): AuthError => {
    const errorData = err?.data || err?.response?.data || err
    
    let message = 'An error occurred'
    
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

  const initializeAuth = async () => {
    if (isInitialized.value) {
      console.log('initializeAuth: Already initialized, skipping')
      return
    }

    isLoading.value = true
    try {
      const tokenValue = accessToken.value
      const role = userRole.value
      
      console.log('initializeAuth starting:', { 
        tokenValue: tokenValue ? `Token exists (${tokenValue.substring(0, 20)}...)` : 'NO TOKEN',
        role: role || 'NONE',
        isInitialized: isInitialized.value
      })
      
      if (tokenValue && tokenValue.length > 0) {
        console.log('initializeAuth: Token found, user IS authenticated')
        
        try {
          const userDetails = role === 'lawyer'
            ? await authApi.lawyerMe()
            : role === 'firm'
              ? await authApi.firmMe()
              : await authApi.me()
          user.value = {
            id: userDetails?.user?.id,
            email: userDetails.user?.email || '',
            role: userDetails.user?.role || role || '',
            isEmailVerified: true,
            verification: userDetails.verification,
            profile: userDetails.profile,
            fullName: userDetails.verification?.full_name || userDetails.profile?.phone_number,
          } as User
          if (user.value?.role) {
            userRole.value = user.value.role as string
          }
          console.log('User details fetched from /me:', user.value)
          
          connectChatSocket('')
        } catch (meError) {
          console.error('Failed to fetch user details from /me during init:', meError)
          if (role) {
            user.value = {
              id: extractUserIdFromToken(tokenValue) || '',
              role: role as any,
              email: '',
              isEmailVerified: true,
            } as User
            console.log('User role restored from cookie:', role)
            
            connectChatSocket('')
          }
        }
      } else {
        console.log(' initializeAuth: No token found, user NOT authenticated')
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

  const login = async (payload: LoginInput) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(payload)

      const accessTokenValue = response.access || response.accessToken
      const refreshTokenValue = response.refresh || response.refreshToken

      if (accessTokenValue) {
        accessToken.value = accessTokenValue
      }
      if (refreshTokenValue) {
        refreshToken.value = refreshTokenValue
      }

      if (response.role) {
        userRole.value = response.role
      }

      try {
        const role = response.role as string
        const userDetails = role === 'lawyer'
          ? await authApi.lawyerMe()
          : role === 'firm'
            ? await authApi.firmMe()
            : await authApi.me()
        user.value = {
          id: userDetails?.user?.id,
          email: userDetails.user?.email || response.email,
          role: userDetails.user?.role || response.role,
          isEmailVerified: response.is_email_verified,
          verification: userDetails.verification,
          profile: userDetails.profile,
          fullName: userDetails.verification?.full_name || userDetails.profile?.phone_number,
        } as User
        if (user.value?.role) {
          userRole.value = user.value.role as string
        }
      } catch (meError) {
        console.error('Failed to fetch user details from /me:', meError)
        user.value = {
          id: extractUserIdFromToken(accessTokenValue) || '',
          email: response.email,
          role: response.role,
          isEmailVerified: response.is_email_verified,
        } as User
      }

      connectChatSocket('')

      return {
        success: true,
        email: response.email,
        role: response.role,
        is_email_verified: response.is_email_verified,
      }
    } catch (err: any) {
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
  
  
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      disconnectChatSocket()
      
      accessToken.value = null
      refreshToken.value = null
      userRole.value = null
      user.value = null
      isLoading.value = false
      isInitialized.value = false
    } catch (err) {
      console.warn('Logout API call failed, clearing local state anyway')
    } 

  } 

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

  const clearError = () => {
    error.value = null
  }

  const getLawyerVerificationStatus = async () => {
    try {
      const status = await verificationApi.getLawyerVerificationStatus()
      console.log(' Raw Lawyer Verification Status from API:', status)
      lawyerVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch lawyer verification status:', err)
      return null
    }
  }

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

  const getFirmVerificationStatus = async () => {
    try {
      const status = await verificationApi.getFirmVerificationStatus()
      console.log(' Raw Firm Verification Status from API:', status)
      firmVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch firm verification status:', err)
      return null
    }
  }

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

  const getClientVerificationStatus = async () => {
    try {
      const status = await verificationApi.getClientVerificationStatus()
      console.log(' Raw Client Verification Status from API:', status)
      clientVerificationStatus.value = status
      return status
    } catch (err: any) {
      console.error('Failed to fetch client verification status:', err)
      return null
    }
  }

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
    user,
    isLoading,
    error,
    isInitialized,
    accessToken,
    refreshToken,
    lawyerVerificationStatus,
    firmVerificationStatus,
    clientVerificationStatus,

    isAuthenticated,
    isLawyer,
    isAdmin,
    userId,

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
