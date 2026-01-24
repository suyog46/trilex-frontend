/**
 * Error Handling Types
 * Type definitions for the error handling system
 */

/**
 * Django's error response format
 * Can be flat or nested
 */
export interface DjangoErrorResponse {
  [key: string]: string[] | string | Record<string, string[] | string>
}

/**
 * Formatted error with field and message
 */
export interface FormattedError {
  field: string
  message: string
}

/**
 * Result of parsing an error
 * Contains categorized field and general errors
 */
export interface ErrorHandlerResult {
  /** Map of field names to error messages */
  formErrors: Map<string, string>
  /** Array of general/non-field errors */
  generalErrors: string[]
  /** Whether any errors were found */
  hasErrors: boolean
}

/**
 * Enhanced API error with typed structure
 */
export interface ApiErrorData {
  status: number
  data: any
  statusText: string
  message: string
}

/**
 * Options for handleErrorWithToast
 */
export interface HandleErrorOptions {
  /** Form context from vee-validate (optional) */
  form?: any
  /** Whether to show toast notifications (default: true) */
  showToast?: boolean
  /** Custom messages to map to errors */
  customMessages?: Record<string, string>
}

/**
 * Authentication error response type
 * Extends the standard error with auth-specific fields
 */
export interface AuthError {
  code: string
  message: string
  statusCode: number
  formErrors?: Map<string, string>
  details?: Record<string, any>
}

/**
 * Options for form error handling
 */
export interface FormErrorOptions {
  /** Callback for general/non-field errors */
  onGeneralError?: (message: string) => void
  /** Whether to log errors to console */
  debug?: boolean
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: any): error is ApiErrorData {
  return (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'data' in error &&
    typeof error.status === 'number'
  )
}

/**
 * Type guard to check if error has Django error response format
 */
export function isDjangoErrorResponse(
  error: any
): error is DjangoErrorResponse {
  if (!error || typeof error !== 'object') return false
  
  // Check if error has typical Django error structure
  const values = Object.values(error)
  return values.some(v => 
    Array.isArray(v) || 
    (typeof v === 'object' && v !== null)
  )
}

/**
 * Type for vee-validate form context
 */
export interface FormContext {
  setFieldError: (field: string, message: string) => void
  resetForm: () => void
  setValues: (values: Record<string, any>) => void
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldTouched: (field: string, touched: boolean) => void
}
