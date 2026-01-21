import { useAuthStore } from '~/stores/auth'

let _apiFetch: ReturnType<typeof $fetch.create> | null = null

export const useApiFetch = () => {
  if (!_apiFetch) {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    _apiFetch = $fetch.create({
      baseURL: config.public.apiBase,
      onRequest({ options }) {
        const token = authStore.accessToken 
        if (token) {
          if (!options.headers) {
            options.headers = new Headers()
          }
          if (options.headers instanceof Headers) {
            options.headers.set('Authorization', `Bearer ${token}`)
          } else {
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
          }
        }
      },
      onResponseError({ response }) {
        if (response.status === 401) {
          authStore.logout()
        }
      },
    })
  }

  return _apiFetch
}
