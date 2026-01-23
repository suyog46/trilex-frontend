import { useAuthStore } from '~/stores/auth'

export const useApiFetch = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Always read fresh token from store
      let token = null
      if (authStore.accessToken) {
        token = typeof authStore.accessToken === 'object' && 'value' in authStore.accessToken 
          ? (authStore.accessToken as any).value 
          : authStore.accessToken
      }
      
      console.log('🌐 API Request to:', request, {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NONE',
        accessTokenStore: authStore.accessToken ? `exists (${typeof authStore.accessToken})` : 'empty'
      })
      
      if (token) {
        if (!options.headers) {
          options.headers = new Headers()
        }
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token}`)
        } else {
          (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
        }
        console.log('✅ Authorization header set')
      } else {
        console.warn('⚠️ No token found, request will fail with 403')
      }
    },
    onResponseError({ response }) {
      console.error('❌ API Error:', response.status, response.statusText)
      if (response.status === 401) {
        authStore.logout()
      }
    },
  })

  return apiFetch
}
