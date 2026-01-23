import { URL } from "~/lib/constants/url"

// Case Categories
export interface CaseCategory {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface CreateCategoriesInput {
  name: string
  is_active: boolean
}

// Firm Verifications
export interface FirmVerification {
  id?: string
  firm_name: string
  owner_name: string
  firm_id: string
  status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejection_reason?: string
  firm_license: {
    id: string
    url: string
  }
}

// Lawyer Bar Verifications
export interface LawyerBarVerification {
  id?: string
  full_name: string
  date_of_birth: string
  bar_id: string
  gender: string
  status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejection_reason?: string
  license_photo: {
    id: string
    url: string
  }
}

// Client Verifications
export interface ClientVerification {
  id?: string
  user?: {
    id: string
    email: string
    role: string
  }
  full_name: string
  date_of_birth: string
  id_type: 'NATIONAL_ID' | 'PASSPORT'
  status: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejection_reason?: string
  passport_size_photo: {
    id: string
    url: string
  }
  photo_front: {
    id: string
    url: string
  }
  photo_back: {
    id: string
    url: string
  }
}

export interface VerificationListResponse<T> {
  results: T[]
  count: number
  next?: string
  previous?: string
}

// Case Categories API
export const caseCategoryApi = {
  /**
   * Get all case categories (for admin)
   */
  getCategories: (params?: { page?: number; page_size?: number }): Promise<VerificationListResponse<CaseCategory>> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.CASE_CATEGORIES, {
      params,
    })
  },

  /**
   * Get case category by ID
   */
  getCategoryById: (id: string): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`)
  },

  /**
   * Create case category
   */
  createCategory: (payload: CreateCategoriesInput): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.CASE_CATEGORIES, {
      method: 'POST',
      body: payload,
    })
  },

  /**
   * Update case category
   */
  updateCategory: (id: string, payload: CreateCategoriesInput): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`, {
      method: 'PUT',
      body: payload,
    })
  },

  /**
   * Delete case category
   */
  deleteCategory: (id: string): Promise<void> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`, {
      method: 'DELETE',
    })
  },
}

// Firm Verifications API
export const firmVerificationApi = {
  /**
   * Get firm verifications
   */
  getVerifications: (params?: { 
    page?: number
    page_size?: number
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  }): Promise<VerificationListResponse<FirmVerification>> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.FIRM_VERIFICATIONS, {
      params,
    })
  },

  /**
   * Approve firm verification
   */
  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.FIRM_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },

  /**
   * Reject firm verification
   */
  rejectVerification: (verificationId: string, rejectionReason: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.FIRM_VERIFICATIONS}${verificationId}/reject/`, {
      method: 'POST',
      body: {
        rejection_reason: rejectionReason,
      },
    })
  },
}

// Lawyer Bar Verifications API
export const lawyerBarVerificationApi = {
  /**
   * Get lawyer bar verifications
   */
  getVerifications: (params?: {
    page?: number
    page_size?: number
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  }): Promise<VerificationListResponse<LawyerBarVerification>> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.LAWYER_VERIFICATIONS, {
      params,
    })
  },

  /**
   * Approve lawyer bar verification
   */
  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.LAWYER_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },

  /**
   * Reject lawyer bar verification
   */
  rejectVerification: (verificationId: string, rejectionReason: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.LAWYER_VERIFICATIONS}${verificationId}/reject/`, {
      method: 'POST',
      body: {
        rejection_reason: rejectionReason,
      },
    })
  },
}

// Client Verifications API
export const clientVerificationApi = {
  /**
   * Get client verifications
   */
  getVerifications: (params?: {
    page?: number
    page_size?: number
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  }): Promise<VerificationListResponse<ClientVerification>> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.CLIENT_VERIFICATIONS, {
      params,
    })
  },

  /**
   * Approve client verification
   */
  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CLIENT_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },

  /**
   * Reject client verification
   */
  rejectVerification: (verificationId: string, rejectionReason: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CLIENT_VERIFICATIONS}${verificationId}/reject/`, {
      method: 'POST',
      body: {
        rejection_reason: rejectionReason,
      },
    })
  },
}
