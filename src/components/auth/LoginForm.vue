<script setup lang="ts">
import { reactive, ref } from 'vue'
import { signInWithPopup } from 'firebase/auth'
import { Notify } from 'quasar'
import { auth, googleProvider } from '@/boot/firebase'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import AppBox from '@/components/shared/AppBox.vue'
import logo from '@/assets/logo_alt.png'

const emit = defineEmits<{
  'go-signup': []
  'go-forgot-pass': []
}>()

const authStore = useAuthStore()
const loading = ref(false)

const loginData = reactive({ email: '', password: '' })

interface AuthResponse {
  status: string
  message: string
  user_info: { ltkn: string; user_name: string; role_id: number }
}

async function signIn() {
  loading.value = true
  try {
    const { data } = await api.get<AuthResponse>('/users/auth', {
      params: { email: loginData.email, password: loginData.password },
    })
    if (data.status === 'success') {
      Notify.create({ type: 'positive', message: data.message })
      authStore.login({ ltkn: data.user_info.ltkn, role_id: Number(data.user_info.role_id), email: loginData.email })
      window.location.href = '/'
    } else {
      Notify.create({ type: 'negative', message: data.message })
    }
  } finally {
    loading.value = false
  }
}

async function signInWithGoogle() {
  loading.value = true
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    const user = cred.user
    const { data } = await api.post<AuthResponse>('/users/google-auth', {
      email: user.email,
      name: user.displayName,
      google_id: user.uid,
    })
    if (data.status === 'success') {
      Notify.create({ type: 'positive', message: data.message })
      authStore.login({ ltkn: data.user_info.ltkn, role_id: Number(data.user_info.role_id), email: user.email ?? '' })
      window.location.href = '/'
    } else {
      Notify.create({ type: 'negative', message: data.message })
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error al iniciar sesión con Google' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppBox box-class="intent-auth_component" id="loginBox">
    <img class="loginLogo" :src="logo" />

    <form class="form" @submit.prevent="signIn">
      <q-input v-model="loginData.email" label="Email" type="text" autocomplete="email" outlined dense required />
      <q-input
        v-model="loginData.password"
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        outlined
        dense
        required
      />

      <q-btn type="submit" :loading="loading" unelevated color="primary" label="INICIAR SESIÓN" style="width: 100%" />

      <q-btn
        outline
        color="primary"
        icon="fa-brands fa-google"
        label="Iniciar sesión con Google"
        :loading="loading"
        :disable="loading"
        style="width: 100%; margin-top: 10px"
        @click="signInWithGoogle"
      />

      <q-btn
        unelevated
        color="secondary"
        label="CREAR CUENTA"
        style="width: 100%; margin-top: 10px"
        @click="emit('go-signup')"
      />

      <div class="intent-auth_links">
        <q-btn flat dense no-caps label="¿Olvidaste tu contraseña?" @click="emit('go-forgot-pass')" />
      </div>
    </form>
  </AppBox>
</template>
