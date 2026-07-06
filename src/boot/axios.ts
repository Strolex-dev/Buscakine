import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.ltkn) {
    config.headers.set('ltkn', auth.ltkn)
  }
  if (auth.store_id) {
    config.headers.set('store_id', auth.store_id)
  }

  return config
})
