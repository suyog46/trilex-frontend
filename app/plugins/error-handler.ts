/**
 * Error Handler Plugin
 * Registers the useErrorHandler composable globally in the Nuxt app
 */

export default defineNuxtPlugin(() => {
  // The useErrorHandler composable is available globally via auto-imports
  // This plugin ensures it's properly registered with the app
  
  return {
    provide: {
      // Re-export for explicit access if needed
      errorHandler: useErrorHandler(),
    }
  }
})
