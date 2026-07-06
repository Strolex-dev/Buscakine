import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const roles = to.meta.roles
    if (!roles) return true

    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (auth.role_id === null || !roles.includes(auth.role_id)) {
      return { name: 'home' }
    }
    return true
  })
}
