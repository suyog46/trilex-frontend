import { URL } from "~/lib/constants/url"

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

export const caseCategoryApi = {

  getCategories: (params?: { page?: number; page_size?: number }): Promise<VerificationListResponse<CaseCategory>> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.CASE_CATEGORIES, {
      params,
    })
  },


  getCategoryById: (id: string): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`)
  },


  createCategory: (payload: CreateCategoriesInput): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.ADMIN.CASE_CATEGORIES, {
      method: 'POST',
      body: payload,
    })
  },


  updateCategory: (id: string, payload: CreateCategoriesInput): Promise<CaseCategory> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`, {
      method: 'PUT',
      body: payload,
    })
  },

  deleteCategory: (id: string): Promise<void> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CASE_CATEGORIES}${id}/`, {
      method: 'DELETE',
    })
  },
}

export const firmVerificationApi = {

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


  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.FIRM_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },

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

export const lawyerBarVerificationApi = {

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


  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.LAWYER_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },

 
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

export const clientVerificationApi = {

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


  approveVerification: (verificationId: string): Promise<{ message: string }> => {
    const apiFetch = useApiFetch()
    return apiFetch(`${URL.API.ADMIN.CLIENT_VERIFICATIONS}${verificationId}/approve/`, {
      method: 'POST',
      body: {
        rejection_reason: '',
      },
    })
  },


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
