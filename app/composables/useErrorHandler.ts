/**
 * Error Handler Composable
 * Handles Django API errors and formats them for use across the application
 * Supports both vee-validate forms and custom error handling
 */

import type { FormContext } from 'vee-validate'
import { toast } from 'vue-sonner'

export interface DjangoErrorResponse {
  [key: string]: string[] | string | Record<string, string[] | string>
}

export interface FormattedError {
  field: string
  message: string
}

export interface ErrorHandlerResult {
  formErrors: Map<string, string>
  generalErrors: string[]
  hasErrors: boolean
}

/**
 * Parse Django error response into structured format
 * Django typically returns errors as:
 * {
 *   "field_name": ["error message 1", "error message 2"],
 *   "nested_field": {
 *     "sub_field": ["error message"]
 *   },
 *   "error": "error message",
 *   "message": "error message",
 *   "detail": "error message",
 *   "non_field_errors": ["error message"]
 * }
 */
const parseDjangoErrors = (errorData: DjangoErrorResponse): FormattedError[] => {
  const errors: FormattedError[] = []

  // Handle top-level error/message/detail keys first
  if (errorData.error && typeof errorData.error === 'string') {
    errors.push({
      field: 'detail',
      message: errorData.error,
    })
    return errors
  }

  if (errorData.message && typeof errorData.message === 'string') {
    errors.push({
      field: 'detail',
      message: errorData.message,
    })
    return errors
  }

  if (errorData.detail && typeof errorData.detail === 'string') {
    errors.push({
      field: 'detail',
      message: errorData.detail,
    })
    return errors
  }

  Object.entries(errorData).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      // Simple array of error messages
      errors.push({
        field,
        message: messages.join(', '),
      })
    } else if (typeof messages === 'object' && messages !== null) {
      // Nested object (for nested serializers or complex fields)
      Object.entries(messages).forEach(([subField, subMessages]) => {
        const nestedField = `${field}.${subField}`
        const message = Array.isArray(subMessages)
          ? subMessages.join(', ')
          : String(subMessages)
        
        errors.push({
          field: nestedField,
          message,
        })
      })
    } else if (typeof messages === 'string') {
      // Single error message as string
      errors.push({
        field,
        message: messages,
      })
    }
  })

  return errors
}

/**
 * Handle errors for vee-validate forms
 * Sets field-specific errors on the form instance
 * 
 * @param error - The error object from API response
 * @param form - The vee-validate form instance
 * @param onGeneralError - Optional callback for non-field errors (like "detail" or "non_field_errors")
 */
export const handleVeeValidateErrors = (
  error: any,
  form: FormContext,
  onGeneralError?: (message: string) => void
) => {
  const errors: string[] = []

  try {
    // Handle different error response formats from Django
    const errorData = error?.data || error?.response?.data || error

    if (typeof errorData === 'object' && errorData !== null) {
      const parsedErrors = parseDjangoErrors(errorData)

      // Separate field errors from general errors
      parsedErrors.forEach(({ field, message }) => {
        if (
          field === 'detail' ||
          field === 'non_field_errors' ||
          field === 'message'
        ) {
          // General errors
          errors.push(message)
        } else {
          // Field-specific errors
          form.setFieldError(field, message)
        }
      })
    } else if (typeof errorData === 'string') {
      errors.push(errorData)
    }

    // Call general error callback if provided
    if (errors.length > 0 && onGeneralError) {
      errors.forEach(onGeneralError)
    }

    return errors
  } catch (parseError) {
    console.error('Error parsing Django error response:', parseError)
    const generalMessage = error?.message || 'An error occurred'
    if (onGeneralError) {
      onGeneralError(generalMessage)
    }
    return [generalMessage]
  }
}

/**
 * Generic error handler for any error response
 * Returns structured error information
 * 
 * @param error - The error object from API response
 */
export const parseApiError = (error: any): ErrorHandlerResult => {
  const formErrors = new Map<string, string>()
  const generalErrors: string[] = []

  try {
    const errorData = error?.data || error?.response?.data || error

    if (typeof errorData === 'object' && errorData !== null) {
      const parsedErrors = parseDjangoErrors(errorData)

      parsedErrors.forEach(({ field, message }) => {
        if (
          field === 'detail' ||
          field === 'non_field_errors' ||
          field === 'message'
        ) {
          generalErrors.push(message)
        } else {
          formErrors.set(field, message)
        }
      })
    } else if (typeof errorData === 'string') {
      generalErrors.push(errorData)
    } else {
      generalErrors.push(error?.message || 'An unexpected error occurred')
    }
  } catch (parseError) {
    console.error('Error parsing API error response:', parseError)
    generalErrors.push('An unexpected error occurred')
  }

  return {
    formErrors,
    generalErrors,
    hasErrors: formErrors.size > 0 || generalErrors.length > 0,
  }
}

/**
 * Composable hook for error handling
 * Provides easy access to error parsing and handling utilities
 */
export const useErrorHandler = () => {
  const handleFormErrors = (
    error: any,
    form: FormContext,
    onGeneralError?: (message: string) => void
  ) => {
    return handleVeeValidateErrors(error, form, onGeneralError)
  }

  const parseError = (error: any) => {
    return parseApiError(error)
  }

  /**
   * Handle errors and show toast notifications
   * Uses vue-sonner toast directly
   */
  const handleErrorWithToast = (
    error: any,
    options?: {
      form?: FormContext
      showToast?: boolean
      customMessages?: Record<string, string>
    }
  ) => {
    const result = parseError(error)

    // Set field errors if form is provided
    if (options?.form) {
      result.formErrors.forEach((message, field) => {
        options.form!.setFieldError(field, message)
      })
    }

    // Show toast notification for general errors
    if (options?.showToast !== false) {
      result.generalErrors.forEach((message) => {
        const customMessage = options?.customMessages?.[message]
        if (customMessage) {
          toast.error(customMessage)
        } else {
          toast.error(message)
        }
      })
    }

    return result
  }

  /**
   * Get field-specific error message
   */
  const getFieldError = (
    error: any,
    fieldName: string
  ): string | null => {
    const result = parseError(error)
    return result.formErrors.get(fieldName) || null
  }

  /**
   * Get all error messages as string array
   */
  const getAllErrors = (error: any): string[] => {
    const result = parseError(error)
    const allErrors = Array.from(result.formErrors.values())
    return [...allErrors, ...result.generalErrors]
  }

  return {
    handleFormErrors,
    parseError,
    handleErrorWithToast,
    getFieldError,
    getAllErrors,
    parseDjangoErrors,
  }
}
