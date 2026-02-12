# Verification Forms - Error Handling Integration

## Updated Components

All three verification form components have been updated to use the error handler with toast notifications:

### 1. LawyerVerificationForm.vue
- Imports `useErrorHandler` composable
- Uses `handleFormErrors()` in catch block
- Displays field-specific errors on form fields
- Shows general errors as toast notifications

### 2. ClientVerificationForm.vue
- Imports `useErrorHandler` composable
- Uses `handleFormErrors()` in catch block
- Displays field-specific errors on form fields
- Shows general errors as toast notifications

### 3. FirmVerificationForm.vue
- Imports `useErrorHandler` composable
- Uses `handleFormErrors()` in catch block
- Displays field-specific errors on form fields
- Shows general errors as toast notifications

## Changes Made

### Before
```typescript
catch (e: any) {
  toast.error(e.message || 'Error occurred')
}
```

### After
```typescript
catch (error: any) {
  // Use error handler to parse Django errors
  const generalErrors = handleFormErrors(
    error,
    { setFieldError },
    (generalError) => {
      toast.error(generalError)
    }
  )
  
  // If no general errors, show generic message
  if (generalErrors.length === 0) {
    toast.error(error?.message || 'Failed to submit verification')
  }
}
```

## How It Works

1. **Field-Level Errors**: When Django returns validation errors for specific fields (e.g., `email`, `password`), they're automatically set on the form fields using `setFieldError()`
2. **General Errors**: Non-field errors (like `detail` or `non_field_errors`) are displayed as toast notifications
3. **Nested Errors**: Nested object errors (e.g., `address.city`) are automatically handled and displayed correctly

## Django Error Format Handling

The error handler supports all Django error formats:

```javascript
// Simple field errors
{ "firm_name": ["This field is required"] }

// Multiple errors per field
{ "bar_id": ["Invalid format", "Too short"] }

// Nested object errors
{ 
  "verification": {
    "license_photo": ["Invalid file type"]
  }
}

// Mixed errors with general message
{
  "firm_name": ["Required"],
  "detail": "Verification failed"
}
```

## Usage Pattern

Each verification form now:
1. Imports the error handler: `import { useErrorHandler } from '~/composables/useErrorHandler'`
2. Initializes it in setup: `const { handleFormErrors } = useErrorHandler()`
3. Gets `setFieldError` from useForm: `const { handleSubmit, setFieldValue, setFieldError } = useForm(...)`
4. Uses it in catch block to parse and display errors

## Testing

To test error handling:

1. Submit a verification form with invalid data
2. Django will return field-specific errors
3. Errors display as:
   - **Form field errors**: Red text below each field
   - **General errors**: Toast notifications at the bottom of screen

## Example: Field Error Display

```vue
<FormField v-slot="{ componentField }" name="firmName">
  <FormItem>
    <FormLabel>Firm Name</FormLabel>
    <FormControl>
      <Input v-bind="componentField" />
    </FormControl>
    <FormMessage /> <!-- Shows error from setFieldError -->
  </FormItem>
</FormField>
```

When Django returns `{ "firm_name": ["This field is required"] }`, it will:
1. Set the error on the field using `setFieldError('firmName', 'This field is required')`
2. The `<FormMessage />` component will display the error
3. Toast notifications show any non-field errors

## Benefits

**Consistent Error Handling**: Same pattern across all forms
**Better UX**: Field-specific errors + general toasts
**Django Compatible**: Handles all Django error formats
**Type Safe**: Full TypeScript support
**Reusable**: Use in any form component
