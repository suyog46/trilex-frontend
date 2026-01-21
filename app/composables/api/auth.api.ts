

import type { 
  LoginInput, 
  AuthResponse, 
  LawyerRegisterInput, 
  UserRegisterInput,
  User 
} from "~/types/auth"

export const authApi = {
  /**
   * Login with email and password
   */
  login: (payload: LoginInput): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch("/auth/login", {
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
    return apiFetch("/api/clients/signup/", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
        client_type: "web",
      },
    })
  },

  /**
   * Register as lawyer with file uploads
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

    return apiFetch("/auth/register/lawyer", {
      method: "POST",
      body: formData,
    })
  },

  /**
   * Get current user info
   */
  me: (): Promise<User> => {
    const apiFetch = useApiFetch()
    return apiFetch("/auth/me")
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: (token: string): Promise<AuthResponse> => {
    const apiFetch = useApiFetch()
    return apiFetch("/auth/refresh", {
      method: "POST",
      body: { refreshToken: token },
    })
  },

  /**
   * Logout (invalidate token on server)
   */
  logout: (): Promise<void> => {
    const apiFetch = useApiFetch()
    return apiFetch("/auth/logout", {
      method: "POST",
    })
  },
}
