import { defineStore } from 'pinia'

export interface AuthUser {
  user_id?: number
  name?: string
  email?: string
  [key: string]: unknown
}

interface AuthState {
  ltkn: string | null
  role_id: number | null
  store_id: string | null
  email: string | null
  user: AuthUser | null
}

// role_id: 1 = patient, 2 = kinesiólogo, 100 = admin (mirrors the React app's role_id convention)
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    ltkn: null,
    role_id: null,
    store_id: null,
    email: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.ltkn,
    isPatient: (state) => state.role_id === 1,
    isKinesiologo: (state) => state.role_id === 2,
    isAdmin: (state) => state.role_id === 100,
  },

  actions: {
    login(payload: { ltkn: string; role_id: number; store_id?: string; email: string; user?: AuthUser }) {
      this.ltkn = payload.ltkn
      this.role_id = payload.role_id
      this.store_id = payload.store_id ?? null
      this.email = payload.email
      this.user = payload.user ?? null
    },

    logout() {
      this.ltkn = null
      this.role_id = null
      this.store_id = null
      this.email = null
      this.user = null
    },
  },

  persist: true,
})
