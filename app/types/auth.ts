/**
 * Authentication Types
 * Centralized type definitions for auth flow
 */

export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  CLIENT = 'client',
}

export interface User {
  id: string
  email: string
  fullName?: string
  role: UserRole | string
  avatar?: string
  createdAt?: string
  isEmailVerified?: boolean
}

export interface AuthResponse {
  message?: string
  email: string
  role: 'client' | 'lawyer'
  is_email_verified: boolean
  access: string
  refresh: string
  accessToken?: string
  refreshToken?: string
  user?: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface LawyerRegisterInput {
  fullName: string
  phoneNumber: string
  gender: 'male' | 'female' | 'other'
  documentType: string
  citizenshipNumber: string
  citizenshipPhotoFront: File
  citizenshipPhotoBack: File
}

export interface Address {
  province: number
  district: number
  municipality: number
  ward: number
}

export interface LawyerVerification {
  full_name: string
  date_of_birth: string
  bar_id: string
  gender: string
  license_photo: string
}

export interface FirmVerification {
  firm_name: string
  owner_name: string
  firm_id: string
  firm_license: string
}

export interface LawyerSignupInput {
  email: string
  password: string
  client_type: 'web' | 'mobile'
  services: string[]
  address: Address
  verification: LawyerVerification
}

export interface LawFirmSignupInput {
  email: string
  password: string
  client_type: 'web' | 'mobile'
  services: string[]
  address: Address
  verification: FirmVerification
}

export interface UserRegisterInput {
  email: string
  password: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  new_password: string
  confirm_password: string
}

export interface VerifyForgotPasswordOtpInput {
  email: string
  otp: string
}

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

export interface ClientVerificationStatus {
  id?: string
  full_name: string
  date_of_birth: string
  id_type: 'NATIONAL_ID' | 'PASSPORT'
  status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED'
  rejection_reason?: string | null
  passport_size_photo: FileReference
  photo_front: FileReference
  photo_back: FileReference
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export interface AuthError {
  code: string
  message: string
  statusCode: number
}
