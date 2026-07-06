<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApiRequest } from '@/composables/useApiRequest'

interface UserDetails {
  name?: string
  lastname?: string
  image?: string
}

const router = useRouter()
const auth = useAuthStore()
const { data: userDetails, execute: fetchUserDetails } = useApiRequest<UserDetails>()

onMounted(() => {
  if (auth.isLoggedIn) {
    fetchUserDetails({ url: '/users/details' })
  }
})

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div v-if="auth.isLoggedIn" style="flex-shrink: 0">
    <q-btn flat no-caps class="text-white" no-wrap>
      <div class="row items-center no-wrap q-gutter-sm">
        <span class="account_menu_name">{{ userDetails?.name }} {{ userDetails?.lastname }}</span>
        <q-avatar size="32px" color="grey-4">
          <img v-if="userDetails?.image" :src="userDetails.image" />
          <q-icon v-else name="person" />
        </q-avatar>
      </div>
      <q-menu>
        <q-list style="min-width: 180px">
          <q-item to="/cuenta" clickable v-close-popup>
            <q-item-section>Mi cuenta</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup @click="logout">
            <q-item-section>Cerrar sesión</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <q-btn v-else unelevated color="white" text-color="primary" label="Iniciar sesión" to="/login" />
</template>
