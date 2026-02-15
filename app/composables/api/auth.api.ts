

import type { 
  LoginInput, 
  AuthResponse, 
  LawyerRegisterInput, 
  UserRegisterInput,
  LawyerSignupInput,
  LawFirmSignupInput,
  User 
} from "~/types/auth"
import { URL } from "~/lib/constants/url"

export const authApi = {
  login: (payload: LoginInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LOGIN, {
      method: "POST", 
      body: payload,
    })
  },

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

  registerLawyer: (payload: LawyerRegisterInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    
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


  me: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.ME)
  },


  lawyerMe: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.LAWYER_ME)
  },


  firmMe: (): Promise<any> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.FIRM_ME)
  },

 
  refreshToken: (token: string): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.REFRESH, {
      method: "POST",
      body: { refreshToken: token },
    })
  },

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

  resendVerificationLink: (payload: { email: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.RESEND_VERIFICATION_LINK, {
      method: "POST",
      body: payload,
    })
  },

  forgotPassword: (payload: { email: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      body: payload,
    })
  },

  verifyForgotPasswordOtp: (payload: { email: string; otp: string }): Promise<{ message: string; reset_token?: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.VERIFY_FORGOT_PASSWORD_OTP, {
      method: "POST",
      body: payload,
    })
  },

  resetPassword: (payload: { token: string; new_password: string }): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.AUTH.RESET_PASSWORD, {
      method: "POST",
      body: payload,
    })
  },
}
