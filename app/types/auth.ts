/**
 * Authentication Types
 * Centralized type definitions for auth flow
 */

export enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  USER = 'user',
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
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

export interface UserRegisterInput {
  email: string
  password: string
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
