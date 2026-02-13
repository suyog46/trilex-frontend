

import type { 
  LoginInput, 
  AuthResponse, 
  LawyerRegisterInput, 
  UserRegisterInput,
  LawyerSignupInput,
  User 
} from "~/types/auth"
import { URL } from "~/lib/constants/url"

export const authApi = {
  /**
   * Login with email and password
   */
  login: (payload: LoginInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LOGIN, {
      method: "POST", 
      body: payload,
    })
  },

  /**
   * Register as regular user
   * Endpoint: POST /api/clients/signup/
   */
  registerUser: (payload: UserRegisterInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.USER_SIGNUP, {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
        client_type: "web",
      },
    })
  },

  /**
   * Register as lawyer with address and services
   * Endpoint: POST /api/lawyers/signup/
   */
  registerLawyerSignup: (payload: LawyerSignupInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LAWYER_SIGNUP, {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
        client_type: payload.client_type || "web",
        services: payload.services,
        address: payload.address,
        verification: payload.verification,
      },
    })
  },

  /**
   * Register as law firm with address and services
   * Endpoint: POST /api/lawyers/signup/
   */
  registerLawFirmSignup: (payload: LawFirmSignupInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LAW_FIRM_SIGNUP, {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
        client_type: payload.client_type || "web",
        services: payload.services,
        address: payload.address,
        verification: payload.verification,
      },
    })
  },

  /**
   * Register as lawyer with file uploads (old method)
   * Handles multipart/form-data for citizenship photos
   */
  registerLawyer: (payload: LawyerRegisterInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    
    // Create FormData for file uploads
    const formData = new FormData()
    formData.append("fullName", payload.fullName)
    formData.append("phoneNumber", payload.phoneNumber)
    formData.append("gender", payload.gender)
    formData.append("documentType", payload.documentType)
    formData.append("citizenshipNumber", payload.citizenshipNumber)
    formData.append("citizenshipPhotoFront", payload.citizenshipPhotoFront)
    formData.append("citizenshipPhotoBack", payload.citizenshipPhotoBack)

    return apiFetch(URL.API.AUTH.LAWYER_REGISTER, {
      method: "POST",
      body: formData,
    })
  },

  /**
   * Get current user info with verification details
   * Returns full user data including verification status
   */
  me: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.ME)
  },

  /**
   * Get current lawyer info
   */
  lawyerMe: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LAWYER_ME)
  },

  /**
   * Get current firm info
   */
  firmMe: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.FIRM_ME)
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: (token: string): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.REFRESH, {
      method: "POST",
      body: { refreshToken: token },
    })
  },

  /**
   * Logout (invalidate token on server)
   */
  logout: (): Promise<void> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LOGOUT, {
      method: "POST",
    })
  },


  verifyEmail: (payload: { token: string }): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.VERIFY_LINK, {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Resend verification link to email
   */
  resendVerificationLink: (payload: { email: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.RESEND_VERIFICATION_LINK, {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Request password reset link
   * Endpoint: POST /api/auth/forgot-password/
   */
  forgotPassword: (payload: { email: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Verify OTP for forgot password
   * Endpoint: POST /api/auth/verify-forgot-password-otp/
   */
  verifyForgotPasswordOtp: (payload: { email: string; otp: string }): Promise<{ message: string; reset_token?: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.VERIFY_FORGOT_PASSWORD_OTP, {
      method: "POST",
      body: payload,
    })
  },

  /**
   * Reset password with token
   * Endpoint: POST /api/auth/reset-password/
   */
  resetPassword: (payload: { token: string; new_password: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.RESET_PASSWORD, {
      method: "POST",
      body: payload,
    })
  },
}
