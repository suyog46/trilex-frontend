import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { LoginInput } from '~/lib/validations/auth'
import { authApi } from '~/composables/api/auth.api'
import { useAuthStore } from '~/stores/auth'

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export const useAuthQueries = () => {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  const loginMutation = useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.setAuth(data.token, data.user)
      queryClient.setQueryData(["me"], data.user)
      navigateTo("/")
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  })

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!authStore.token,
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      authStore.logout()
      queryClient.clear()
    },
  })

  return {
    loginMutation,  
    registerMutation,
    meQuery,
    logoutMutation,
  }
}
