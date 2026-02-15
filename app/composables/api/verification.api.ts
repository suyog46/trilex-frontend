import { URL } from "~/lib/constants/url"

export interface FileReference {
  id: string
  url: string
}

export interface LawyerVerificationStatus {
  full_name: string
  date_of_birth: string
  bar_id: string
  gender: string
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED'
  rejection_reason?: string | null
  license_photo: FileReference
}

export interface FirmVerificationStatus {
  firm_name: string
  owner_name: string
  firm_id: string
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED'
  rejection_reason?: string | null
  firm_license: FileReference
}

export interface LawyerVerificationSubmit {
  full_name: string
  date_of_birth: string
  bar_id: string
  gender: string
  license_photo: string
}

export interface FirmVerificationSubmit {
  firm_name: string
  owner_name: string
  firm_id: string
  firm_license: string
}

export interface ClientVerificationStatus {
  id: string
  full_name: string
  date_of_birth: string
  id_type: 'NATIONAL_ID' | 'PASSPORT'
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED'
  rejection_reason?: string | null
  passport_size_photo: FileReference
  photo_front: FileReference
  photo_back: FileReference
}

export interface ClientVerificationSubmit {
  full_name: string
  date_of_birth: string
  id_type: 'NATIONAL_ID' | 'PASSPORT'
  passport_size_photo: string
  photo_front: string
  photo_back: string
}

export const verificationApi = {
  getLawyerVerificationStatus: (): Promise<LawyerVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.LAWYER_STATUS)
  },

  submitLawyerVerification: (data: LawyerVerificationSubmit): Promise<LawyerVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.LAWYER_SUBMIT, {
      method: 'POST',
      body: data,
    })
  },

  getFirmVerificationStatus: (): Promise<FirmVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.FIRM_STATUS)
  },

  submitFirmVerification: (data: FirmVerificationSubmit): Promise<FirmVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.FIRM_SUBMIT, {
      method: 'POST',
      body: data,
    })
  },

  getClientVerificationStatus: (): Promise<ClientVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.CLIENT_STATUS)
  },

  submitClientVerification: (data: ClientVerificationSubmit): Promise<ClientVerificationStatus> => {
    const apiFetch = useApiFetch()
    return apiFetch(URL.API.VERIFICATION.CLIENT_SUBMIT, {
      method: 'POST',
      body: data,
    })
  },
}
