import { ref } from 'vue'
import type { Method } from 'axios'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'

interface ApiRequestParams {
  url: string
  method?: Method
  body?: unknown
  query?: Record<string, unknown>
  formData?: boolean
}

// The API's list filters (Users.list, Orders.list, etc.) expect an array of
// {key, value} pairs, not a plain object — sending an object makes `filters.forEach`
// throw inside an unhandled async route handler, which hangs the request forever.
export function toFilterArray(filters: Record<string, unknown>): { key: string; value: unknown }[] {
  return Object.entries(filters)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => ({ key, value }))
}

// Reactive replacement for the React app's callback-based ApiRequest (src/GlobalFunctions.tsx).
// Use `data`/`loading`/`error` for list/detail views, or await `execute()` directly for one-off submits.
export function useApiRequest<T = unknown>() {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  const execute = async ({ url, method = 'GET', body = null, query, formData = false }: ApiRequestParams) => {
    loading.value = true
    error.value = null

    const headers: Record<string, string> = {}
    if (formData) {
      headers['Content-Type'] = 'multipart/form-data'
    }

    try {
      const response = await api.request<T>({
        url,
        method,
        headers,
        params: query,
        data: body,
      })
      data.value = response.data
      return response.data
    } catch (err) {
      error.value = err
      Notify.create({
        type: 'negative',
        message: 'Ocurrió un error al comunicarse con el servidor.',
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
