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

const parseDjangoErrors = (errorData: DjangoErrorResponse): FormattedError[] => {
  const errors: FormattedError[] = []

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
      errors.push({
        field,
        message: messages.join(', '),
      })
    } else if (typeof messages === 'object' && messages !== null) {
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
      errors.push({
        field,
        message: messages,
      })
    }
  })

  return errors
}

export const handleVeeValidateErrors = (
  error: any,
  form: FormContext,
  onGeneralError?: (message: string) => void
) => {
  const errors: string[] = []

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
          errors.push(message)
        } else {
          form.setFieldError(field, message)
        }
      })
    } else if (typeof errorData === 'string') {
      errors.push(errorData)
    }

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

  const handleErrorWithToast = (
    error: any,
    options?: {
      form?: FormContext
      showToast?: boolean
      customMessages?: Record<string, string>
    }
  ) => {
    const result = parseError(error)

    if (options?.form) {
      result.formErrors.forEach((message, field) => {
        options.form!.setFieldError(field, message)
      })
    }

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

  
  const getFieldError = (
    error: any,
    fieldName: string
  ): string | null => {
    const result = parseError(error)
    return result.formErrors.get(fieldName) || null
  }


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
