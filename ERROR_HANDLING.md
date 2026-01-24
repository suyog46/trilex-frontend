# Error Handling System Documentation

## Overview

This error handling system is designed to work with Django's error response format and provides utilities for handling form validation errors, API errors, and general application errors throughout the Nuxt frontend.

## Django Error Format

Django typically returns errors in the following format:

```json
{
  "field_name": ["error message 1", "error message 2"],
  "email": ["This field may not be blank."],
  "password": ["Ensure this field has at least 8 characters."],
  "nested_object": {
    "sub_field": ["Error in nested field"]
  },
  "detail": "General error message",
  "non_field_errors": ["General validation error"]
}
```

## Available Functions

### 1. `useErrorHandler()` - Main Composable

The main composable provides all error handling utilities:

```typescript
const {
  handleFormErrors,      // Set errors on vee-validate forms
  parseError,           // Parse any error into structured format
  handleErrorWithToast, // Parse error and show toast notifications
  getFieldError,        // Get specific field error message
  getAllErrors,         // Get all errors as string array
  parseDjangoErrors,    // Parse Django error response
} = useErrorHandler()
```

## Usage Examples

### Example 1: Handle Form Errors with vee-validate

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema, type LoginInput } from '~/lib/validations/auth'
import { useErrorHandler } from '~/composables/useErrorHandler'

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const { handleFormErrors } = useErrorHandler()

const onSubmit = handleSubmit(async (values: LoginInput) => {
  try {
    const authStore = useAuthStore()
    const res = await authStore.login(values)
    // Handle success...
  } catch (error) {
    // Handle Django validation errors and set them on form fields
    handleFormErrors(error, { ...useForm() }, (generalError) => {
      console.log('General error:', generalError)
      toast.error(generalError)
    })
  }
})
</script>
```

### Example 2: Parse Error and Display Field-Specific Errors

```vue
<script setup lang="ts">
import { useErrorHandler } from '~/composables/useErrorHandler'

const { parseError, getFieldError } = useErrorHandler()

const register = async () => {
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: formData
    })
  } catch (error) {
    // Parse error into structured format
    const result = parseError(error)
    
    // Get specific field error
    const emailError = getFieldError(error, 'email')
    if (emailError) {
      console.log('Email error:', emailError)
    }
    
    // Show all general errors
    result.generalErrors.forEach(msg => toast.error(msg))
  }
}
</script>
```

### Example 3: Handle Errors with Toast Notifications

```typescript
const { handleErrorWithToast } = useErrorHandler()

const updateProfile = async (data: any) => {
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      body: data
    })
  } catch (error) {
    // Parse error, set form fields, and show toasts
    handleErrorWithToast(error, {
      showToast: true,
      customMessages: {
        'User already exists': 'This email is already registered'
      }
    })
  }
}
```

### Example 4: Get All Errors as Array

```typescript
const { getAllErrors } = useErrorHandler()

try {
  // API call
} catch (error) {
  const errors = getAllErrors(error)
  // errors = ['Email is required', 'Password too weak', 'Email already exists']
  errors.forEach(msg => console.log(msg))
}
```

### Example 5: Complex Nested Errors

```vue
<script setup lang="ts">
import { useErrorHandler } from '~/composables/useErrorHandler'

const { parseError } = useErrorHandler()

// Django response with nested serializer errors:
// {
//   "address": {
//     "city": ["City is required"],
//     "postal_code": ["Invalid postal code"]
//   },
//   "services": ["At least one service required"]
// }

const submitForm = async () => {
  try {
    await submitData()
  } catch (error) {
    const result = parseError(error)
    
    // Access nested errors
    const cityError = result.formErrors.get('address.city') // "City is required"
    const postalError = result.formErrors.get('address.postal_code')
    
    result.formErrors.forEach((message, field) => {
      console.log(`${field}: ${message}`)
    })
  }
}
</script>
```

### Example 6: Integration with Auth Store

Update your auth store's login method to use the error handler:

```typescript
// In stores/auth.ts
const login = async (credentials: LoginInput) => {
  isLoading.value = true
  try {
    const res = await authApi.login(credentials)
    // Handle success...
  } catch (err) {
    const { parseError } = useErrorHandler()
    const result = parseError(err)
    
    error.value = {
      code: err?.status || 'UNKNOWN_ERROR',
      message: result.generalErrors[0] || err?.message || 'Login failed',
      statusCode: err?.status || 500,
      formErrors: result.formErrors
    }
  } finally {
    isLoading.value = false
  }
}
```

### Example 7: Component-Level Error Handling

```vue
<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div>
      <label>Email</label>
      <input v-model="email" type="email" />
      <span v-if="emailError" class="error">{{ emailError }}</span>
    </div>
    
    <div>
      <label>Password</label>
      <input v-model="password" type="password" />
      <span v-if="passwordError" class="error">{{ passwordError }}</span>
    </div>
    
    <button type="submit">Login</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useErrorHandler } from '~/composables/useErrorHandler'

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

const { parseError, getFieldError } = useErrorHandler()

const onSubmit = async () => {
  try {
    const response = await $fetch('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
  } catch (error) {
    emailError.value = getFieldError(error, 'email') || ''
    passwordError.value = getFieldError(error, 'password') || ''
    
    const result = parseError(error)
    result.generalErrors.forEach(msg => {
      console.log('General error:', msg)
    })
  }
}
</script>
```

## Error Format Conversion

The system automatically converts Django error responses to a structured format:

### Input (Django Response):
```json
{
  "email": ["This field may not be blank."],
  "password": ["Ensure this field has at least 8 characters."],
  "address": {
    "city": ["City must be selected"]
  },
  "detail": "Invalid credentials"
}
```

### Output (Parsed Result):
```typescript
{
  formErrors: Map {
    "email" => "This field may not be blank.",
    "password" => "Ensure this field has at least 8 characters.",
    "address.city" => "City must be selected"
  },
  generalErrors: ["Invalid credentials"],
  hasErrors: true
}
```

## TypeScript Types

```typescript
interface DjangoErrorResponse {
  [key: string]: string[] | string | Record<string, string[] | string>
}

interface FormattedError {
  field: string
  message: string
}

interface ErrorHandlerResult {
  formErrors: Map<string, string>
  generalErrors: string[]
  hasErrors: boolean
}

class ApiError extends Error {
  status: number
  data: any
  statusText: string
}
```

## Best Practices

1. **Always wrap API calls in try-catch**: Ensures all errors are caught and handled
2. **Use appropriate error level**: Use form errors for field-specific issues, general errors for app-level issues
3. **Provide user feedback**: Always show toast notifications or error messages to users
4. **Log errors**: Always log errors to console for debugging
5. **Handle nested errors**: Account for nested serializer errors from Django
6. **Clean up old errors**: Clear error state when form resets or user navigates away

## Integration Checklist

- [x] Created `useErrorHandler.ts` composable
- [x] Updated `useApiFetch.ts` with better error handling
- [x] Created error handler plugin
- [x] Supports vee-validate form integration
- [x] Handles nested object errors
- [x] Type-safe TypeScript support
- [ ] Update all forms to use new error handling
- [ ] Update all API calls to use new error handling
- [ ] Add global error boundary (optional)
- [ ] Add error logging service (optional)

## Next Steps

1. Update existing forms to use `handleFormErrors()`
2. Update auth store to use the error handler
3. Create error boundary component for unhandled errors
4. Add error logging/tracking service (Sentry, LogRocket, etc.)
